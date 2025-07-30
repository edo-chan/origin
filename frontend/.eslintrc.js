module.exports = {
  extends: ['next/core-web-vitals', 'plugin:storybook/recommended'],
  rules: {
    // Custom rule to enforce proto imports from @/proto path
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/proto/gen/web/**', '../proto/gen/web/**', '../../../../proto/gen/web/**'],
            message: 'Import proto types from @/proto/* instead of relative paths',
          },
        ],
      },
    ],
  },
};