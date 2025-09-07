# Technology Stack

## Core Framework
- **Next.js 15.5.2** with App Router and Turbopack
- **React 19.1.0** with TypeScript 5.9.2
- **Node.js** runtime with pnpm package manager

## Database & ORM
- **PostgreSQL** with Neon serverless
- **Drizzle ORM** for database operations and migrations
- **Snake case** naming convention for database schema
- **Push-based migrations** - Use `pnpm db:push` instead of traditional migrations. Never worry about generating or managing migration files manually.

## Authentication
- **Better Auth** for authentication system
- **Google OAuth** as primary authentication provider
- Session-based authentication with database adapter

## API & State Management
- **oRPC** for type-safe API routes and client communication
- **TanStack Query** for server state management
- **Jotai** for client-side state management
- **TanStack Form** for form handling

> **Note**: See `api-patterns.md` for detailed oRPC controller patterns and guidelines

## UI & Styling
- **Tailwind CSS 4.1.12** for styling
- **Mantine 8.2.8** for UI components
- **Framer Motion** for animations
- **Lucide React** for icons
- **Geist font** as primary typeface

## Development Tools
- **ESLint** with TypeScript and Prettier integration
- **Prettier** for code formatting with import sorting
- **Docker Compose** for local development environment
- **Vercel** for deployment

## Common Commands

### Development
```bash
pnpm dev              # Start development server with Docker
pnpm dev:next         # Start Next.js only (without Docker)
pnpm dev-prep         # Generate database schema
pnpm dev-migrate      # Push database changes
```

### Database Operations
```bash
pnpm db:push          # Push schema changes to database (primary workflow)
pnpm db:generate      # Generate migration files (rarely needed)
pnpm db:migrate       # Run pending migrations (rarely needed)
```

**Database Workflow**: This project uses Drizzle's push-based workflow. Simply modify your schema files and run `pnpm db:push` to sync changes to the database. Traditional migration files are auto-managed and you should never need to create or modify them manually.

### Code Quality
```bash
pnpm lint             # Run ESLint
pnpm lint:prettier    # Check Prettier formatting
pnpm fix:eslint       # Auto-fix ESLint issues
pnpm fix:prettier     # Auto-format with Prettier
```

### Build & Deploy
```bash
pnpm build            # Build for production
pnpm start            # Start production server
pnpm vercel-build     # Build for Vercel deployment
```

### Testing & Validation
```bash
pnpm tsc --noEmit     # Type check without building (preferred for validation)
pnpm test             # Run vitest tests
```

**Important**: Never use `pnpm build` to test if the application is sound. Instead:
- Use `pnpm tsc --noEmit` for type checking and validation
- Use vitest tests for functionality testing
- Building is only for production deployment, not for testing

### Docker
```bash
pnpm docker:up        # Start Docker services
```

## Component Organization
- **Never create `_components` folders** - Use `_modules` instead
- **`_modules/` folders** - For components localized to specific areas of the codebase
- **`src/components/` folder** - For globally reusable components across the application

## Environment Configuration
- Uses `@t3-oss/env-nextjs` for type-safe environment variables
- Separate client and server environment validation
- Development defaults for local PostgreSQL database