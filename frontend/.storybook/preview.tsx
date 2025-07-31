import type { Preview } from '@storybook/nextjs';
import React from 'react';
import { ThemeProvider } from '../src/styles/ThemeContext';
import '../src/styles/global.css';
import '../src/styles/theme.css.ts';
import '../src/styles/darkTheme.css.ts';
import '../src/styles/cyberpunkTheme.css.ts';
import '../src/styles/japanese90sTheme.css.ts';
import '../src/styles/disneyTheme.css.ts';
import '../src/styles/neoBrutalTheme.css.ts';
import '../src/styles/kdramaTheme.css.ts';
import '../src/styles/almostHermesTheme.css.ts';
import '../src/styles/slateMonochromeTheme.css.ts';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true, // Disable default backgrounds since we handle themes
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light">
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;