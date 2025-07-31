import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { dialogOverlay, dialogContent, dialogClose } from './Modal.css';

export interface ModalProps {
  /** Standard size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** T-shirt size */
  sizeT?: 'tshirtXS' | 'tshirtS' | 'tshirtM' | 'tshirtL' | 'tshirtXL';
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Whether modal is open */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Function called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Modal content */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Modal title */
  title?: string;
  /** Modal description */
  description?: string;
  /** Show close button */
  showCloseButton?: boolean;
}

export const CustomModal: React.FC<ModalProps> = ({
  size = 'md',
  sizeT,
  variant = 'tertiary',
  open,
  defaultOpen,
  onOpenChange,
  children,
  className,
  title,
  description,
  showCloseButton = true,
}) => {
  const contentClasses = [
    dialogContent,
    className,
  ].filter(Boolean).join(' ');

  // Use sizeT if provided, otherwise use size
  const sizeValue = sizeT || size;

  return (
    <Dialog.Root 
      open={open} 
      defaultOpen={defaultOpen} 
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={dialogOverlay} />
        <Dialog.Content 
          className={contentClasses}
          data-size={sizeValue}
          data-variant={variant}
        >
          {title && (
            <Dialog.Title style={{ 
              margin: 0, 
              marginBottom: '12px',
              fontSize: '18px',
              fontWeight: 500,
            }}>
              {title}
            </Dialog.Title>
          )}
          {description && (
            <Dialog.Description style={{ 
              margin: '10px 0 20px', 
              color: '#666',
              fontSize: '15px',
              lineHeight: 1.5,
            }}>
              {description}
            </Dialog.Description>
          )}
          {children}
          {showCloseButton && (
            <Dialog.Close className={dialogClose} aria-label="Close">
              ×
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Keep backward compatibility
export { CustomModal as Modal };

// Simple trigger wrapper for common use case
export const ModalTrigger: React.FC<{
  children: React.ReactNode;
  asChild?: boolean;
}> = ({ children, asChild = true }) => {
  return (
    <Dialog.Trigger asChild={asChild}>
      {children}
    </Dialog.Trigger>
  );
};