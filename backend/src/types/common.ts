/**
 * Supported languages for i18n
 */
export type SupportedLanguage = 'en' | 'et' | 'fi' | 'ru';

/**
 * I18n object for multi-language support
 */
export interface I18nString {
  en: string;
  et?: string;
  fi?: string;
  ru?: string;
}

/**
 * Extended Express Request with language information
 */
export interface RequestWithLanguage {
  language: SupportedLanguage;
}
