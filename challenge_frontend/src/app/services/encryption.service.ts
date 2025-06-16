import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';
import { ENCRYPTION_CONSTANTS } from './encryption.constants';

/**
 * Service for handling text encryption and decryption operations
 * Uses AES encryption with CBC mode and PKCS7 padding
 */
@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private readonly secretKey: string = ENCRYPTION_CONSTANTS.AES.SECRET_KEY;
  private readonly vector: string = ENCRYPTION_CONSTANTS.AES.VECTOR;

  constructor() {}

  /**
   * Encrypts a plain text string using AES encryption
   * @param text - The plain text to encrypt
   * @returns The encrypted text as a string
   * @throws Error if encryption fails
   */
  encryptText(text: string): string {
    try {
      if (
        !text ||
        text.trim().length < ENCRYPTION_CONSTANTS.VALIDATION.MIN_TEXT_LENGTH
      ) {
        throw new Error(ENCRYPTION_CONSTANTS.ERRORS.EMPTY_TEXT_TO_ENCRYPT);
      }

      return CryptoJS.AES.encrypt(text, this.secretKey, {
        iv: CryptoJS.enc.Utf8.parse(this.vector),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error(ENCRYPTION_CONSTANTS.ERRORS.ENCRYPTION_FAILED);
    }
  }

  /**
   * Decrypts an encrypted text string using AES decryption
   * @param encryptedText - The encrypted text to decrypt
   * @returns The decrypted plain text as a string
   * @throws Error if decryption fails
   */
  decryptText(encryptedText: string): string {
    try {
      if (
        !encryptedText ||
        encryptedText.trim().length <
          ENCRYPTION_CONSTANTS.VALIDATION.MIN_TEXT_LENGTH
      ) {
        throw new Error(ENCRYPTION_CONSTANTS.ERRORS.EMPTY_ENCRYPTED_TEXT);
      }

      const decrypted = CryptoJS.AES.decrypt(encryptedText, this.secretKey, {
        iv: CryptoJS.enc.Utf8.parse(this.vector),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedText) {
        throw new Error(ENCRYPTION_CONSTANTS.ERRORS.DECRYPTION_EMPTY_RESULT);
      }

      return decryptedText;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error(ENCRYPTION_CONSTANTS.ERRORS.DECRYPTION_FAILED);
    }
  }

  /**
   * Validates if a text can be successfully encrypted and decrypted
   * @param text - The text to validate
   * @returns true if validation passes, false otherwise
   */
  validateEncryption(text: string): boolean {
    try {
      const encrypted = this.encryptText(text);
      const decrypted = this.decryptText(encrypted);
      return decrypted === text;
    } catch (error) {
      return false;
    }
  }
}
