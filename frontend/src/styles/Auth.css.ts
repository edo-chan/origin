import { style } from '@vanilla-extract/css';

// K-drama inspired color palette
const colors = {
  primary: '#0070f3', // Blue accent color from Home.css.ts
  secondary: '#0070f3', // Keeping it consistent
  accent: '#e0e0e0', // Light accent color
  background: '#121212', // Dark background (same as Home.css.ts)
  text: '#e0e0e0', // Light text (same as Home.css.ts)
  cardBg: 'rgba(255, 255, 255, 0.05)', // Subtle semi-transparent white
};

export const container = style({
  minHeight: '100vh',
  padding: '0 2rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: colors.background, // Consistent with Home.css.ts
  color: colors.text,
});

export const main = style({
  padding: '4rem 0',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  maxWidth: '500px',
});

export const title = style({
  margin: 0,
  lineHeight: 1.15,
  fontSize: '4rem',
  textAlign: 'center',
  color: colors.text,
});

export const form = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const inputGroup = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const label = style({
  fontSize: '1rem',
  fontWeight: 'bold',
  color: colors.text,
});

export const input = style({
  width: '100%',
  padding: '0.75rem',
  fontSize: '1rem',
  borderRadius: '5px',
  border: '1px solid #eaeaea',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  color: colors.text,
  transition: 'border-color 0.15s ease',
  ':focus': {
    outline: 'none',
    borderColor: colors.primary,
  },
});

export const button = style({
  marginTop: '1rem',
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  fontWeight: 'bold',
  borderRadius: '5px',
  border: '1px solid #eaeaea',
  backgroundColor: 'transparent',
  color: colors.text,
  cursor: 'pointer',
  transition: 'color 0.15s ease, border-color 0.15s ease',
  ':hover': {
    color: colors.primary,
    borderColor: colors.primary,
  },
});

export const footer = style({
  marginTop: '2rem',
  fontSize: '0.9rem',
  color: colors.text,
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  gap: '0.5rem',
});

export const link = style({
  color: colors.primary,
  textDecoration: 'none',
  transition: 'color 0.15s ease',
  ':hover': {
    textDecoration: 'underline',
  },
});

export const decorationTop = style({
  position: 'absolute',
  top: '20px',
  right: '20px',
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  background: `linear-gradient(45deg, ${colors.primary} 0%, transparent 70%)`,
  opacity: 0.2,
  filter: 'blur(30px)',
});

export const decorationBottom = style({
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  background: `linear-gradient(45deg, ${colors.primary} 0%, transparent 70%)`,
  opacity: 0.2,
  filter: 'blur(30px)',
});
