/**
 * Constants for Home Component
 * Centralizes configuration values and magic numbers
 */

export const HOME_CONSTANTS = {
  /**
   * Input field configuration
   */
  INPUT: {
    MAX_LENGTH: 15,
    ALLOWED_CHARACTERS_REGEX: /[^a-zA-Z0-9]/g,
    COUNTER_SUFFIX: 'caracteres',
  },

  /**
   * Voice recognition configuration
   */
  VOICE: {
    MAX_TRANSCRIPT_LENGTH: 15,
  },

  /**
   * UI Text and Labels
   */
  TEXT: {
    COUNTER_FORMAT: (current: number, max: number) =>
      `${current}/${max} caracteres`,
  },
} as const;

/**
 * Type for HOME_CONSTANTS to ensure type safety
 */
export type HomeConstants = typeof HOME_CONSTANTS;
