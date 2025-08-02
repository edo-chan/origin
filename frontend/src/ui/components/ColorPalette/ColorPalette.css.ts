import { style } from '@vanilla-extract/css';

export const colorSwatchContainer = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
  gap: '8px',
});

export const colorSwatch = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  alignItems: 'center',
  textAlign: 'center',
});

export const colorInfo = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
});

export const colorSwatchBox = style({
  width: '100%',
  height: '32px',
  borderRadius: '4px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
});