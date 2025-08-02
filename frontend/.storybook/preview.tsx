import type { Preview } from '@storybook/nextjs';
import React from 'react';
import { ThemeProvider } from '@/ui/styles/ThemeContext';
import '@/ui/styles/global.css';
import '@/ui/styles/theme.css.ts';
import '@/ui/styles/darkTheme.css.ts';
import '@/ui/styles/cyberpunkTheme.css.ts';
import '@/ui/styles/japanese90sTheme.css.ts';
import '@/ui/styles/disneyTheme.css.ts';
import '@/ui/styles/neoBrutalTheme.css.ts';
import '@/ui/styles/kdramaTheme.css.ts';
import '@/ui/styles/almostHermesTheme.css.ts';
import '@/ui/styles/slateMonochromeTheme.css.ts';

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