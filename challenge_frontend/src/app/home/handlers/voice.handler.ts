import { Injectable } from '@angular/core';
import { Subject, Observable, combineLatest, EMPTY, of } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  catchError,
  retry,
  switchMap,
  tap,
  startWith,
} from 'rxjs/operators';
import { VoiceRecognitionService } from '../../services/voice-recognition.service';
import { HomeStateService } from '../services/home-state.service';
import { InputHandler } from './input.handler';
import { HOME_CONSTANTS } from '../home.constants';

/**
 * Handler responsible for voice recognition processing
 * Manages all voice-related logic including subscriptions, transcript processing, and reactive streams
 */
@Injectable({
  providedIn: 'root',
})
export class VoiceHandler {
  // ================================================================
  // PRIVATE PROPERTIES
  // ================================================================

  /**
   * Subject for voice transcript processing
   */
  private readonly voiceTranscript$ = new Subject<string>();

  /**
   * Observable that combines listening state and input validity
   */
  public readonly canStartListening$: Observable<boolean>;

  // ================================================================
  // CONSTRUCTOR
  // ================================================================

  constructor(
    private readonly voiceRecognitionService: VoiceRecognitionService,
    private readonly stateService: HomeStateService,
    private readonly inputHandler: InputHandler
  ) {
    this.canStartListening$ = this.createCanStartListeningStream();
  }

  // ================================================================
  // PUBLIC METHODS
  // ================================================================

  /**
   * Toggles voice recognition listening state
   */
  toggleListening(): void {
    if (this.stateService.isListening) {
      this.stopVoiceRecognition();
    } else {
      this.startVoiceRecognition();
    }
  }

  /**
   * Starts voice recognition
   */
  startVoiceRecognition(): void {
    this.canStartListening$
      .pipe(
        filter((canStart) => canStart),
        switchMap(() => {
          this.voiceRecognitionService.start();
          return of(true);
        }),
        catchError((error) => {
          console.error('Error starting voice recognition:', error);
          return of(false);
        })
      )
      .subscribe();
  }

  /**
   * Stops voice recognition
   */
  stopVoiceRecognition(): void {
    this.voiceRecognitionService.stop();
  }

  /**
   * Stops voice recognition if currently active
   */
  stopVoiceRecognitionIfActive(): void {
    if (this.stateService.isListening) {
      this.stopVoiceRecognition();
    }
  }

  /**
   * Sets up voice recognition subscriptions using advanced Observable patterns
   * @param destroy$ - Subject for cleanup
   */
  setupVoiceRecognitionSubscriptions(destroy$: Subject<void>): void {
    this.subscribeToListeningStateWithErrorHandling(destroy$);
    this.subscribeToTranscriptWithRetry(destroy$);
    this.setupVoiceTranscriptStream(destroy$);
  }

  /**
   * Cleanup method
   */
  cleanup(): void {
    this.voiceTranscript$.complete();
  }

  // ================================================================
  // PRIVATE STREAM CREATION METHODS
  // ================================================================

  /**
   * Creates observable stream for determining if listening can start
   */
  private createCanStartListeningStream(): Observable<boolean> {
    return combineLatest([
      this.voiceRecognitionService.getIsListening().pipe(startWith(false)),
      this.inputHandler.getInputChange$().pipe(
        startWith(this.stateService.inputModel),
        map((input) => input.length < HOME_CONSTANTS.INPUT.MAX_LENGTH)
      ),
    ]).pipe(
      map(([isListening, hasSpace]) => !isListening && hasSpace),
      distinctUntilChanged()
    );
  }

  // ================================================================
  // PRIVATE SUBSCRIPTION METHODS
  // ================================================================

  /**
   * Subscribes to voice recognition listening state with error handling
   * @param destroy$ - Subject for cleanup
   */
  private subscribeToListeningStateWithErrorHandling(
    destroy$: Subject<void>
  ): void {
    this.voiceRecognitionService
      .getIsListening()
      .pipe(
        distinctUntilChanged(),
        catchError((error) => {
          console.error('Error in listening state stream:', error);
          return of(false); // Fallback to not listening
        }),
        takeUntil(destroy$)
      )
      .subscribe((isListening: boolean) => {
        this.stateService.setIsListening(isListening);
      });
  }

  /**
   * Subscribes to voice recognition transcript with retry logic
   * @param destroy$ - Subject for cleanup
   */
  private subscribeToTranscriptWithRetry(destroy$: Subject<void>): void {
    this.voiceRecognitionService
      .getTranscript()
      .pipe(
        filter((transcript) => Boolean(transcript && transcript.trim())),
        debounceTime(100), // Debounce rapid transcript updates
        distinctUntilChanged(),
        retry(3), // Retry up to 3 times on error
        catchError((error) => {
          console.error('Error in transcript stream:', error);
          return EMPTY; // Complete the stream on persistent error
        }),
        takeUntil(destroy$)
      )
      .subscribe((transcript: string) => {
        this.voiceTranscript$.next(transcript);
      });
  }

  /**
   * Sets up voice transcript processing stream
   * @param destroy$ - Subject for cleanup
   */
  private setupVoiceTranscriptStream(destroy$: Subject<void>): void {
    this.voiceTranscript$
      .pipe(
        map((transcript) => this.filterTranscript(transcript)),
        filter((filtered) => filtered.length > 0),
        tap((filtered) => this.inputHandler.updateFromVoice(filtered)),
        takeUntil(destroy$)
      )
      .subscribe();
  }

  // ================================================================
  // PRIVATE UTILITY METHODS
  // ================================================================

  /**
   * Filters transcript to allowed length
   * @param transcript - Raw transcript
   * @returns Filtered transcript
   */
  private filterTranscript(transcript: string): string {
    return transcript.slice(0, HOME_CONSTANTS.VOICE.MAX_TRANSCRIPT_LENGTH);
  }
}
