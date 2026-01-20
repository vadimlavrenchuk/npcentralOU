import { Request, Response, NextFunction } from 'express';
import { SupportedLanguage } from '../types/common';

/**
 * Middleware to parse Accept-Language header and set language preference
 * Supports: en, et, fi, ru
 * Default: en
 */
export const languageMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const acceptLanguage = req.headers['accept-language'];
  
  let language: SupportedLanguage = 'en'; // Default language

  if (acceptLanguage) {
    // Parse Accept-Language header (format: "en-US,en;q=0.9,et;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map((lang) => {
        const parts = lang.trim().split(';');
        const code = parts[0].split('-')[0].toLowerCase();
        const quality = parts[1] ? parseFloat(parts[1].split('=')[1]) : 1.0;
        return { code, quality };
      })
      .sort((a, b) => b.quality - a.quality);

    // Find first supported language
    const supportedLanguages: SupportedLanguage[] = ['en', 'et', 'fi', 'ru'];
    const foundLanguage = languages.find((lang) =>
      supportedLanguages.includes(lang.code as SupportedLanguage)
    );

    if (foundLanguage) {
      language = foundLanguage.code as SupportedLanguage;
    }
  }

  // Attach language to request object
  (req as any).language = language;

  next();
};
