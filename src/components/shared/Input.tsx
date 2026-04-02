/**
 * Input - универсальное поле ввода
 */

import React from 'react';
import './Input.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const hasError = Boolean(error);

  return (
    <div className={`input-group ${fullWidth ? 'input-group--full-width' : ''} ${className}`}>
      {label && (
        <label className="input-group__label" htmlFor={props.id}>
          {label}
          {props.required && <span className="input-group__required">*</span>}
        </label>
      )}
      
      <div className={`input-wrapper ${hasError ? 'input-wrapper--error' : ''}`}>
        {icon && <span className="input-wrapper__icon">{icon}</span>}
        <input
          className={`input ${icon ? 'input--with-icon' : ''}`}
          {...props}
        />
      </div>

      {error && <span className="input-group__error">{error}</span>}
      {helperText && !error && (
        <span className="input-group__helper">{helperText}</span>
      )}
    </div>
  );
};
