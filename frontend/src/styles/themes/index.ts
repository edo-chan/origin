import { tokens, darkTheme } from '../tokens.css';
import { minimalLightTheme } from './minimal-light.css';
import { modernRoundedTheme } from './modern-rounded.css';
import { neoBrutalTheme } from './neo-brutal.css';
import { softPastelTheme } from './soft-pastel.css';
import { darkProTheme } from './dark-pro.css';

export const allThemes = {
  light: 'light-theme', // Default light theme class
  dark: darkTheme,
  'minimal-light': minimalLightTheme,
  'modern-rounded': modernRoundedTheme,
  'neo-brutal': neoBrutalTheme,
  'soft-pastel': softPastelTheme,
  'dark-pro': darkProTheme,
} as const;

export type ThemeName = keyof typeof allThemes;

export const themeLabels: Record<ThemeName, string> = {
  light: 'Light',
  dark: 'Dark',
  'minimal-light': 'Minimal Light',
  'modern-rounded': 'Modern Rounded',
  'neo-brutal': 'Neo Brutal',
  'soft-pastel': 'Soft Pastel',
  'dark-pro': 'Dark Pro',
};

// Export individual themes
export {
  tokens as lightTheme,
  darkTheme,
  minimalLightTheme,
  modernRoundedTheme,
  neoBrutalTheme,
  softPastelTheme,
  darkProTheme,
};