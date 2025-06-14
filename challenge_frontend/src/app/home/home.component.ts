import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonInput,
  IonLabel,
  IonButton,
  IonIcon,
  IonItem,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mic } from 'ionicons/icons';

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
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  inputModel = '';

  @ViewChild('ionInputEl', { static: true }) ionInputEl!: IonInput;

  constructor() {
    addIcons({ mic });
  }

  onInput(event: CustomEvent) {
    const value = (event.target as HTMLIonInputElement).value ?? '';
    const filteredValue = (value as string).replace(/[^a-zA-Z0-9]+/g, '');
    this.ionInputEl.value = this.inputModel = filteredValue;
  }

  customCounterFormatter(inputLength: number, maxLength: number): string {
    return `${inputLength}/${maxLength} caracteres`;
  }
}
