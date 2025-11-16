# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DateLog Backend Service** - REST API for a date course recording service built with Node.js, TypeScript, Express, PostgreSQL, and Prisma.

**Current Status**: Phase 4 complete (deployment configuration ready). Database migration not yet executed locally - see NEXT_STEPS.md for critical blockers.

## Development Commands

### Daily Development Workflow
```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Type checking without emitting files
npm run type-check

# Code quality
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
npm run format        # Format with Prettier
```

### Database Operations (Prisma)
```bash
# Generate Prisma Client (run after schema changes)
npm run db:generate

# Create and apply migration
npm run db:migrate

# Push schema without migration (dev only)
npm run db:push

# Deploy migrations to production
npm run db:migrate:deploy

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

### Testing
```bash
# Run all tests
npm test

# Watch mode for TDD
npm test:watch

# Coverage report
npm test:coverage
```

### Environment-Specific Commands
```bash
# Staging
npm run build:staging
npm run start:staging

# Production
npm run build:production
npm run start:production
```

## Architecture Overview

### Core Structure
```
src/
├── app.ts              # Express app configuration (middleware, routes)
├── server.ts           # Server startup with graceful shutdown
├── config/
│   ├── database.ts     # Prisma client singleton
│   └── env.ts          # Environment variable validation
├── routes/
│   ├── index.ts        # Health check + API route aggregation
│   ├── date.routes.ts  # Date entry endpoints
│   ├── cafe.routes.ts  # Cafe endpoints
│   ├── restaurant.routes.ts
│   └── spot.routes.ts
├── controllers/        # Request/response handling
├── services/           # Business logic + database operations
├── middlewares/
│   ├── error.middleware.ts    # Centralized error handling
│   └── logger.middleware.ts   # Request logging
├── types/
│   └── api.types.ts    # TypeScript interfaces for API
└── utils/
    └── response.util.ts # Standardized API response helpers
```

### Layer Responsibilities

**Route → Controller → Service → Database**

- **Routes**: URL mapping, route-level middleware
- **Controllers**: HTTP request/response handling, validation, status codes
- **Services**: Business logic, data transformation, Prisma queries
- **Database**: Prisma Client operations (singleton pattern in `config/database.ts`)

### Database Schema Pattern

**Parent-Child Relationship**: `DateEntry` (1) → (N) `Cafe | Restaurant | Spot`

All child entities:
- Reference `dateEntryId` (foreign key with cascade delete)
- Share common fields: `name`, `memo?`, `image?`, `link?`, `visited`, `latitude?`, `longitude?`, `createdAt`, `updatedAt`
- Use UUID primary keys
- Have indexed foreign keys and `visited` status

**Restaurant-specific**: `type` field (한식, 일식, 중식, 고기집, 전체)

### API Response Pattern

All endpoints follow standardized response format via `response.util.ts`:

```typescript
// Success responses
success(res, data, message?)           // 200 OK
created(res, data, message?)           // 201 Created

// Error responses
badRequest(res, message)               // 400
notFound(res, message)                 // 404
internalError(res, message, error?)    // 500
```

### Service Layer Pattern

Services return business entities or `null` (not throwing errors for "not found"):

```typescript
// Example from date.service.ts
export const getDateEntryById = async (id: string): Promise<DateEntryResponse | null>

