# Component Library Structure

This is a shadcn/ui-inspired component library built with:
- Tailwind CSS for styling
- Radix UI for accessible primitives
- Class Variance Authority (CVA) for variant management
- TypeScript for type safety

## Components

### Migrated to Tailwind
- ✅ Button - Full featured button with variants, sizes, loading states

### Ready to Migrate (with Radix UI)
- [ ] Input - Text input with Radix Label
- [ ] Card - Container component
- [ ] Modal/Dialog - Using Radix Dialog
- [ ] Select - Using Radix Select
- [ ] Switch - Using Radix Switch
- [ ] Checkbox - Using Radix Checkbox
- [ ] Slider - Using Radix Slider
- [ ] Dropdown - Using Radix Dropdown Menu
- [ ] Tooltip - Using Radix Tooltip
- [ ] Tabs - Using Radix Tabs
- [ ] Toast - Using Radix Toast

## Usage Pattern

Each component follows this structure:
1. Uses Radix UI primitives for accessibility
2. Styled with Tailwind utility classes
3. Variants managed with CVA
4. Fully typed with TypeScript
5. Forward refs for DOM access

## Example Component Structure

```typescript
import * as React from 'react'
import * as RadixPrimitive from '@radix-ui/react-primitive'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const componentVariants = cva(
  'base-styles',
  {
    variants: {
      variant: { /* ... */ },
      size: { /* ... */ }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

interface ComponentProps 
  extends React.ComponentPropsWithoutRef<typeof RadixPrimitive.Root>,
    VariantProps<typeof componentVariants> {}

const Component = React.forwardRef<
  React.ElementRef<typeof RadixPrimitive.Root>,
  ComponentProps
>(({ className, variant, size, ...props }, ref) => (
  <RadixPrimitive.Root
    ref={ref}
    className={cn(componentVariants({ variant, size, className }))}
    {...props}
  />
))

Component.displayName = RadixPrimitive.Root.displayName

export { Component }
```