/**
 * Interfaces and Types for Home Component
 * Provides type safety and better developer experience
 */

/**
 * Represents the current state of the Home component
 */
export interface HomeComponentState {
  inputModel: string;
  isOpen: boolean;
  encryptedText: string;
  decryptedText: string;
  showDecrypted: boolean;
  isListening: boolean;
}

/**
 * Voice recognition related types
 */
export interface VoiceTranscriptData {
  transcript: string;
  isListening: boolean;
}

/**
 * Encryption/Decryption result types
 */
export interface EncryptionResult {
  encryptedText: string;
  success: boolean;
  error?: string;
}

export interface DecryptionResult {
  decryptedText: string;
  success: boolean;
  error?: string;
}

/**
 * Counter formatter function type
 */
export type CounterFormatterFunction = (
  inputLength: number,
  maxLength: number
) => string;

/**
 * Event types for better type safety with Ionic components
 */
export interface IonicInputEvent extends CustomEvent {
  target: HTMLIonInputElement;
}

/**
 * Represents an event for presenting a popover
 * Compatible with MouseEvent from template button clicks
 */
export interface PopoverPresentEvent {
  target: EventTarget | null;
  currentTarget?: EventTarget | null;
  type?: string;
}

/**
 * Input validation result
 */
export interface InputValidationResult {
  isValid: boolean;
  filteredValue: string;
  errorMessage?: string;
}

/**
 * Component method return types
 */
export type VoidPromise = Promise<void>;
export type VoidFunction = () => void;
