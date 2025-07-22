# Domain-Driven Design with Jotai

This directory contains the domain-driven structure for the frontend application. It uses Jotai for state management and organizes code around business domains.

## Structure

The domain directory is organized as follows:

```
domain/
├── index.ts                # Exports all domains
├── README.md              # This file
└── greeter/               # Greeter domain
    ├── index.ts           # Exports the Greeter domain API
    ├── types.ts           # Domain-specific types
    ├── atoms.ts           # Jotai atoms for state management
    ├── service.ts         # Service layer for API communication
    └── hooks.ts           # React hooks for using the domain
```

## Adding a New Domain

To add a new domain:

1. Create a new directory under `domain/` with the name of your domain
2. Create the following files:
   - `types.ts`: Define domain-specific types
   - `atoms.ts`: Define Jotai atoms for state management
   - `service.ts`: Define service layer for API communication
   - `hooks.ts`: Define React hooks for using the domain
   - `index.ts`: Export the domain API
3. Update `domain/index.ts` to export your new domain

## Using a Domain in Components

Import the domain hooks in your component:

```tsx
import { useGreeter } from '../domain/greeter';

export const MyComponent = () => {
  const { name, setName, sayHello } = useGreeter();
  
  // Use the domain in your component
  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => sayHello()}>Say Hello</button>
    </div>
  );
};
```

## Benefits of This Approach

- **Separation of Concerns**: Domain logic is separated from UI components
- **Reusability**: Domain logic can be reused across components
- **Testability**: Domain logic can be tested independently of UI components
- **Type Safety**: TypeScript types are generated from gRPC definitions
- **State Management**: Jotai provides a simple and efficient state management solution