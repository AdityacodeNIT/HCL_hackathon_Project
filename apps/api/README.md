# Backend API Application

Node.js/Express backend following clean architecture principles.

## Structure

```
/src
  /modules          - Feature modules
    /{module}
      /domain       - Entities, rules, policies
      /application  - Use cases, services
      /infrastructure - ORM, repositories, adapters
      /presentation - Routes, controllers
  /shared           - Shared utilities
  /infrastructure   - Cross-cutting infrastructure
  /interfaces       - Interface definitions
```

## Modules

- **auth**: Authentication and authorization
- **hospitals**: Hospital management
- **vaccines**: Vaccine catalog
- **pricing**: Hospital-vaccine pricing
- **availability**: Daily slot capacity
- **bookings**: Booking management
- **search**: Hospital search and filtering
- **admin**: Admin operations

## Setup

Instructions coming soon.
