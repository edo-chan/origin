import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { overlay, modalBase, sizeVariants, sizeVariantsT, variantStyles } from './Modal.css';

export interface ModalProps {
  /** Standard size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** T-shirt size */
  sizeT?: 'tshirtXS' | 'tshirtS' | 'tshirtM' | 'tshirtL' | 'tshirtXL';
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Whether modal is open */
  isOpen: boolean;
  /** Function to close modal */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  size = 'md',
  sizeT,
  variant = 'tertiary',
  isOpen,
  onClose,
  children,
  className,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Use sizeT if provided, otherwise use size
  const sizeClass = sizeT ? sizeVariantsT[sizeT] : sizeVariants[size];
  
  const classes = [
    modalBase,
    sizeClass,
    variantStyles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const modalContent = (
    <>
      <div className={overlay} onClick={onClose} />
      <div className={classes}>
        {children}
      </div>
    </>
  );

  // Render modal in a portal
  return createPortal(modalContent, document.body);
};