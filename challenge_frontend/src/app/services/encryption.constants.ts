/**
 * Constants for Encryption Service
 * Centralizes encryption configuration and settings
 */

export const ENCRYPTION_CONSTANTS = {
  /**
   * AES Encryption Configuration
   */
  AES: {
    SECRET_KEY: 'your-secret-key-here',
    VECTOR: 'your-vector-here',
    MODE: 'CBC',
    PADDING: 'PKCS7',
  },

  /**
   * Validation and Error Messages
   */
  VALIDATION: {
    MIN_TEXT_LENGTH: 1,
  },

  /**
   * Error Messages
   */
  ERRORS: {
    EMPTY_TEXT_TO_ENCRYPT: 'Text to encrypt cannot be empty',
    EMPTY_ENCRYPTED_TEXT: 'Encrypted text cannot be empty',
    DECRYPTION_EMPTY_RESULT: 'Decryption resulted in empty text',
    ENCRYPTION_FAILED: 'Failed to encrypt text',
    DECRYPTION_FAILED: 'Failed to decrypt text',
  },
} as const;

/**
 * Type for ENCRYPTION_CONSTANTS to ensure type safety
 */
export type EncryptionConstants = typeof ENCRYPTION_CONSTANTS;
