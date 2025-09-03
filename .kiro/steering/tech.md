# Technology Stack

## Core Framework
- **Next.js 15.5.2** with App Router and Turbopack
- **React 19.1.0** with TypeScript 5.9.2
- **Node.js** runtime with pnpm package manager

## Database & ORM
- **PostgreSQL** with Neon serverless
- **Drizzle ORM** for database operations and migrations
- **Snake case** naming convention for database schema

## Authentication
- **Better Auth** for authentication system
- **Google OAuth** as primary authentication provider
- Session-based authentication with database adapter

## API & State Management
- **oRPC** for type-safe API routes and client communication
- **TanStack Query** for server state management
- **Jotai** for client-side state management
- **TanStack Form** for form handling

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
pnpm db:generate      # Generate migration files
pnpm db:push          # Push schema changes to database
pnpm db:migrate       # Run pending migrations
```

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

### Docker
```bash
pnpm docker:up        # Start Docker services
```

## Environment Configuration
- Uses `@t3-oss/env-nextjs` for type-safe environment variables
- Separate client and server environment validation
- Development defaults for local PostgreSQL database