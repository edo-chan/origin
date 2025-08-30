import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        primary: 'border-primary-300 focus-visible:ring-primary-500',
        secondary: 'border-secondary-300 focus-visible:ring-secondary-500',
        tertiary: 'border-tertiary-300 focus-visible:ring-tertiary-500',
        ghost: 'border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
        filled: 'bg-muted border-muted',
      },
      inputSize: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-2.5 text-xs',
        md: 'h-10',
        lg: 'h-11 px-4',
        xl: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'tertiary',
      inputSize: 'md',
    },
  }
)

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      error: {
        true: 'text-destructive',
        false: '',
      },
    },
    defaultVariants: {
      error: false,
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Label for the input */
  label?: string
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Helper text */
  helperText?: string
  /** Left icon/addon */
  leftIcon?: React.ReactNode
  /** Right icon/addon */
  rightIcon?: React.ReactNode
  /** Make input full width */
  fullWidth?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    type,
    variant,
    inputSize,
    label,
    error = false,
    errorMessage,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    const inputElement = (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {leftIcon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            inputVariants({ variant, inputSize }),
            error && 'border-destructive focus-visible:ring-destructive',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          ref={ref}
          aria-invalid={error}
          aria-describedby={
            error && errorMessage 
              ? errorId 
              : helperText 
              ? helperId 
              : undefined
          }
          {...props}
        />
        {rightIcon && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
    )

    if (!label && !errorMessage && !helperText) {
      return inputElement
    }

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <LabelPrimitive.Root
            htmlFor={inputId}
            className={cn(labelVariants({ error }))}
          >
            {label}
          </LabelPrimitive.Root>
        )}
        {inputElement}
        {error && errorMessage && (
          <p
            id={errorId}
            className="text-xs text-destructive"
            role="alert"
            aria-live="polite"
          >
            {errorMessage}
          </p>
        )}
        {!error && helperText && (
          <p
            id={helperId}
            className="text-xs text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }