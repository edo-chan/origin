import { style } from '@vanilla-extract/css';

export const selectTrigger = style({
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '14px',
  lineHeight: '1.5',
  height: '40px',
  gap: '8px',
  backgroundColor: 'white',
  border: '2px solid #e2e8f0',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minWidth: '200px',
  
  selectors: {
    '&:hover': {
      borderColor: '#cbd5e1',
    },
    '&:focus': {
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
    },
    '&[data-placeholder]': {
      color: '#9ca3af',
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    '&[data-error="true"]': {
      borderColor: '#ef4444',
    },
    '&[data-size="sm"]': {
      height: '32px',
      padding: '4px 8px',
      fontSize: '12px',
    },
    '&[data-size="lg"]': {
      height: '48px',
      padding: '12px 16px',
      fontSize: '16px',
    },
    '&[data-variant="secondary"]': {
      borderColor: '#6b7280',
    },
    '&[data-variant="tertiary"]': {
      borderColor: '#9ca3af',
    },
  },
});

export const selectContent = style({
  overflow: 'hidden',
  backgroundColor: 'white',
  borderRadius: '6px',
  boxShadow: '0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)',
  border: '1px solid #e2e8f0',
  minWidth: 'var(--radix-select-trigger-width)',
  maxHeight: 'var(--radix-select-content-available-height)',
});

export const selectItem = style({
  all: 'unset',
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#374151',
  borderRadius: '3px',
  display: 'flex',
  alignItems: 'center',
  height: '32px',
  padding: '0 32px 0 12px',
  position: 'relative',
  userSelect: 'none',
  cursor: 'pointer',
  
  selectors: {
    '&[data-disabled]': {
      color: '#9ca3af',
      pointerEvents: 'none',
    },
    '&[data-highlighted]': {
      outline: 'none',
      backgroundColor: '#f3f4f6',
      color: '#111827',
    },
  },
});

export const selectLabel = style({
  fontSize: '14px',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '4px',
  display: 'block',
});

export const selectSeparator = style({
  height: '1px',
  backgroundColor: '#e2e8f0',
  margin: '4px',
});

export const selectScrollButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '25px',
  backgroundColor: 'white',
  color: '#6b7280',
  cursor: 'default',
});