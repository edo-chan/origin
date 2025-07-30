import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-controls",
    "@storybook/addon-actions",
  ],
  "framework": {
    "name": "@storybook/nextjs",
    "options": {}
  },
  "staticDirs": [
    "../public"
  ],
  "managerHead": (head) => `
    ${head}
    <base href="/ui/">
  `,
  "previewHead": (head) => `
    ${head}
    <base href="/ui/">
  `,
};
export default config;