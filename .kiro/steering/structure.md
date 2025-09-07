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

#### oRPC Controller Patterns
- **Never use explicit output schemas** - oRPC infers return types from handler functions
- **Always inline input schemas** - Use `z.object({})` directly in `.input()` calls
- **Use middleware bases** - `publicBase` for public endpoints, `protectedBase` for authenticated
- **Export individual handlers** - Export each handler separately, then combine in default export
- **Follow naming conventions** - Use camelCase for handler names matching API endpoints

### State Management
- **Jotai atoms** for client-side state in `src/atoms/`
- **TanStack Query** for server state caching
- **TanStack Form** for form state management - **always use TanStack Form for all forms**

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
- **Never use `interface`** - Always use `type` for all type definitions
- **Inline function parameter types** - Never create separate types for function parameters
- **Destructure parameters** - Always destructure what is used from function parameters
- **Always remove unused variables** - Clean up unused imports, variables, and parameters
- Prefer `const` assertions and `as const` for immutable data

### React Components
- Use function components with TypeScript
- Prefer named exports over default exports for components
- Use `ReactNode` type for children props

### Styling
- **Tailwind CSS** for all structural styling, layouts, and basic visual properties
- **Mantine components** for interactive elements only (buttons, inputs, modals, selects, etc.)
- **Always use `cn()` utility** from `src/utils/cn.ts` for conditional classes and class logic
- **Responsive design** with mobile-first approach using Tailwind breakpoints
- **Avoid Mantine for structure** - Use native HTML/JSX with Tailwind for containers, grids, sections, and layout elements
- **Granular Mantine usage** - Only use Mantine when you need the interactive functionality, not for basic styling

### Class Name Utilities
- **Use `cn()` for all conditional styling**: `cn('base-class', condition && 'conditional-class')`
- **Use `cn()` for merging classes**: `cn('default-classes', customClassName)`
- **Never use template literals** for conditional classes - always use the `cn()` utility
- The `cn()` utility combines `classix` and `tailwind-merge` for optimal class handling

### Forms
- **Always use TanStack Form** for all form implementations
- Combine TanStack Form with Mantine form components (TextInput, Button, etc.)
- Never use native HTML form elements or other form libraries

## UI Design System

### Custom Spacing System
The application uses a custom spacing system defined in `src/styles/globals.css`. **Always prioritize these custom spacing values**:

```css
--spacing-xs: 0.25rem;   /* Use: p-xs, m-xs, gap-xs, space-y-xs */
--spacing-sm: 0.5rem;    /* Use: p-sm, m-sm, gap-sm, space-y-sm */
--spacing-md: 1rem;      /* Use: p-md, m-md, gap-md, space-y-md */
--spacing-lg: 2rem;      /* Use: p-lg, m-lg, gap-lg, space-y-lg */
--spacing-xl: 4rem;      /* Use: p-xl, m-xl, gap-xl, space-y-xl */
--spacing-2xl: 8rem;     /* Use: p-2xl, m-2xl, gap-2xl, space-y-2xl */
--spacing-3xl: 16rem;    /* Use: p-3xl, m-3xl, gap-3xl, space-y-3xl */
```

### Color System
- **Primary Brand Color**: `--color-better-indigo: #1e3a8a`
- **Background**: `--background: #fcfcfc` 
- **Foreground**: `--foreground: #171717`
- Use semantic color names from Mantine's color system for UI elements

### Typography
- **Primary Font**: `--font-sans` (Instrument Sans)
- **Monospace Font**: `--font-mono` (Geist Mono)  
- **Display Font**: `--font-rakkas` (Rakkas) - Used for headings and titles
- Use Mantine's `Title`, `Text` components with appropriate `size` and `c` (color) props

### Layout Patterns
- **Page Structure**: Use `PageContainer` component for consistent page layouts
- **Navigation**: Collapsible sidebar with `SideNav` component
- **Dual Layouts**: Use `DualSplitView` for auth pages and split-screen layouts
- **Responsive**: Mobile-first approach with `md:` breakpoints for desktop

### Component Usage Philosophy

**Granular Mantine Usage**: Use Mantine components only for interactive or complex UI elements that benefit from their built-in functionality (buttons, inputs, modals, dropdowns, etc.). Avoid using Mantine for basic structural elements.

**Tailwind for Structure**: Use base Tailwind CSS and HTML/JSX for all structural and layout elements (containers, grids, flexbox layouts, spacing, etc.). This maintains consistency and reduces bundle size.

**Layered Component Architecture**: Build components with singular responsibilities that can be composed together. Each component should have a clear, focused purpose.

**Consistent Styling**: Maintain visual consistency across the app by using the custom spacing system and established design tokens rather than arbitrary values.

### Component Hierarchy
1. **Layout Components** (`PageContainer`, `DualSplitView`, `SideNav`) - Built with Tailwind CSS
2. **Structural Components** (containers, grids, sections) - Built with Tailwind CSS and HTML/JSX
3. **Mantine UI Components** (Button, TextInput, Modal, Select, etc.) - For interactive elements only
4. **Custom Components** (only when Mantine doesn't provide the needed functionality)

### Spacing Guidelines
- **Container Padding**: Use `p-md` for standard container padding
- **Section Spacing**: Use `space-y-md` for vertical spacing between sections
- **Component Gaps**: Use `gap-md` for standard component spacing
- **Tight Spacing**: Use `gap-sm` or `space-y-xs` for closely related elements
- **Generous Spacing**: Use `gap-lg` or `space-y-lg` for distinct sections

### Interactive Elements
- **Buttons**: Always use Mantine `Button` component with appropriate variants
- **Forms**: Combine TanStack Form with Mantine form components
- **Navigation**: Use consistent hover states and transitions
- **Loading States**: Implement proper loading indicators with Mantine components

### Import Organization
- Prettier plugin automatically sorts imports
- External packages first, then internal modules
- Group imports by: React, Next.js, external packages, internal modules