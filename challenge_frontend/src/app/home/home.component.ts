import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonInput,
  IonLabel,
  IonButton,
  IonIcon,
  IonItem,
  IonPopover,
  IonContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mic } from 'ionicons/icons';
import CryptoJS from 'crypto-js';
import { VoiceRecognitionService } from '../services/voice-recognition.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonInput,
    IonLabel,
    IonButton,
    IonIcon,
    IonItem,
    IonPopover,
    IonContent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  inputModel = '';
  isOpen = false;
  encryptedText = '';
  decryptedText = '';
  showDecrypted = false;
  isListening = false;

  private secretKey: string = 'your-secret-key-here';
  private vector: string = 'your-vector-here';
  private subscriptions: Subscription[] = [];

  @ViewChild('ionInputEl', { static: true }) ionInputEl!: IonInput;
  @ViewChild('popover') popover!: HTMLIonPopoverElement;

  constructor(private voiceRecognitionService: VoiceRecognitionService) {
    addIcons({ mic });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.voiceRecognitionService.getIsListening().subscribe((isListening) => {
        this.isListening = isListening;
      })
    );

    this.subscriptions.push(
      this.voiceRecognitionService.getTranscript().subscribe((transcript) => {
        if (transcript) {
          const filteredText = transcript.slice(0, 15);
          this.inputModel = filteredText;
          this.ionInputEl.value = filteredText;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onInput(event: CustomEvent) {
    const value = (event.target as HTMLIonInputElement).value ?? '';
    const filteredValue = (value as string).replace(/[^a-zA-Z0-9]/g, '');
    this.ionInputEl.value = this.inputModel = filteredValue;
  }

  customCounterFormatter(inputLength: number, maxLength: number): string {
    return `${inputLength}/${maxLength} caracteres`;
  }

  encryptText(text: string): string {
    return CryptoJS.AES.encrypt(text, this.secretKey, {
      iv: CryptoJS.enc.Utf8.parse(this.vector),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  }

  decryptText(encryptedText: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, this.secretKey, {
      iv: CryptoJS.enc.Utf8.parse(this.vector),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  presentPopover(e: Event) {
    if (this.isListening) {
      this.voiceRecognitionService.stop();
    }

    if (this.inputModel) {
      this.encryptedText = this.encryptText(this.inputModel);
      this.showDecrypted = false;
      this.inputModel = '';
      this.ionInputEl.value = '';
    }
    this.popover.event = e;
    this.isOpen = true;
  }

  onDecrypt() {
    if (this.encryptedText) {
      this.decryptedText = this.decryptText(this.encryptedText);
      this.showDecrypted = true;
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.voiceRecognitionService.stop();
    } else {
      this.voiceRecognitionService.start();
    }
  }
}
