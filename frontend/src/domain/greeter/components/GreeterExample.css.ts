import { style } from '@vanilla-extract/css';

export const greeterExample = style({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '550px',
  margin: '2rem auto',
  padding: '2rem',
  borderRadius: '25px',
  boxShadow: '0 8px 20px rgba(140, 82, 255, 0.3), 0 4px 10px rgba(255, 159, 215, 0.2)',
  backgroundColor: '#1e1e1e', // Dark background
  color: '#e0e0e0', // Light text
  border: '3px solid #8c52ff', // Purple border
  position: 'relative',
  '::before': {
    content: '""',
    position: 'absolute',
    top: '-10px',
    left: '-10px',
    right: '-10px',
    bottom: '-10px',
    borderRadius: '30px',
    background: 'linear-gradient(45deg, rgba(140, 82, 255, 0.1), rgba(255, 159, 215, 0.1))',
    zIndex: -1,
  }
});

export const title = style({
  fontSize: '2rem',
  marginBottom: '1.5rem',
  color: '#ff9fd7', // Cute pink color
  textAlign: 'center',
  fontWeight: '700',
  letterSpacing: '1px',
});

export const formGroup = style({
  marginBottom: '1rem',
});

export const label = style({
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: 'bold',
  color: '#e0e0e0', // Light text
});

export const input = style({
  flex: 1,
  padding: '0.75rem',
  fontSize: '1.1rem',
  borderRadius: '20px', // Rounded corners for cute look
  border: '2px solid #8c52ff', // Purple border
  backgroundColor: '#2d2d2d', // Dark input background
  color: '#e0e0e0', // Light text
  letterSpacing: '0.5px',
  ':focus': {
    outline: 'none',
    borderColor: '#ff9fd7', // Pink border on focus
    boxShadow: '0 0 10px rgba(255, 159, 215, 0.3)', // Soft pink glow
  },
});

export const button = style({
  padding: '0.75rem 1.5rem',
  fontSize: '1.1rem',
  backgroundColor: '#8c52ff', // Purple background
  color: 'white',
  border: 'none',
  borderRadius: '20px', // Rounded corners for cute look
  cursor: 'pointer',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  boxShadow: '0 4px 8px rgba(140, 82, 255, 0.3)', // Soft purple shadow
  transition: 'all 0.3s ease',
  ':hover': {
    backgroundColor: '#ff9fd7', // Pink on hover
    transform: 'translateY(-2px)', // Slight lift effect
    boxShadow: '0 6px 12px rgba(255, 159, 215, 0.4)', // Enhanced shadow on hover
  },
  ':disabled': {
    backgroundColor: '#444',
    cursor: 'not-allowed',
    boxShadow: 'none',
    transform: 'none',
  },
});

export const errorMessage = style({
  marginTop: '1rem',
  padding: '1rem',
  backgroundColor: 'rgba(255, 107, 107, 0.15)', // Translucent red background
  color: '#ff9999', // Softer red text for K-drama style
  borderRadius: '20px', // Rounded corners for cute look
  border: '2px solid #ff6b6b', // Red border
  boxShadow: '0 4px 12px rgba(255, 107, 107, 0.2)', // Soft red shadow
  textAlign: 'center',
  fontSize: '1.1rem',
  lineHeight: '1.5',
});

export const response = style({
  marginTop: '1.5rem',
  padding: '1.2rem',
  backgroundColor: 'rgba(140, 82, 255, 0.15)', // Translucent purple background
  borderRadius: '20px', // Rounded corners for cute look
  border: '2px solid #8c52ff', // Purple border
  boxShadow: '0 4px 12px rgba(140, 82, 255, 0.2)', // Soft purple shadow
});

export const responseTitle = style({
  fontSize: '1.3rem',
  marginBottom: '0.8rem',
  color: '#ff9fd7', // Cute pink color
  fontWeight: 'bold',
  textAlign: 'center',
});

export const responseMessage = style({
  fontSize: '1.2rem',
  color: '#e0e0e0', // Light text
  textAlign: 'center',
  lineHeight: '1.6',
  padding: '0.5rem',
  backgroundColor: 'rgba(255, 159, 215, 0.1)', // Very light pink background
  borderRadius: '15px',
});

export const messagesContainer = style({
  height: '300px',
  overflowY: 'auto',
  marginBottom: '1rem',
  padding: '1rem',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: '15px',
  border: '1px solid #444',
});

export const message = style({
  marginBottom: '0.8rem',
  padding: '0.8rem',
  borderRadius: '15px',
  fontSize: '1rem',
  lineHeight: '1.4',
});

export const userMessage = style({
  backgroundColor: 'rgba(140, 82, 255, 0.2)',
  color: '#e0e0e0',
  marginLeft: '2rem',
  textAlign: 'right',
});

export const botMessage = style({
  backgroundColor: 'rgba(255, 159, 215, 0.2)',
  color: '#e0e0e0',
  marginRight: '2rem',
  textAlign: 'left',
});

export const chatForm = style({
  display: 'flex',
  gap: '0.5rem',
});
