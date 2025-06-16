import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
} from 'rxjs/operators';
import { HOME_CONSTANTS } from '../home.constants';
import { IonicInputEvent, InputValidationResult } from '../home.interfaces';
import { HomeStateService } from '../services/home-state.service';

/**
 * Handler responsible for input processing and validation
 * Manages all input-related logic including validation, filtering, and reactive processing
 */
@Injectable({
  providedIn: 'root',
})
export class InputHandler {
  // ================================================================
  // PRIVATE PROPERTIES
  // ================================================================

  /**
   * Subject for input changes to implement debouncing
   */
  private readonly inputChange$ = new Subject<string>();

  // ================================================================
  // CONSTRUCTOR
  // ================================================================

  constructor(private readonly stateService: HomeStateService) {}

  // ================================================================
  // PUBLIC METHODS
  // ================================================================

  /**
   * Processes input events from the ion-input field
   * @param event - The Ionic input event
   * @returns Validation result with filtered value
   */
  processInput(event: IonicInputEvent): InputValidationResult {
    const validationResult = this.validateAndFilterInput(event);

    // Update state
    this.stateService.setInputModel(validationResult.filteredValue);

    // Emit to input change stream for reactive processing
    this.inputChange$.next(validationResult.filteredValue);

    return validationResult;
  }

  /**
   * Updates input model from voice input
   * @param value - The value to set
   */
  updateFromVoice(value: string): void {
    const filteredValue = this.filterTranscript(value);
    this.stateService.setInputModel(filteredValue);
    this.inputChange$.next(filteredValue);
  }

  /**
   * Resets input state
   */
  resetInput(): void {
    this.stateService.resetInputState();
    this.inputChange$.next('');
  }

  /**
   * Sets up input processing streams with debouncing
   * @param destroy$ - Subject for cleanup
   */
  setupInputProcessingStreams(destroy$: Subject<void>): void {
    this.setupInputValidationStream(destroy$);
    this.setupInputProcessingStream(destroy$);
  }

  /**
   * Gets the input change observable
   */
  getInputChange$(): Observable<string> {
    return this.inputChange$.asObservable();
  }

  /**
   * Cleanup method
   */
  cleanup(): void {
    this.inputChange$.complete();
  }

  // ================================================================
  // PRIVATE VALIDATION METHODS
  // ================================================================

  /**
   * Validates and filters input from the ion-input field
   * @param event - The Ionic input event
   * @returns Validation result with filtered value
   */
  private validateAndFilterInput(
    event: IonicInputEvent
  ): InputValidationResult {
    const value: string = String(event.target.value ?? '');
    const filteredValue: string = value.replace(
      HOME_CONSTANTS.INPUT.ALLOWED_CHARACTERS_REGEX,
      ''
    );

    return {
      isValid: filteredValue.length <= HOME_CONSTANTS.INPUT.MAX_LENGTH,
      filteredValue,
      errorMessage:
        filteredValue.length > HOME_CONSTANTS.INPUT.MAX_LENGTH
          ? 'Exceeded max length'
          : undefined,
    };
  }

  /**
   * Filters transcript to allowed length
   * @param transcript - Raw transcript
   * @returns Filtered transcript
   */
  private filterTranscript(transcript: string): string {
    return transcript.slice(0, HOME_CONSTANTS.VOICE.MAX_TRANSCRIPT_LENGTH);
  }

  /**
   * Validates input length
   * @param input - Input to validate
   * @returns True if valid length
   */
  private validateInputLength(input: string): boolean {
    return input.length <= HOME_CONSTANTS.INPUT.MAX_LENGTH;
  }

  /**
   * Validates input in background (for reactive processing)
   * @param input - Input to validate
   */
  private validateInputInBackground(input: string): void {
    if (input.length > HOME_CONSTANTS.INPUT.MAX_LENGTH * 0.8) {
      console.info('Input approaching maximum length');
    }
  }

  /**
   * Validates if input is suitable for encryption
   * @param input - Input to validate
   * @returns True if valid for encryption
   */
  isValidInputForEncryption(input: string): boolean {
    return Boolean(
      input &&
        input.trim().length > 0 &&
        input.length <= HOME_CONSTANTS.INPUT.MAX_LENGTH
    );
  }

  // ================================================================
  // PRIVATE STREAM SETUP METHODS
  // ================================================================

  /**
   * Sets up input validation stream
   * @param destroy$ - Subject for cleanup
   */
  private setupInputValidationStream(destroy$: Subject<void>): void {
    this.inputChange$
      .pipe(
        debounceTime(300), // Debounce user input
        distinctUntilChanged(),
        map((input) => this.validateInputLength(input)),
        takeUntil(destroy$)
      )
      .subscribe((isValid) => {
        if (!isValid) {
          console.warn('Input exceeds maximum length');
        }
      });
  }

  /**
   * Sets up input processing stream with debouncing
   * @param destroy$ - Subject for cleanup
   */
  private setupInputProcessingStream(destroy$: Subject<void>): void {
    this.inputChange$
      .pipe(
        debounceTime(200), // Debounce input changes
        distinctUntilChanged(),
        filter((input) => input.length <= HOME_CONSTANTS.INPUT.MAX_LENGTH),
        takeUntil(destroy$)
      )
      .subscribe((input) => {
        this.validateInputInBackground(input);
      });
  }
}
