/**
 * Constants for Voice Recognition Service
 * Centralizes voice recognition configuration and settings
 */

export const VOICE_RECOGNITION_CONSTANTS = {
  /**
   * Browser API Configuration
   */
  API: {
    WEBKIT_SPEECH_RECOGNITION: 'webkitSpeechRecognition',
  },

  /**
   * Speech Recognition Configuration
   */
  RECOGNITION: {
    CONTINUOUS: true,
    INTERIM_RESULTS: true,
    LANGUAGE: 'es-ES',
  },

  /**
   * Text Processing Configuration
   */
  TEXT_PROCESSING: {
    ALLOWED_CHARACTERS_REGEX: /[^a-zA-Z0-9]/g,
    MAX_LENGTH_BEFORE_STOP: 15,
  },

  /**
   * Timing Configuration
   */
  TIMING: {
    TIMEOUT_MS: 5000,
  },

  /**
   * Error Messages
   */
  ERRORS: {
    BROWSER_NOT_SUPPORTED: 'Speech recognition not supported in this browser.',
    RECOGNITION_ERROR: 'Speech recognition error:',
  },
} as const;

/**
 * Type for VOICE_RECOGNITION_CONSTANTS to ensure type safety
 */
export type VoiceRecognitionConstants = typeof VOICE_RECOGNITION_CONSTANTS;
