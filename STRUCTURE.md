# Project Structure Documentation

This document provides a complete overview of the folder and file structure for the Vaccine Booking System.

## Root Level

```
/
├── apps/                    # Application packages
├── packages/                # Shared packages
├── docs/                    # Documentation
├── .gitignore              # Git ignore rules
├── package.json            # Root package.json (workspace config)
├── README.md               # Project overview
├── ProblemStatement.md     # Original problem statement
├── agent_plan.md           # Detailed implementation plan
└── STRUCTURE.md            # This file
```

## Apps Directory

### Frontend Application (`apps/web/`)

```
apps/web/
├── src/
│   ├── app/                # Next.js app router / main app
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── features/           # Feature modules
│   │   ├── auth/           # Authentication feature
│   │   ├── search/         # Hospital search feature
│   │   ├── availability/   # Availability viewing feature
│   │   ├── booking/        # Booking management feature
│   │   └── admin/          # Admin operations feature
│   ├── components/         # Reusable components
│   │   ├── ui/             # shadcn/ui primitives
│   │   └── shared/         # Shared composed components
│   ├── lib/                # Utilities and helpers
│   ├── hooks/              # Custom React hooks
│   ├── providers/          # Context providers
│   └── styles/             # Global styles
│       └── globals.css
├── package.json
└── README.md
```

### Backend Application (`apps/api/`)

```
apps/api/
├── src/
│   ├── modules/            # Feature modules
│   │   ├── auth/           # Authentication module
│   │   │   ├── domain/         # Entities, rules, policies
│   │   │   ├── application/    # Use cases, services
│   │   │   ├── infrastructure/ # Repositories, adapters
│   │   │   └── presentation/   # Routes, controllers
│   │   ├── hospitals/      # Hospital management module
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   ├── vaccines/       # Vaccine catalog module
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   ├── pricing/        # Pricing module
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   ├── availability/   # Availability module
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   ├── bookings/       # Booking module
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   ├── search/         # Search module
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   └── admin/          # Admin operations module
│   │       ├── domain/
│   │       ├── application/
│   │       ├── infrastructure/
│   │       └── presentation/
│   ├── shared/             # Shared utilities
│   ├── infrastructure/     # Cross-cutting infrastructure
│   ├── interfaces/         # Interface definitions
│   └── index.ts            # Application entry point
├── package.json
└── README.md
```

## Packages Directory

### Contracts Package (`packages/contracts/`)

```
packages/contracts/
├── src/
│   └── index.ts            # API contracts, DTOs, validation schemas
├── package.json
└── README.md
```

Purpose: Shared API contracts between frontend and backend

### UI Package (`packages/ui/`)

```
packages/ui/
├── src/
│   └── index.ts            # shadcn/ui wrappers and compositions
├── package.json
└── README.md
```

Purpose: Reusable UI components and design system

### Config Package (`packages/config/`)

```
packages/config/
├── src/
│   └── (config files)      # Linting, TS config, formatting
└── package.json
```

Purpose: Shared configuration files

### Types Package (`packages/types/`)

```
packages/types/
├── src/
│   └── index.ts            # Shared TypeScript types
└── package.json
```

Purpose: Framework-agnostic type definitions

### Utils Package (`packages/utils/`)

```
packages/utils/
├── src/
│   └── index.ts            # Framework-agnostic utilities
└── package.json
```

Purpose: Shared utility functions

## Documentation Directory

```
docs/
├── architecture/           # Architecture decisions and diagrams
│   └── README.md
├── api/                    # API endpoint documentation
│   └── README.md
└── db/                     # Database schema and migration docs
    └── README.md
```

## Module Layer Responsibilities

### Domain Layer
- Entities
- Business rules
- Domain policies
- Invariants
- No framework dependencies

### Application Layer
- Use cases
- Service orchestration
- Transaction boundaries
- Application-specific logic

### Infrastructure Layer
- ORM implementations
- Repository implementations
- External service adapters
- Database access
- Token providers
- Logging

### Presentation Layer
- HTTP routes
- Controllers
- Request parsing
- Response formatting
- Input validation

## Key Architectural Principles

1. **Loose Coupling**: Each layer depends on abstractions, not implementations
2. **Feature Modules**: Code organized by business capability
3. **Shared Contracts**: API boundaries defined in contracts package
4. **Replaceability**: Any layer can be swapped without affecting others
5. **Parallel Development**: Teams can work independently on frontend/backend/database

## Next Steps

1. Initialize package managers and dependencies
2. Set up TypeScript configurations
3. Configure linting and formatting
4. Set up build tooling
5. Begin Phase 0 implementation (Foundation)

## Notes

- All `index.ts` files are placeholder exports
- README files provide context for each major section
- Structure supports monorepo tooling (npm workspaces, pnpm, yarn, turborepo)
- Each module follows clean architecture principles
