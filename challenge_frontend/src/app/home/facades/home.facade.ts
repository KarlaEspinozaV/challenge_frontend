import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import { mic } from 'ionicons/icons';

import { HomeStateService } from '../services/home-state.service';
import { InputHandler } from '../handlers/input.handler';
import { VoiceHandler } from '../handlers/voice.handler';
import { EncryptionHandler } from '../handlers/encryption.handler';
import { HOME_CONSTANTS } from '../home.constants';
import {
  IonicInputEvent,
  PopoverPresentEvent,
  CounterFormatterFunction,
  InputValidationResult,
} from '../home.interfaces';

/**
 * Facade that orchestrates all home component functionality
 * Provides a clean interface for the component while managing all business logic
 */
@Injectable({
  providedIn: 'root',
})
export class HomeFacade implements OnDestroy {
  // ================================================================
  // PRIVATE PROPERTIES
  // ================================================================

  /**
   * Subject used for the takeUntil pattern to automatically unsubscribe
   * when the facade is destroyed
   */
  private readonly destroy$ = new Subject<void>();

  // ================================================================
  // PUBLIC OBSERVABLES
  // ================================================================

  /**
   * Observable that combines listening state and input validity
   */
  public readonly canStartListening$: Observable<boolean>;

  /**
   * Observable that tracks if encryption is possible
   */
  public readonly canEncrypt$: Observable<boolean>;

  /**
   * Observable that tracks if decryption is possible
   */
  public readonly canDecrypt$: Observable<boolean>;

  // ================================================================
  // CONSTRUCTOR
  // ================================================================

  constructor(
    private readonly stateService: HomeStateService,
    private readonly inputHandler: InputHandler,
    private readonly voiceHandler: VoiceHandler,
    private readonly encryptionHandler: EncryptionHandler
  ) {
    this.initializeIcons();

    // Initialize reactive streams
    this.canStartListening$ = this.voiceHandler.canStartListening$;
    this.canEncrypt$ = this.encryptionHandler.createCanEncryptStream();
    this.canDecrypt$ = this.encryptionHandler.createCanDecryptStream();
  }

  // ================================================================
  // LIFECYCLE METHODS
  // ================================================================

  /**
   * Initializes the facade and sets up all subscriptions
   */
  initialize(): void {
    this.setupAllSubscriptions();
  }

  /**
   * Cleanup method for OnDestroy
   */
  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Manual cleanup method
   */
  cleanup(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Cleanup all handlers
    this.inputHandler.cleanup();
    this.voiceHandler.cleanup();
    this.stateService.cleanup();
  }

  // ================================================================
  // STATE GETTERS (for template binding)
  // ================================================================

  get inputModel(): string {
    return this.stateService.inputModel;
  }

  get isOpen(): boolean {
    return this.stateService.isOpen;
  }

  get encryptedText(): string {
    return this.stateService.encryptedText;
  }

  get decryptedText(): string {
    return this.stateService.decryptedText;
  }

  get showDecrypted(): boolean {
    return this.stateService.showDecrypted;
  }

  get isListening(): boolean {
    return this.stateService.isListening;
  }

  get maxLength(): number {
    return HOME_CONSTANTS.INPUT.MAX_LENGTH;
  }

  // ================================================================
  // STATE SETTERS
  // ================================================================

  setIsOpen(value: boolean): void {
    this.stateService.setIsOpen(value);
  }

  // ================================================================
  // PUBLIC METHODS (for component interaction)
  // ================================================================

  /**
   * Handles input events from the ion-input field
   * @param event - The Ionic input event
   * @returns Validation result with filtered value
   */
  handleInput(event: IonicInputEvent): InputValidationResult {
    return this.inputHandler.processInput(event);
  }

  /**
   * Custom counter formatter for the input field
   * @param inputLength - Current input length
   * @param maxLength - Maximum allowed length
   * @returns Formatted counter string
   */
  customCounterFormatter: CounterFormatterFunction = (
    inputLength: number,
    maxLength: number
  ): string => {
    return HOME_CONSTANTS.TEXT.COUNTER_FORMAT(inputLength, maxLength);
  };

  /**
   * Presents the encryption result popover
   * @param event - The presentation event
   */
  presentPopover(event: PopoverPresentEvent): void {
    this.voiceHandler.stopVoiceRecognitionIfActive();

    if (this.stateService.hasValidInput()) {
      this.encryptionHandler.performEncryptionWithObservables(
        event,
        this.destroy$
      );
    }
  }

  /**
   * Handles decryption of the encrypted text
   */
  handleDecrypt(): void {
    if (this.stateService.hasEncryptedText()) {
      this.encryptionHandler.performDecryptionWithObservables(this.destroy$);
    }
  }

  /**
   * Toggles voice recognition listening state
   */
  toggleListening(): void {
    this.voiceHandler.toggleListening();
  }

  /**
   * Updates input value from external source (like ViewChild)
   * @param value - The value to set
   */
  updateInputValue(value: string): void {
    this.stateService.setInputModel(value);
  }

  /**
   * Sets popover event (for ViewChild interaction)
   * @param popover - The popover element
   * @param event - The presentation event
   */
  setPopoverEvent(popover: any, event: PopoverPresentEvent): void {
    if (popover) {
      popover.event = event;
    }
  }

  // ================================================================
  // VALIDATION METHODS
  // ================================================================

  /**
   * Checks if there is valid input to process
   */
  hasValidInput(): boolean {
    return this.stateService.hasValidInput();
  }

  /**
   * Checks if there is encrypted text available
   */
  hasEncryptedText(): boolean {
    return this.stateService.hasEncryptedText();
  }

  // ================================================================
  // PRIVATE INITIALIZATION METHODS
  // ================================================================

  /**
   * Initializes Ionic icons
   */
  private initializeIcons(): void {
    addIcons({ mic });
  }

  /**
   * Sets up all subscriptions for handlers
   */
  private setupAllSubscriptions(): void {
    this.voiceHandler.setupVoiceRecognitionSubscriptions(this.destroy$);
    this.inputHandler.setupInputProcessingStreams(this.destroy$);
  }
}
