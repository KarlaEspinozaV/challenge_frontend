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

import { HomeFacade } from './facades/home.facade';
import {
  HomeComponentState,
  IonicInputEvent,
  PopoverPresentEvent,
  CounterFormatterFunction,
  VoidFunction,
} from './home.interfaces';

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
export class HomeComponent
  implements OnInit, OnDestroy, Partial<HomeComponentState>
{
  // ================================================================
  // VIEW CHILDREN
  // ================================================================

  @ViewChild('ionInputEl', { static: true })
  private readonly ionInputEl!: IonInput;

  @ViewChild('popover')
  private readonly popover!: HTMLIonPopoverElement;

  // ================================================================
  // CONSTRUCTOR
  // ================================================================

  constructor(public readonly facade: HomeFacade) {}

  // ================================================================
  // LIFECYCLE HOOKS
  // ================================================================

  ngOnInit(): void {
    this.facade.initialize();
  }

  ngOnDestroy(): void {
    this.facade.cleanup();
  }

  // ================================================================
  // TEMPLATE GETTERS (delegated to facade)
  // ================================================================

  get inputModel(): string {
    return this.facade.inputModel;
  }

  get isOpen(): boolean {
    return this.facade.isOpen;
  }

  get encryptedText(): string {
    return this.facade.encryptedText;
  }

  get decryptedText(): string {
    return this.facade.decryptedText;
  }

  get showDecrypted(): boolean {
    return this.facade.showDecrypted;
  }

  get isListening(): boolean {
    return this.facade.isListening;
  }

  get maxLength(): number {
    return this.facade.maxLength;
  }

  // ================================================================
  // TEMPLATE METHODS (delegated to facade)
  // ================================================================

  /**
   * Handles input events from the ion-input field
   * @param event - The Ionic input event
   */
  onInput(event: IonicInputEvent): void {
    const result = this.facade.handleInput(event);
    // Update ViewChild to reflect the filtered value
    this.ionInputEl.value = result.filteredValue;
  }

  /**
   * Custom counter formatter for the input field
   */
  customCounterFormatter: CounterFormatterFunction = (
    inputLength: number,
    maxLength: number
  ): string => {
    return this.facade.customCounterFormatter(inputLength, maxLength);
  };

  /**
   * Presents the encryption result popover
   * @param e - The presentation event
   */
  presentPopover(e: PopoverPresentEvent): void {
    this.facade.presentPopover(e);
    // Handle ViewChild-specific logic
    this.facade.setPopoverEvent(this.popover, e);
  }

  /**
   * Handles decryption of the encrypted text
   */
  onDecrypt(): void {
    this.facade.handleDecrypt();
  }

  /**
   * Toggles voice recognition listening state
   */
  toggleListening: VoidFunction = (): void => {
    this.facade.toggleListening();
  };

  /**
   * Handles popover dismiss
   */
  onPopoverDismiss(): void {
    this.facade.setIsOpen(false);
  }
}
