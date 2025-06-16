import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HomeComponentState } from '../home.interfaces';

/**
 * Service responsible for managing the home component's state
 * Centralizes all state management logic for better maintainability
 */
@Injectable({
  providedIn: 'root',
})
export class HomeStateService implements HomeComponentState {
  // ================================================================
  // PRIVATE STATE SUBJECTS
  // ================================================================

  private readonly inputModel$ = new BehaviorSubject<string>('');
  private readonly isOpen$ = new BehaviorSubject<boolean>(false);
  private readonly encryptedText$ = new BehaviorSubject<string>('');
  private readonly decryptedText$ = new BehaviorSubject<string>('');
  private readonly showDecrypted$ = new BehaviorSubject<boolean>(false);
  private readonly isListening$ = new BehaviorSubject<boolean>(false);

  // ================================================================
  // PUBLIC STATE GETTERS
  // ================================================================

  get inputModel(): string {
    return this.inputModel$.value;
  }

  get isOpen(): boolean {
    return this.isOpen$.value;
  }

  get encryptedText(): string {
    return this.encryptedText$.value;
  }

  get decryptedText(): string {
    return this.decryptedText$.value;
  }

  get showDecrypted(): boolean {
    return this.showDecrypted$.value;
  }

  get isListening(): boolean {
    return this.isListening$.value;
  }

  // ================================================================
  // PUBLIC STATE OBSERVABLES
  // ================================================================

  getInputModel$(): Observable<string> {
    return this.inputModel$.asObservable();
  }

  getIsOpen$(): Observable<boolean> {
    return this.isOpen$.asObservable();
  }

  getEncryptedText$(): Observable<string> {
    return this.encryptedText$.asObservable();
  }

  getDecryptedText$(): Observable<string> {
    return this.decryptedText$.asObservable();
  }

  getShowDecrypted$(): Observable<boolean> {
    return this.showDecrypted$.asObservable();
  }

  getIsListening$(): Observable<boolean> {
    return this.isListening$.asObservable();
  }

  // ================================================================
  // PUBLIC STATE SETTERS
  // ================================================================

  setInputModel(value: string): void {
    this.inputModel$.next(value);
  }

  setIsOpen(value: boolean): void {
    this.isOpen$.next(value);
  }

  setEncryptedText(value: string): void {
    this.encryptedText$.next(value);
    // Reset decryption state when new encrypted text is set
    this.showDecrypted$.next(false);
  }

  setDecryptedText(value: string): void {
    this.decryptedText$.next(value);
  }

  setShowDecrypted(value: boolean): void {
    this.showDecrypted$.next(value);
  }

  setIsListening(value: boolean): void {
    this.isListening$.next(value);
  }

  // ================================================================
  // PUBLIC STATE OPERATIONS
  // ================================================================

  /**
   * Resets input-related state
   */
  resetInputState(): void {
    this.setInputModel('');
  }

  /**
   * Resets encryption-related state
   */
  resetEncryptionState(): void {
    this.setEncryptedText('');
    this.setDecryptedText('');
    this.setShowDecrypted(false);
  }

  /**
   * Resets all state to initial values
   */
  resetAllState(): void {
    this.resetInputState();
    this.resetEncryptionState();
    this.setIsOpen(false);
    this.setIsListening(false);
  }

  /**
   * Checks if there is valid input to process
   */
  hasValidInput(): boolean {
    return Boolean(this.inputModel && this.inputModel.trim().length > 0);
  }

  /**
   * Checks if there is encrypted text available
   */
  hasEncryptedText(): boolean {
    return Boolean(this.encryptedText && this.encryptedText.trim().length > 0);
  }

  /**
   * Cleanup method to complete all subjects
   */
  cleanup(): void {
    this.inputModel$.complete();
    this.isOpen$.complete();
    this.encryptedText$.complete();
    this.decryptedText$.complete();
    this.showDecrypted$.complete();
    this.isListening$.complete();
  }
}
