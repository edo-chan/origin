import { tokens, darkTheme } from '../tokens.css';
import { oceanTheme } from './ocean.css';
import { sunsetTheme } from './sunset.css';
import { forestTheme } from './forest.css';
import { lavenderTheme } from './lavender.css';
import { midnightTheme } from './midnight.css';

export const themes = {
  light: tokens,
  dark: darkTheme,
  ocean: oceanTheme,
  sunset: sunsetTheme,
  forest: forestTheme,
  lavender: lavenderTheme,
  midnight: midnightTheme,
} as const;

export type ThemeName = keyof typeof themes;

export {
  oceanTheme,
  sunsetTheme,
  forestTheme,
  lavenderTheme,
  midnightTheme,
};