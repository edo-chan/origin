import React from 'react';
import { inputBase, inputContainer, inputLabel, inputLabelError, inputErrorMessage, sizeVariants, variantStyles, errorStyles } from './Input.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Label for the input */
  label?: string;
}

export const Input: React.FC<InputProps> = ({
  size = 'md',
  variant = 'tertiary',
  error = false,
  errorMessage,
  label,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const classes = [
    inputBase,
    sizeVariants[size],
    error ? errorStyles : variantStyles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerClasses = [inputContainer, sizeVariants[size]].join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label 
          htmlFor={inputId}
          className={`${inputLabel} ${error ? inputLabelError : ''}`}
        >
          {label}
        </label>
      )}
      <input 
        id={inputId}
        className={classes} 
        aria-invalid={error}
        aria-describedby={error && errorMessage ? `${inputId}-error` : undefined}
        {...props} 
      />
      {error && errorMessage && (
        <div 
          id={`${inputId}-error`}
          className={inputErrorMessage}
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};