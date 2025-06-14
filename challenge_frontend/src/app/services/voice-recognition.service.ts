import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VoiceRecognitionService {
  private recognition: any;
  private isListening = new BehaviorSubject<boolean>(false);
  private transcript = new BehaviorSubject<string>('');

  constructor() {
    this.init();
  }

  private init() {
    // Check if the browser supports speech recognition
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES'; // Set language to Spanish

      this.recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        // Remove spaces and non-alphanumeric characters
        const filteredTranscript = transcript.replace(/[^a-zA-Z0-9]/g, '');
        this.transcript.next(filteredTranscript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.stop();
      };

      this.recognition.onend = () => {
        this.isListening.next(false);
      };
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }

  start(): void {
    if (this.recognition) {
      this.recognition.start();
      this.isListening.next(true);
    }
  }

  stop(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening.next(false);
    }
  }

  getIsListening(): Observable<boolean> {
    return this.isListening.asObservable();
  }

  getTranscript(): Observable<string> {
    return this.transcript.asObservable();
  }
}