// Controllers handle null → 404 response
if (!dateEntry) {
  return notFound(res, 'Date entry not found');
}
```

### Data Transformation

Each service has a `transform*` function converting Prisma types → API response types:
- Converts `Date` objects to ISO strings
- Handles `null` → `undefined` for optional fields
- Includes all relations when fetching parent entities

## Critical Implementation Rules

**From IMPLEMENTATION_ROADMAP.md - Must follow:**

1. **Never Assume**: If API spec is unclear, data types are ambiguous, or business logic is uncertain → **ASK** before implementing
2. **Identify Issues**: Performance problems (N+1 queries), security vulnerabilities, scalability constraints → **RAISE** immediately
3. **Confirm Designs**: Multiple implementation approaches, architecture changes, library choices → **DISCUSS** before proceeding
4. **Validate Specs**: If implementation conflicts with API specification, database schema, or frontend requirements → **CLARIFY** first

**Principle**: "Don't guess, confirm" - uncertainty requires explicit validation before coding

## Database Migration Workflow

**CRITICAL**: Database not yet initialized locally. Before any database operations:

1. Check `.env` file exists with `DATABASE_URL`
2. Run `npm run db:generate` (creates Prisma Client)
3. Run `npm run db:migrate` (applies schema to database)
4. Verify with `npm run db:studio`

**Migration rules**:
- Development: Use `db:migrate` (creates migration files)
- Production: Use `db:migrate:deploy` (applies existing migrations only)
- Always run `db:generate` after schema changes

## Environment Variables

**Required**:
- `DATABASE_URL` - PostgreSQL connection string (Prisma requires this)
- `PORT` - Server port (default: 3000, Render uses 3001)
- `NODE_ENV` - development | staging | production

**Optional**:
- `CORS_ORIGIN` - CORS allowed origin (default: `*`)

Template available in project root (copy to `.env` before first run)

## Health Check & API Documentation

- **Health Check**: `GET /v1/health` - Returns service status (used by Render)
- **API Docs**: `GET /v1/docs` - Links to OpenAPI spec and markdown docs
- **Root**: `GET /` - Service info and endpoint directory

## Deployment (Render)

Configuration in `render.yaml`:
- **Staging**: Free tier, `main` branch, manual deploy
- **Production**: Starter tier, `production` branch, auto-deploy

**Build Command**: `npm ci && npx prisma generate && npm run build`
**Start Command**: `npm start`

**Pre-deployment checklist**:
1. Test locally with `npm run build` && `npm start`
2. Verify environment variables in Render dashboard
3. Run database migration via Render shell after first deployment
4. Update `CORS_ORIGIN` after frontend deployment

## TypeScript Configuration

Strict mode enabled with comprehensive checks:
- `strict: true` - All strict type-checking options
- `noUnusedLocals`, `noUnusedParameters` - Enforce cleanup
- `noImplicitReturns`, `noFallthroughCasesInSwitch` - Logic safety

Build output: `dist/` (gitignored)

## Common Patterns

### Adding a New Entity

1. Update `prisma/schema.prisma` with new model
2. Run `npm run db:migrate` to create migration
3. Create types in `src/types/api.types.ts`
4. Create service in `src/services/[entity].service.ts` with transform function
5. Create controller in `src/controllers/[entity].controller.ts`
6. Create routes in `src/routes/[entity].routes.ts`
7. Register routes in `src/routes/index.ts`

### Error Handling Pattern

Controllers use standardized responses, services return `null` or throw for unexpected errors:

```typescript
// Service returns null for not found
const entity = await getEntityById(id);
if (!entity) {
  return notFound(res, 'Entity not found');
}
```

Unexpected errors caught by `error.middleware.ts` (logged and return 500)

### Pagination Pattern

Services accept `skip` and `take` parameters, return `{ data: [], total: number }`:

```typescript
const { data, total } = await getAllEntities(filters, skip, take);
return success(res, { data, total, page, limit });
```

## Testing Status

Test infrastructure configured (Jest + Supertest) but tests not yet implemented.

When writing tests:
- Place in `src/**/*.test.ts` (automatically excluded from build)
- Use Supertest for API integration tests
- Mock Prisma Client for unit tests


## General Rules

1. **Clarify Ambiguities**
    - Always ask questions whenever the user's request seems ambiguous, unclear, or logically inconsistent.
    - Do not assume or infer meaning without explicit confirmation from the user.

2. **Language Policy**
    - All responses, documentation, and generated files must be written in **Korean**, unless the user explicitly requests otherwise.

3. **Provide Multiple Optimal Solutions**
    - For any development-related request, propose **at least three possible solutions or approaches** before starting any implementation.
    - Each proposed approach must:
        - Clearly explain *why* it is considered optimal.
        - Highlight trade-offs or limitations.
        - Avoid premature coding until the user chooses one.

4. **Use Common Components First**
    - Prioritize reusing shared UI components such as `MInput`, `MButton`, `MIcon`, etc.
    - Always verify if a reusable component already exists before developing new ones.
    - If creating a new component or using plain HTML elements, provide a clear justification (e.g., functional, stylistic, or technical reasons).

5. **Separation of Page and Business Logic**
    - Follow the **Single Responsibility Principle (SRP)**.
    - Keep page-level components and business logic strictly separated for maintainability and clarity.