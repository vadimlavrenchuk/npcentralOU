import { Request, Response, NextFunction } from 'express';

/**
 * Error messages in different languages
 */
const errorMessages: Record<string, Record<string, string>> = {
  en: {
    serverError: 'Internal server error',
    notFound: 'Resource not found',
    validationError: 'Validation error',
    unauthorized: 'Unauthorized access',
  },
  et: {
    serverError: 'Serveri viga',
    notFound: 'Ressurssi ei leitud',
    validationError: 'Valideerimise viga',
    unauthorized: 'Loata juurdepääs',
  },
  fi: {
    serverError: 'Palvelimen virhe',
    notFound: 'Resurssia ei löytynyt',
    validationError: 'Validointivirhe',
    unauthorized: 'Luvaton pääsy',
  },
  ru: {
    serverError: 'Внутренняя ошибка сервера',
    notFound: 'Ресурс не найден',
    validationError: 'Ошибка валидации',
    unauthorized: 'Несанкционированный доступ',
  },
};

/**
 * Get localized error message
 */
const getLocalizedMessage = (language: string, key: string, defaultMessage?: string): string => {
  const messages = errorMessages[language] || errorMessages.en;
  return messages[key] || defaultMessage || messages.serverError;
};

/**
 * Global error handler middleware
 * Handles all errors and returns localized error messages
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const language = (req as any).language || 'en';
  
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    res.status(400).json({
      success: false,
      message: getLocalizedMessage(language, 'validationError'),
      errors,
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: getLocalizedMessage(language, 'notFound'),
    });
    return;
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
    return;
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = err.message || getLocalizedMessage(language, 'serverError');

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const language = (req as any).language || 'en';
  
  res.status(404).json({
    success: false,
    message: getLocalizedMessage(language, 'notFound'),
    path: req.originalUrl,
  });
};
