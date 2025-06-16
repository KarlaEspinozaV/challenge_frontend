import { Injectable } from '@angular/core';
import { Subject, Observable, of, EMPTY } from 'rxjs';
import {
  filter,
  switchMap,
  tap,
  catchError,
  finalize,
  takeUntil,
  map,
} from 'rxjs/operators';
import { EncryptionService } from '../../services/encryption.service';
import { HomeStateService } from '../services/home-state.service';
import { InputHandler } from './input.handler';
import {
  EncryptionResult,
  DecryptionResult,
  PopoverPresentEvent,
} from '../home.interfaces';

/**
 * Handler responsible for encryption and decryption operations
 * Manages all crypto-related logic including reactive processing and error handling
 */
@Injectable({
  providedIn: 'root',
})
export class EncryptionHandler {
  // ================================================================
  // CONSTRUCTOR
  // ================================================================

  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly stateService: HomeStateService,
    private readonly inputHandler: InputHandler
  ) {}

  // ================================================================
  // PUBLIC METHODS
  // ================================================================

  /**
   * Performs text encryption using Observable patterns
   * @param event - The presentation event
   * @param destroy$ - Subject for cleanup
   */
  performEncryptionWithObservables(
    event: PopoverPresentEvent,
    destroy$: Subject<void>
  ): void {
    of(this.stateService.inputModel)
      .pipe(
        filter((input) => Boolean(input && input.trim())),
        switchMap((input) => this.encryptTextAsObservable(input)),
        tap((result) => {
          if (result.success) {
            this.handleSuccessfulEncryption(result.encryptedText, event);
          }
        }),
        catchError((error) => {
          this.logEncryptionError(error.message);
          return EMPTY;
        }),
        finalize(() => {
          // Cleanup or final operations
        }),
        takeUntil(destroy$)
      )
      .subscribe();
  }

  /**
   * Performs text decryption using Observable patterns
   * @param destroy$ - Subject for cleanup
   */
  performDecryptionWithObservables(destroy$: Subject<void>): void {
    of(this.stateService.encryptedText)
      .pipe(
        filter((encrypted) => Boolean(encrypted && encrypted.trim())),
        switchMap((encrypted) => this.decryptTextAsObservable(encrypted)),
        tap((result) => {
          if (result.success) {
            this.handleSuccessfulDecryption(result.decryptedText);
          }
        }),
        catchError((error) => {
          this.logDecryptionError(error.message);
          return EMPTY;
        }),
        takeUntil(destroy$)
      )
      .subscribe();
  }

  /**
   * Synchronous encryption method (fallback)
   * @returns Encryption result with success status
   */
  performTextEncryption(): EncryptionResult {
    try {
      const encryptedText: string = this.encryptionService.encryptText(
        this.stateService.inputModel
      );
      this.stateService.setEncryptedText(encryptedText);

      return {
        encryptedText,
        success: true,
      };
    } catch (error) {
      return this.createEncryptionError(error);
    }
  }

  /**
   * Synchronous decryption method (fallback)
   * @returns Decryption result with success status
   */
  performTextDecryption(): DecryptionResult {
    try {
      const decryptedText: string = this.encryptionService.decryptText(
        this.stateService.encryptedText
      );
      this.stateService.setDecryptedText(decryptedText);

      return {
        decryptedText,
        success: true,
      };
    } catch (error) {
      return this.createDecryptionError(error);
    }
  }

  /**
   * Creates observable stream for determining if encryption is possible
   */
  createCanEncryptStream(): Observable<boolean> {
    return this.inputHandler
      .getInputChange$()
      .pipe(map((input) => this.inputHandler.isValidInputForEncryption(input)));
  }

  /**
   * Creates observable stream for determining if decryption is possible
   */
  createCanDecryptStream(): Observable<boolean> {
    return this.stateService
      .getEncryptedText$()
      .pipe(map((encrypted) => this.isValidEncryptedText(encrypted)));
  }

  // ================================================================
  // PRIVATE OBSERVABLE METHODS
  // ================================================================

  /**
   * Encrypts text and returns as Observable
   * @param text - Text to encrypt
   * @returns Observable of encryption result
   */
  private encryptTextAsObservable(text: string): Observable<EncryptionResult> {
    return new Observable<EncryptionResult>((observer) => {
      try {
        const encryptedText = this.encryptionService.encryptText(text);
        observer.next({
          encryptedText,
          success: true,
        });
        observer.complete();
      } catch (error) {
        observer.next(this.createEncryptionError(error));
        observer.complete();
      }
    });
  }

  /**
   * Decrypts text and returns as Observable
   * @param encryptedText - Text to decrypt
   * @returns Observable of decryption result
   */
  private decryptTextAsObservable(
    encryptedText: string
  ): Observable<DecryptionResult> {
    return new Observable<DecryptionResult>((observer) => {
      try {
        const decryptedText = this.encryptionService.decryptText(encryptedText);
        observer.next({
          decryptedText,
          success: true,
        });
        observer.complete();
      } catch (error) {
        observer.next(this.createDecryptionError(error));
        observer.complete();
      }
    });
  }

  // ================================================================
  // PRIVATE SUCCESS HANDLERS
  // ================================================================

  /**
   * Handles successful encryption
   * @param encryptedText - The encrypted text
   * @param event - The presentation event
   */
  private handleSuccessfulEncryption(
    encryptedText: string,
    event: PopoverPresentEvent
  ): void {
    this.stateService.setEncryptedText(encryptedText);
    this.inputHandler.resetInput();
    this.showPopover(event);
  }

  /**
   * Handles successful decryption
   * @param decryptedText - The decrypted text
   */
  private handleSuccessfulDecryption(decryptedText: string): void {
    this.stateService.setDecryptedText(decryptedText);
    this.stateService.setShowDecrypted(true);
  }

  /**
   * Shows the popover (this should be moved to a UI handler in a more complete refactor)
   * @param event - The presentation event
   */
  private showPopover(event: PopoverPresentEvent): void {
    // This is a temporary solution - in a complete refactor,
    // this would be handled by a UI handler or the facade
    this.stateService.setIsOpen(true);
    // Note: The actual popover.event assignment would need to be handled
    // in the component since we don't have access to the ViewChild here
  }

  // ================================================================
  // PRIVATE ERROR HANDLING METHODS
  // ================================================================

  /**
   * Creates an encryption error result
   * @param error - The error that occurred
   * @returns Encryption error result
   */
  private createEncryptionError(error: unknown): EncryptionResult {
    return {
      encryptedText: '',
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown encryption error',
    };
  }

  /**
   * Creates a decryption error result
   * @param error - The error that occurred
   * @returns Decryption error result
   */
  private createDecryptionError(error: unknown): DecryptionResult {
    return {
      decryptedText: '',
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown decryption error',
    };
  }

  /**
   * Logs encryption error
   * @param error - The error message
   */
  private logEncryptionError(error?: string): void {
    console.error('Error encrypting text:', error);
  }

  /**
   * Logs decryption error
   * @param error - The error message
   */
  private logDecryptionError(error?: string): void {
    console.error('Error decrypting text:', error);
  }

  // ================================================================
  // PRIVATE VALIDATION METHODS
  // ================================================================

  /**
   * Validates if encrypted text is valid
   * @param encrypted - Encrypted text to validate
   * @returns True if valid encrypted text
   */
  private isValidEncryptedText(encrypted: string): boolean {
    return Boolean(encrypted && encrypted.trim().length > 0);
  }
}
