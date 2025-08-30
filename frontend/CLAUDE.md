# Claude Frontend Development Guidelines

## Overview
Modern Next.js application with Tailwind CSS, Turborepo, and component-driven development.

## Tech Stack

### Core Technologies
- **Framework**: Next.js 14 (Pages Router, migrating to App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4 (replacing Vanilla Extract)
- **State Management**: Jotai 2.x
- **Build System**: Turborepo
- **Component Development**: Storybook 8.x
- **UI Primitives**: Radix UI

### Development Tools
- **Package Manager**: pnpm (for Turborepo efficiency)
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier with Tailwind plugin
- **Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright

## Migration Plan from Vanilla Extract to Tailwind

### Phase 1: Setup & Configuration (Priority)
1. **Install Tailwind CSS**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npm install -D @tailwindcss/typography @tailwindcss/forms
   npm install -D prettier prettier-plugin-tailwindcss
   ```

2. **Create Tailwind Config**
   - Design tokens mapping from Vanilla Extract themes
   - Custom color palette
   - Spacing scale (8px grid system)
   - Typography scale
   - Animation presets

3. **Utility Functions**
   ```typescript
   // utils/cn.ts - Class name merger
   import { clsx, type ClassValue } from 'clsx'
   import { twMerge } from 'tailwind-merge'
   
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }
   ```

### Phase 2: Component Migration Strategy
1. Start with atomic components (Button, Input, Card)
2. Use `class-variance-authority` for variant management
3. Preserve existing component APIs
4. Maintain Storybook stories during migration

### Phase 3: Turborepo Integration
1. **Monorepo Structure**
   ```
   origin/
   ├── apps/
   │   ├── web/          # Next.js app
   │   └── storybook/    # Storybook instance
   ├── packages/
   │   ├── ui/           # Shared components
   │   ├── config/       # Shared configs
   │   └── tsconfig/     # TS configs
   └── turbo.json
   ```

2. **Performance Benefits**
   - Parallel builds
   - Remote caching
   - Incremental builds
   - Task orchestration

## Component Guidelines

### Component Structure Template
```typescript
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'

const componentVariants = cva(
  'base-classes',
  {
    variants: {
      variant: { /* ... */ },
      size: { /* ... */ }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

interface ComponentProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {}

export const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <element
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
```

## Design System

### Color Palette
- **Primary**: Blue shades (#0ea5e9 base)
- **Secondary**: Golden yellows (#eab308 base)  
- **Tertiary**: Forest greens (#22c55e base)
- **Neutral**: Gray scale
- **Semantic**: Success, Warning, Error, Info

### Typography
- **Font Families**:
  - Sans: Inter (body text)
  - Heading: System UI with weight variations
  - Mono: JetBrains Mono (code)

### Spacing Scale (8px Grid)
```
0, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24
(0px, 2px, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px)
```

### Breakpoints
- Mobile: 640px
- Tablet: 768px
- Desktop: 1024px
- Wide: 1280px

## Storybook Configuration

### Setup for Tailwind
1. Import global CSS in `.storybook/preview.tsx`
2. Configure viewport addon for responsive testing
3. Add theme switcher for light/dark modes
4. Document component variants and props

### Story Template
```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Component } from './Component'

const meta: Meta<typeof Component> = {
  title: 'UI/Component',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline']
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Component'
  }
}
```

## Performance Optimizations

### Build Performance (Turborepo)
- Parallel task execution
- Smart caching strategies
- Incremental builds
- Remote caching setup

### Runtime Performance
- Component code splitting
- Dynamic imports for heavy components
- Image optimization with Next.js Image
- Font optimization
- CSS purging in production

### Bundle Size
- Tree shaking
- Remove unused CSS with Tailwind
- Analyze bundle with `@next/bundle-analyzer`
- Lazy load third-party scripts

## Development Workflow

### Commands
```bash
# Development
npm run dev           # Start Next.js dev server
npm run storybook     # Start Storybook

# Building
npm run build         # Production build
npm run build-storybook # Build static Storybook

# Quality
npm run lint          # ESLint
npm run type-check    # TypeScript check
npm run format        # Prettier

# With Turborepo (future)
turbo dev            # Start all apps
turbo build          # Build all packages
turbo test           # Run all tests
```

### Git Workflow
1. Feature branches from `main`
2. Conventional commits
3. PR with passing checks
4. Squash merge to main

## Migration Checklist

### Immediate Tasks
- [ ] Install Tailwind CSS and dependencies
- [ ] Create tailwind.config.js with design tokens
- [ ] Setup PostCSS configuration
- [ ] Create utility functions (cn)
- [ ] Add Prettier Tailwind plugin

### Component Migration (Priority Order)
- [ ] Button component
- [ ] Input component  
- [ ] Card component
- [ ] Text component
- [ ] Stack layout component
- [ ] Modal component
- [ ] Form components

### Cleanup Tasks
- [ ] Remove Vanilla Extract dependencies
- [ ] Delete .css.ts files after migration
- [ ] Update Storybook configuration
- [ ] Update component imports

### Turborepo Setup
- [ ] Initialize Turborepo
- [ ] Configure workspaces
- [ ] Move to pnpm
- [ ] Setup shared packages
- [ ] Configure build pipeline

## Best Practices

### Do's
- Use Tailwind utilities first
- Create reusable component variants with CVA
- Follow 8px spacing grid
- Implement responsive design mobile-first
- Use semantic color tokens
- Maintain accessibility standards

### Don'ts
- Avoid inline styles
- Don't use arbitrary values excessively
- Don't create one-off utility classes
- Avoid deep component nesting
- Don't override Tailwind defaults unnecessarily

## Resources
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Turborepo Docs](https://turbo.build/repo/docs)
- [Radix UI Docs](https://www.radix-ui.com/docs)
- [CVA Docs](https://cva.style/docs)
- [Next.js Docs](https://nextjs.org/docs)

---
*Last Updated: 2025-08-29*