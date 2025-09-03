# Project Structure & Conventions

## File Organization

### App Router Structure
```
src/app/
├── (app)/                    # App group for main application
│   ├── (auth)/              # Authentication routes (login, signup)
│   │   ├── @image/          # Parallel route for auth images
│   │   └── layout.tsx       # Auth layout with dual-split view
│   ├── (main)/              # Main application routes
│   │   ├── (home)/          # Home page route group
│   │   ├── interview/       # Interview feature
│   │   ├── matches/         # Job matching feature
│   │   ├── settings/        # User settings
│   │   └── _modules/        # Main layout components
│   └── _modules/            # App-level shared components
├── api/auth/[...all]/       # Better Auth API routes
└── rpc/[[...rest]]/         # oRPC API handler
```

### Source Code Organization
```
src/
├── atoms/                   # Jotai state atoms
├── components/              # Reusable UI components
├── config/                  # Configuration files
│   ├── env.ts              # Environment validation
│   ├── public-config.ts    # Client-side config
│   └── server-config.ts    # Server-side config
├── db/                     # Database layer
│   ├── models/             # Drizzle schema definitions
│   ├── migrations/         # Database migrations
│   └── utils.ts            # Database utilities
├── form/                   # Form components and utilities
├── lib/                    # Core library functions
├── orpc/                   # API layer
│   ├── controllers/        # API route handlers
│   ├── middleware/         # oRPC middleware
│   └── router.ts           # API router definition
├── styles/                 # Global CSS files
├── svgs/                   # SVG components
└── utils/                  # Utility functions
```

## Naming Conventions

### Files & Folders
- **kebab-case** for file and folder names
- **PascalCase** for React components
- **camelCase** for TypeScript files and utilities
- **snake_case** for database schema (enforced by Drizzle config)

### Import Aliases
- `~/` maps to `src/` directory for clean imports
- Prefer absolute imports over relative imports

### Component Structure
- Use `.tsx` extension for React components
- Use `.ts` extension for utilities and non-React code
- Group related components in feature folders with `_modules/` subdirectories

## Architecture Patterns

### Route Groups
- Use parentheses `()` for route groups that don't affect URL structure
- Separate authentication and main app layouts
- Use parallel routes `@` for complex layouts (e.g., auth images)

### API Layer
- **oRPC** controllers in `src/orpc/controllers/`
- Type-safe client-server communication
- Middleware for authentication and common logic
- Global client available as `$client` in server components

### State Management
- **Jotai atoms** for client-side state in `src/atoms/`
- **TanStack Query** for server state caching
- **TanStack Form** for form state management

### Database Layer
- **Drizzle models** in `src/db/models/`
- Export all models from `src/db/models/index.ts`
- Use `snake_case` for database column names
- Migrations auto-generated in `src/db/migrations/`

### Authentication Flow
- **Better Auth** handles authentication logic
- Session-based authentication with database persistence
- Google OAuth as primary provider
- Auth utilities in `src/lib/auth.ts`

## Code Style Guidelines

### TypeScript
- Strict TypeScript configuration enabled
- Use `type` for object shapes, `interface` for extensible contracts
- Prefer `const` assertions and `as const` for immutable data

### React Components
- Use function components with TypeScript
- Prefer named exports over default exports for components
- Use `ReactNode` type for children props

### Styling
- **Tailwind CSS** for component styling
- **Mantine** components for complex UI elements
- Use `cn()` utility from `src/utils/cn.ts` for conditional classes
- Responsive design with mobile-first approach

### Import Organization
- Prettier plugin automatically sorts imports
- External packages first, then internal modules
- Group imports by: React, Next.js, external packages, internal modules