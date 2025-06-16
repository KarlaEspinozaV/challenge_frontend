import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VOICE_RECOGNITION_CONSTANTS } from './voice-recognition.constants';

@Injectable({
  providedIn: 'root',
})
export class VoiceRecognitionService {
  private recognition: any;
  private isListening = new BehaviorSubject<boolean>(false);
  private transcript = new BehaviorSubject<string>('');
  private timeoutId: any;

  constructor() {
    this.init();
  }

  private init() {
    if (VOICE_RECOGNITION_CONSTANTS.API.WEBKIT_SPEECH_RECOGNITION in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous =
        VOICE_RECOGNITION_CONSTANTS.RECOGNITION.CONTINUOUS;
      this.recognition.interimResults =
        VOICE_RECOGNITION_CONSTANTS.RECOGNITION.INTERIM_RESULTS;
      this.recognition.lang = VOICE_RECOGNITION_CONSTANTS.RECOGNITION.LANGUAGE;

      this.recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;

        const filteredTranscript = transcript.replace(
          VOICE_RECOGNITION_CONSTANTS.TEXT_PROCESSING.ALLOWED_CHARACTERS_REGEX,
          ''
        );
        this.transcript.next(filteredTranscript);

        if (
          filteredTranscript.length >=
          VOICE_RECOGNITION_CONSTANTS.TEXT_PROCESSING.MAX_LENGTH_BEFORE_STOP
        ) {
          this.stop();
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error(
          VOICE_RECOGNITION_CONSTANTS.ERRORS.RECOGNITION_ERROR,
          event.error
        );
        this.stop();
      };

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

  start(): void {
    if (this.recognition) {
      this.recognition.start();
      this.isListening.next(true);

      this.timeoutId = setTimeout(() => {
        this.stop();
      }, VOICE_RECOGNITION_CONSTANTS.TIMING.TIMEOUT_MS);
    }
  }

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

  getIsListening(): Observable<boolean> {
    return this.isListening.asObservable();
  }

  getTranscript(): Observable<string> {
    return this.transcript.asObservable();
  }
}
