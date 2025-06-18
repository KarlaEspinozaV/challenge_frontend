import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VOICE_RECOGNITION_CONSTANTS } from './voice-recognition.constants';

/**
 * Service for managing voice recognition using Web Speech API.
 * Provides speech-to-text conversion with automatic timeout and character filtering.
 */
@Injectable({
  providedIn: 'root',
})
export class VoiceRecognitionService {
  /**
   * Web Speech API recognition instance
   * @private
   */
  private recognition: any;

  /**
   * Observable state for voice recognition active status
   * @private
   */
  private isListening = new BehaviorSubject<boolean>(false);

  /**
   * Observable containing recognized text transcript
   * @private
   */
  private transcript = new BehaviorSubject<string>('');

  /**
   * Timeout identifier for automatic recognition stopping
   * @private
   */
  private timeoutId: any;

  /**
   * Initializes the service and sets up Web Speech API
   */
  constructor() {
    this.init();
  }

  /**
   * Initializes Web Speech API with configuration and event handlers
   * @private
   */
  private init() {
    // Check browser compatibility
    if (VOICE_RECOGNITION_CONSTANTS.API.WEBKIT_SPEECH_RECOGNITION in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();

      // Configure recognition settings
      this.recognition.continuous =
        VOICE_RECOGNITION_CONSTANTS.RECOGNITION.CONTINUOUS;
      this.recognition.interimResults =
        VOICE_RECOGNITION_CONSTANTS.RECOGNITION.INTERIM_RESULTS;
      this.recognition.lang = VOICE_RECOGNITION_CONSTANTS.RECOGNITION.LANGUAGE;

      /**
       * Handles speech recognition results
       * @param event - Recognition result event
       */
      this.recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;

        // Filter unwanted characters
        const filteredTranscript = transcript.replace(
          VOICE_RECOGNITION_CONSTANTS.TEXT_PROCESSING.ALLOWED_CHARACTERS_REGEX,
          ''
        );

        this.transcript.next(filteredTranscript);

        // Auto-stop if max length reached
        if (
          filteredTranscript.length >=
          VOICE_RECOGNITION_CONSTANTS.TEXT_PROCESSING.MAX_LENGTH_BEFORE_STOP
        ) {
          this.stop();
        }
      };

      /**
       * Handles recognition errors
       * @param event - Error event
       */
      this.recognition.onerror = (event: any) => {
        console.error(
          VOICE_RECOGNITION_CONSTANTS.ERRORS.RECOGNITION_ERROR,
          event.error
        );
        this.stop();
      };

      /**
       * Handles recognition session end
       */
      this.recognition.onend = () => {
        this.isListening.next(false);
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
      };
    } else {
      console.error(VOICE_RECOGNITION_CONSTANTS.ERRORS.BROWSER_NOT_SUPPORTED);
    }
  }

  /**
   * Starts voice recognition with automatic timeout
   */
  start(): void {
    if (this.recognition) {
      this.recognition.start();
      this.isListening.next(true);

      // Set automatic timeout
      this.timeoutId = setTimeout(() => {
        this.stop();
      }, VOICE_RECOGNITION_CONSTANTS.TIMING.TIMEOUT_MS);
    }
  }

  /**
   * Stops voice recognition and cleans up resources
   */
  stop(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening.next(false);

      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
  }

  /**
   * Returns observable of listening state
   * @returns Observable<boolean> - true when listening, false when stopped
   */
  getIsListening(): Observable<boolean> {
    return this.isListening.asObservable();
  }

  /**
   * Returns observable of recognized text
   * @returns Observable<string> - filtered transcript text
   */
  getTranscript(): Observable<string> {
    return this.transcript.asObservable();
  }
}
