import { style } from '@vanilla-extract/css';

export const container = style({
  minHeight: '100vh',
  padding: '0 2rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#121212', // Dark background
  color: '#e0e0e0', // Light text
});

export const main = style({
  padding: '4rem 0',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

export const title = style({
  margin: 0,
  lineHeight: 1.15,
  fontSize: '4rem',
  textAlign: 'center',
});

export const description = style({
  margin: '4rem 0',
  lineHeight: 1.5,
  fontSize: '1.5rem',
  textAlign: 'center',
});

export const grid = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  maxWidth: '800px',
});

export const card = style({
  margin: '1rem',
  padding: '1.5rem',
  textAlign: 'left',
  color: 'inherit',
  textDecoration: 'none',
  border: '1px solid #eaeaea',
  borderRadius: '10px',
  transition: 'color 0.15s ease, border-color 0.15s ease',
  maxWidth: '300px',
  ':hover': {
    color: '#0070f3',
    borderColor: '#0070f3',
  },
});

export const cardTitle = style({
  margin: '0 0 1rem 0',
  fontSize: '1.5rem',
});

export const cardText = style({
  margin: 0,
  fontSize: '1.25rem',
  lineHeight: 1.5,
});

export const footer = style({
  display: 'flex',
  flex: 1,
  padding: '2rem 0',
  borderTop: '1px solid #eaeaea',
  justifyContent: 'center',
  alignItems: 'center',
});

export const footerLink = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexGrow: 1,
});
