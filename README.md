# Hospital Vaccine Search & Slot Booking System

A full-stack web application for vaccine slot booking with hospital management capabilities.

## Project Structure

```
/apps
  /web          - Frontend application (React + shadcn/ui)
  /api          - Backend application (Node.js/Express)
/packages
  /contracts    - Shared API contracts and DTOs
  /ui           - Shared UI components (shadcn/ui wrappers)
  /config       - Shared configuration
  /types        - Shared TypeScript types
  /utils        - Shared utilities
/docs
  /architecture - Architecture documentation
  /api          - API documentation
  /db           - Database documentation
```

## Architecture Principles

- **Loose Coupling**: Frontend, backend, and database are independently replaceable
- **Modular Structure**: Feature-based organization with clear boundaries
- **Phase-Based Delivery**: Incremental development with stable contracts
- **Consistent Design**: shadcn/ui-based component system

## Getting Started

See individual app READMEs for setup instructions:
- [Frontend Setup](./apps/web/README.md)
- [Backend Setup](./apps/api/README.md)

## Documentation

- [Problem Statement](./ProblemStatement.md)
- [Implementation Plan](./agent_plan.md)
