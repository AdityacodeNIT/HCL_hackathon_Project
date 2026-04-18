# Agent Implementation Plan

## 1. Purpose of This Document

This document defines the implementation strategy for the **Hospital Vaccine Search & Slot Booking** application.

The goal is not just to build a working hackathon demo, but to build it in a way that is:

- loosely coupled
- modular
- scalable
- replaceable across layers
- safe to extend feature-by-feature
- easy for different team members to implement independently

This plan is intentionally detailed so that the frontend, backend, and database efforts can move in parallel without causing architectural drift.

---

## 2. Non-Negotiable Engineering Constraints

These constraints must be treated as architecture rules, not suggestions.

### 2.1 Loose Coupling Across Layers

The application must be designed so that the **frontend**, **backend**, and **database** are independently replaceable.

Examples:

- The frontend should be replaceable from React to another framework without requiring business-logic rewrites.
- The backend should be replaceable from Node.js/Express to Python/FastAPI/Django or Java/Spring without changing frontend contracts beyond agreed API behavior.
- The database should be replaceable from PostgreSQL to another relational or document store with minimal impact on business logic, provided the repository/data-access contract remains the same.

This means:

- business rules must not live inside UI components
- business rules must not depend directly on ORM-specific behavior
- route handlers/controllers must not contain core domain logic
- database models must not become the source of truth for business behavior
- API contracts must be explicit and versionable

### 2.2 Modular Structure

Every major feature must be developed as a module with:

- clear responsibility
- defined inputs/outputs
- isolated domain logic
- minimal awareness of other modules

Adding a new feature later should ideally involve:

- adding a new module
- plugging into shared contracts
- avoiding rewrites of existing stable modules

### 2.3 Phase-Based Delivery

We will not build the entire app at once.

We will build in phases so that:

- each phase is independently testable
- each phase has a clear deliverable
- backend, frontend, and database work can be done separately
- future phases build on stable contracts from earlier phases

### 2.4 Consistent Frontend Design System

The frontend must use **`shadcn/ui`** for reusable UI primitives and consistency.

This is required to ensure:

- repeated form patterns are not hand-built repeatedly
- table/dialog/card/input/button behavior is standardized
- the app stays visually consistent
- accessibility and composition are improved
- future screens can be built faster with reusable design building blocks

---

## 3. High-Level Architecture Strategy

We should treat the app as **three replaceable systems** plus a shared contract layer:

1. Frontend application
2. Backend application
3. Database/storage layer
4. Shared interface/contracts layer

### 3.1 Architectural Principle

The safest approach is a simplified **clean architecture / hexagonal architecture** mindset:

- UI depends on application contracts, not backend implementation details
- Backend entry points depend on use cases/services
- Use cases depend on interfaces, not framework code
- Data layer implements interfaces, but core domain does not depend on the data layer

### 3.2 Recommended Logical Layers

#### Frontend

- presentation layer
- feature modules
- shared UI system
- API client abstraction
- auth/session state

#### Backend

- transport layer (HTTP controllers/routes)
- application layer (use cases/services)
- domain layer (entities, rules, policies)
- infrastructure layer (ORM, DB adapter, auth provider, external adapters)

#### Database

- storage schema
- migration system
- indexing strategy
- seed data strategy

### 3.3 Replaceability Rule

Every cross-layer interaction must happen through a stable boundary:

- frontend to backend through API contract
- backend to database through repositories/interfaces
- backend auth through auth interface
- frontend state through API response models, not backend internals

If we keep these boundaries clean, changing a technology becomes a swap of implementation, not a rewrite of logic.

---

## 4. Recommended Repository Strategy

Even if kept in a single repo, the code should behave as if it were multiple replaceable packages.

### 4.1 Suggested Top-Level Structure

```text
/apps
  /web
  /api
/packages
  /contracts
  /ui
  /config
  /types
  /utils
/docs
  /architecture
  /api
  /db
```

### 4.2 Why This Structure

- `apps/web` contains the frontend implementation only
- `apps/api` contains the backend implementation only
- `packages/contracts` stores API shapes, shared DTOs, enums, validation schemas, and role constants
- `packages/ui` stores shared `shadcn/ui` wrappers and design conventions
- `packages/config` stores linting, TS config, formatting, env schemas, and other shared configuration
- `packages/utils` stores framework-agnostic helpers

This allows independent evolution while sharing only what should actually be shared.

### 4.3 Important Boundary Rules

- frontend must never import backend internals
- backend must never import frontend internals
- shared packages must never import app-specific runtime code
- contracts package should represent the boundary, not business logic

---

## 5. Core Domain Modules

The application should be divided into the following feature modules.

### 5.1 Identity & Access Module

Responsibilities:

- user registration
- login
- logout
- session/token validation
- role handling
- access control for protected routes

### 5.2 Hospital Management Module

Responsibilities:

- create/update hospital profile
- manage hospital details
- attach vaccines offered by hospital

### 5.3 Vaccine Catalog Module

Responsibilities:

- define vaccine types
- list supported vaccines
- manage descriptive metadata if needed

### 5.4 Hospital Vaccine Pricing Module

Responsibilities:

- map vaccines to hospitals
- store hospital-specific price for a vaccine
- manage active/inactive offerings

### 5.5 Capacity & Availability Module

Responsibilities:

- set daily capacity by hospital, vaccine, and date
- compute remaining availability
- expose availability for today, tomorrow, and upcoming days

### 5.6 Booking Module

Responsibilities:

- create booking
- modify booking
- cancel booking
- prevent duplicate booking
- prevent overbooking
- lock price at booking time

### 5.7 Search & Discovery Module

Responsibilities:

- search hospitals by city, pincode, name
- filter by vaccine
- filter by price range
- combine search with availability data

### 5.8 Admin Operations Module

Responsibilities:

- admin dashboard
- daily bookings view
- management of hospitals, pricing, and capacity

---

## 6. Cross-Cutting Standards

These rules apply to all phases.

### 6.1 API Contract Standards

Each API must define:

- request shape
- response shape
- validation rules
- error shape
- auth requirement
- versioning approach if needed

Recommended error format:

```json
{
  "success": false,
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "No slots available for the selected date."
  }
}
```

### 6.2 Validation Strategy

Validation should exist in multiple places, but with different responsibilities:

- frontend validates user experience and immediate feedback
- backend validates trust boundaries and business rules
- database enforces structural integrity and constraints

### 6.3 Testing Strategy

Each phase should include:

- frontend component tests for critical UI flows
- backend unit tests for use cases/business logic
- backend integration tests for APIs
- database tests for constraints and repository behavior

### 6.4 Environment Strategy

Separate environments should exist for:

- local development
- testing
- production/demo

Config must be environment-driven and never hardcoded.

---

## 7. Frontend Strategy

### 7.1 Frontend Goals

The frontend should:

- consume stable APIs
- avoid embedding business logic
- use feature-based organization
- rely on `shadcn/ui` for reusable visual building blocks
- remain replaceable with another frontend implementation if needed

### 7.2 Frontend Structure Principles

Suggested structure:

```text
/apps/web/src
  /app
  /features
    /auth
    /search
    /availability
    /booking
    /admin
  /components
  /lib
  /hooks
  /providers
```

### 7.3 shadcn/ui Requirements

`shadcn/ui` must be the base UI system for:

- buttons
- forms
- inputs
- dialogs
- sheets
- cards
- tables
- tabs
- badges
- toasts
- dropdowns
- date selection UI

We should create shared wrappers/compositions for repeated patterns such as:

- auth form shell
- page header
- search filter panel
- details card
- admin table layout
- booking confirmation dialog

This prevents repeated implementation and keeps the look consistent.

### 7.4 Frontend Design Rules

- avoid hardcoding API response assumptions across many components
- use a centralized API client layer
- keep pages thin and feature components focused
- keep route guards separate from page logic
- use reusable form primitives built on `shadcn/ui`
- ensure loading, empty, error, and success states are standardized

---

## 8. Backend Strategy

### 8.1 Backend Goals

The backend should:

- expose stable REST APIs
- isolate business logic from Express
- support future migration to another framework/language
- keep core use cases framework-agnostic

### 8.2 Backend Structure Principles

Suggested structure:

```text
/apps/api/src
  /modules
    /auth
    /hospitals
    /vaccines
    /pricing
    /availability
    /bookings
    /search
    /admin
  /shared
  /infrastructure
  /interfaces
```

Within a module:

```text
/bookings
  /domain
  /application
  /infrastructure
  /presentation
```

### 8.3 Backend Layer Responsibilities

#### Presentation Layer

- routes
- controllers
- request parsing
- response formatting

#### Application Layer

- use cases
- orchestration
- transaction boundaries

#### Domain Layer

- entities
- policies
- core rules
- invariants

#### Infrastructure Layer

- ORM implementation
- repository implementations
- token provider
- date provider
- logger

### 8.4 Backend Replaceability Rule

If we migrate from Express to FastAPI or Spring Boot:

- route/controller code changes
- dependency injection wiring changes
- repository implementations may change
- domain and application logic should remain conceptually the same

That is the target architecture outcome.

---

## 9. Database Strategy

### 9.1 Database Goals

The database should:

- preserve data integrity
- support efficient queries for search and availability
- support booking consistency
- remain abstracted behind repository contracts

### 9.2 Core Persistence Concepts

Likely data entities:

- users
- hospitals
- vaccines
- hospital_vaccines
- daily_slots
- bookings

### 9.3 Database Rules

- use explicit unique constraints where business rules require uniqueness
- index search-heavy fields like city, pincode, hospital name, and booking date
- use foreign-key-like relationships if relational DB is chosen
- avoid embedding business logic inside DB-specific stored procedures unless truly necessary

### 9.4 Database Replaceability Rule

The backend must not depend on direct SQL scattered across modules.

Instead:

- repositories define required behavior
- data access implementations satisfy the repository interfaces
- the rest of the system depends on repository contracts only

This makes a future DB migration manageable.

---

## 10. Phase-Wise Implementation Plan

The project will be implemented in carefully sequenced phases.

Each phase includes:

- goal
- deliverable
- backend responsibilities
- frontend responsibilities
- database responsibilities
- acceptance criteria

---

## Phase 0: Foundation, Architecture, and Developer Experience

### Goal

Set up the repository, standards, shared packages, and engineering rules before writing feature code.

### Deliverable

A clean project skeleton with isolated frontend/backend/shared layers and agreed conventions.

### Backend Expectations

- create backend app scaffold
- define module boundaries
- set up linting, formatting, env validation
- create base routing structure
- create error handling strategy
- create base repository/service abstractions

### Frontend Expectations

- create frontend app scaffold
- install and configure `shadcn/ui`
- establish theming, layout shell, and design tokens
- create base app routing
- set up query/data-fetching strategy
- define shared page states: loading, error, empty

### Database Expectations

- decide initial schema strategy
- set up migration tooling
- define seed strategy
- establish naming conventions for tables/collections and columns/fields

### Acceptance Criteria

- repo is structured by apps/packages or equivalent modular pattern
- `shadcn/ui` is configured and working
- shared contracts package exists
- backend has a health endpoint
- frontend has base shell and route structure
- DB migration flow is ready

---

## Phase 1: Authentication and Authorization

### Goal

Build a complete auth flow first, as the base for all protected operations.

### Deliverable

Users can register, log in, stay authenticated, and access role-specific areas.

### Backend Expectations

- implement registration use case
- implement login use case
- implement token/session generation
- implement password hashing strategy
- implement role-aware middleware/guard
- expose auth endpoints through stable contracts
- define current-user endpoint

Suggested backend endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout` if token invalidation/session model is used

### Frontend Expectations

- build login page using `shadcn/ui` form components
- build signup page using `shadcn/ui` form components
- create auth layout/shell
- create auth state/session provider
- create protected route behavior
- create role-based route access handling
- standardize form validation and error display

Suggested frontend reusable pieces:

- auth form container
- reusable input field wrapper
- password field component
- submit/loading button
- form-level error message component

### Database Expectations

- create users table/model
- include identity fields and role field
- enforce unique email or username
- define password storage field
- prepare indexes for authentication lookups

### Acceptance Criteria

- user can register successfully
- user can log in successfully
- invalid credentials are handled properly
- role protection works
- frontend stores and restores auth session properly
- auth logic is isolated from feature logic

### Notes on Coupling

- frontend should depend on auth API contract only
- auth service should depend on token/password interfaces, not specific libraries directly in the use case

---

## Phase 2: User Shell, Navigation, and Shared UX Foundations

### Goal

Build the main user-facing shell and reusable UI foundation before feature-heavy pages.

### Deliverable

Authenticated users land inside a consistent application shell with reusable components and route structure.

### Backend Expectations

- no major new business logic required
- expose any role/session-related metadata needed by frontend layout

### Frontend Expectations

- build app shell with header, sidebar/top nav, breadcrumbs if needed
- create reusable page container components
- create reusable cards, filters, tables, and status components
- define route groups for citizen and admin flows
- create standardized loading skeletons using `shadcn/ui`
- ensure responsive layout behavior

### Database Expectations

- no new core schema necessarily required

### Acceptance Criteria

- authenticated users see role-appropriate navigation
- screens can be composed rapidly from reusable `shadcn/ui`-based building blocks
- app shell does not hardcode business logic

---

## Phase 3: Hospital and Vaccine Master Data Management

### Goal

Enable admin users to manage hospital data and vaccine offerings.

### Deliverable

Admin can create/update hospital records and define which vaccines are offered.

### Backend Expectations

- implement hospital CRUD use cases
- implement vaccine catalog CRUD or seed-driven read model
- implement hospital-vaccine mapping use cases
- define validation for hospital fields
- define admin-only access control for these operations

Suggested endpoints:

- `POST /admin/hospitals`
- `PUT /admin/hospitals/:id`
- `GET /admin/hospitals`
- `GET /vaccines`
- `POST /admin/hospitals/:id/vaccines`

### Frontend Expectations

- build admin hospital list view
- build add/edit hospital form
- build vaccine mapping form
- use `shadcn/ui` dialog/drawer/form/table patterns
- add admin success/error feedback flows

### Database Expectations

- create hospitals table/model
- create vaccines table/model
- create hospital_vaccines junction table/model
- enforce uniqueness on hospital-vaccine relationship

### Acceptance Criteria

- admin can add and update hospital details
- admin can assign vaccines to hospitals
- duplicate mappings are prevented
- hospital and vaccine data is available for later search flows

### Notes on Coupling

- vaccine data should not be tightly embedded in hospital entity internals
- hospital-vaccine mapping should be its own module/model

---

## Phase 4: Pricing and Daily Capacity Management

### Goal

Allow admin users to define pricing and date-based slot capacity.

### Deliverable

Admin can set vaccine price per hospital and daily capacity per date.

### Backend Expectations

- implement hospital-specific pricing logic
- implement daily slot capacity CRUD/upsert logic
- define capacity rules
- define price validation rules
- define date validation rules

Suggested endpoints:

- `PUT /admin/hospital-vaccines/:id/price`
- `POST /admin/daily-slots`
- `PUT /admin/daily-slots/:id`
- `GET /admin/daily-slots`

### Frontend Expectations

- build admin pricing management screen
- build daily capacity management screen
- provide date picker and structured form validation
- show current configured capacity in table/calendar-like view

### Database Expectations

- extend hospital_vaccines with price if designed there
- or maintain pricing in a dedicated related structure
- create daily_slots table/model with:
  - hospital reference
  - vaccine reference
  - date
  - total_capacity
  - booked_count or computable booked total
- enforce one record per hospital + vaccine + date

### Acceptance Criteria

- admin can set/update price by hospital-vaccine combination
- admin can set capacity by date
- duplicate daily capacity records for the same combination are blocked
- data is queryable for public availability views

### Notes on Coupling

- pricing should remain a separate concern from vaccine definition
- capacity management should not be mixed into booking creation logic

---

## Phase 5: Search, Filter, and Discovery Experience

### Goal

Build the patient-facing hospital discovery experience.

### Deliverable

Users can search hospitals and filter by city, pincode, name, vaccine, and price.

### Backend Expectations

- implement search API
- implement filter logic
- support pagination if necessary
- return hospital summary response models that frontend can consume without extra transformation complexity

Suggested endpoints:

- `GET /hospitals/search`
- `GET /hospitals/:id`

Search filters may include:

- city
- pincode
- hospital name
- vaccine type
- min price
- max price

### Frontend Expectations

- build search page
- build reusable filter panel with `shadcn/ui`
- build search result cards/list/table
- build empty-state, error-state, and loading-state variants
- build hospital detail page shell

### Database Expectations

- add indexes supporting search
- verify search query patterns are performant

### Acceptance Criteria

- user can search by city/pincode/name
- user can filter by vaccine and price
- results are accurate and easy to scan
- hospital details can be opened cleanly

### Notes on Coupling

- search result view should consume response DTOs, not raw DB entity assumptions

---

## Phase 6: Availability Viewing

### Goal

Allow users to view day-wise vaccine availability for hospitals.

### Deliverable

Users can see availability for today, tomorrow, and upcoming dates.

### Backend Expectations

- implement availability query logic
- combine capacity and bookings data to compute remaining slots
- ensure date-based response structure is stable
- handle fully booked states gracefully

Suggested endpoints:

- `GET /hospitals/:id/availability`

### Frontend Expectations

- build day-wise availability component
- show available/limited/full status clearly
- support quick date selection
- integrate pricing visibility into the same area or nearby context

### Database Expectations

- ensure daily_slots and bookings can be queried efficiently together
- confirm indexes on date-based lookup paths

### Acceptance Criteria

- user sees correct availability by date
- full dates are clearly marked
- no ambiguous pricing/availability mismatch exists

### Notes on Coupling

- frontend should display availability from backend-calculated values
- avoid re-implementing slot calculation rules on the client

---

## Phase 7: Booking Creation Flow

### Goal

Build the most critical business flow: create a booking safely.

### Deliverable

A user can book a slot and receive confirmation without overbooking or price inconsistency.

### Backend Expectations

- implement booking creation use case
- validate user eligibility rules
- validate date rules
- validate duplicate booking rules
- check remaining capacity
- lock price at booking time
- create confirmation identifier
- update capacity/booked count consistently
- return clear domain-specific errors

Suggested endpoints:

- `POST /bookings`

### Frontend Expectations

- build booking form/confirmation flow
- show final selected hospital, vaccine, date, and locked price before submission
- handle slot-unavailable and duplicate-booking errors clearly
- show success confirmation screen/dialog

### Database Expectations

- create bookings table/model
- store booking status
- store locked price
- store confirmation reference
- enforce constraints supporting duplicate prevention where appropriate

### Acceptance Criteria

- booking succeeds only when capacity exists
- overbooking is prevented
- booking stores locked price
- user sees confirmation details clearly

### Notes on Coupling

- use case should own booking policy
- controller should only orchestrate request/response
- repository transaction handling must be abstract enough to replace persistence tech later

---

## Phase 8: Booking Management for Users

### Goal

Allow users to view, modify, and cancel bookings.

### Deliverable

Users can manage their existing bookings cleanly.

### Backend Expectations

- implement get-my-bookings use case
- implement modify booking use case
- implement cancel booking use case
- ensure slot counts are updated properly on cancel/change
- preserve audit-friendly status transitions

Suggested endpoints:

- `GET /bookings/me`
- `PATCH /bookings/:id`
- `DELETE /bookings/:id`

### Frontend Expectations

- build my bookings page
- build modify booking UI
- build cancel confirmation dialog
- clearly show booking status and locked price

### Database Expectations

- support booking status transitions
- ensure cancellation/update behavior preserves integrity

### Acceptance Criteria

- user can list bookings
- user can cancel booking
- user can modify eligible booking details
- slot counts remain correct after changes

---

## Phase 9: Admin Booking Visibility and Operational Dashboard

### Goal

Give admins operational visibility into bookings for a day.

### Deliverable

Admin can view bookings by date and hospital context.

### Backend Expectations

- implement booking list by date
- support filter by hospital and vaccine if needed
- expose summarized operational data

Suggested endpoints:

- `GET /admin/bookings`

### Frontend Expectations

- build admin daily bookings table
- add filters for date/hospital/vaccine
- use reusable `shadcn/ui` table and filter components

### Database Expectations

- optimize booking retrieval with indexes on date/hospital/vaccine/status

### Acceptance Criteria

- admin can view bookings for a selected day
- operational data is easy to scan
- filtering is performant enough for demo and future growth

---

## Phase 10: Hardening, Quality, and Demo Readiness

### Goal

Stabilize the system and ensure the demo is reliable.

### Deliverable

A tested, polished, coherent product suitable for presentation.

### Backend Expectations

- improve logging and error handling
- finalize validations
- write missing tests
- verify role protections
- verify critical booking edge cases

### Frontend Expectations

- polish loading states and errors
- improve empty states
- confirm responsive behavior
- remove duplicated UI logic
- confirm `shadcn/ui` patterns are consistently used

### Database Expectations

- verify migrations are clean
- verify seed data supports demo
- review indexes and constraints

### Acceptance Criteria

- end-to-end demo flow works without manual patching
- major edge cases are covered
- UI is consistent
- architecture remains modular and maintainable

---

## 11. Interface Contracts Between Teams

To allow separate implementation of frontend, backend, and database, each phase should define contracts before full coding begins.

### 11.1 Frontend Depends On

- API endpoint path
- request shape
- response shape
- auth requirement
- loading/error scenarios

### 11.2 Backend Depends On

- domain rules
- repository contracts
- DTO contracts
- auth strategy

### 11.3 Database Depends On

- domain entities
- uniqueness rules
- indexing expectations
- migration order

### 11.4 Team Rule

No team should block another team because of implementation details if the contract has already been agreed.

This is the key to parallel development.

---

## 12. Coupling Risks to Avoid

These are common mistakes that would violate the project constraints.

### Avoid:

- putting booking logic directly in Express route handlers
- making frontend components call raw URLs from many places without a central API client
- coupling UI directly to ORM/database response shapes
- sharing database entities directly with frontend without contract transformation
- mixing hospital management, pricing, and capacity logic into one oversized module
- writing one giant “utils” file with unrelated business logic
- putting auth checks inconsistently in controllers instead of policy/middleware layers
- creating repeated forms and tables instead of shared `shadcn/ui` compositions

---

## 13. Definition of Done for the Architecture

The architecture is considered healthy if:

- frontend, backend, and database can be worked on separately
- backend business logic is understandable without reading Express code
- database implementation can change behind repository boundaries
- UI remains consistent because of shared `shadcn/ui` patterns
- new features can be added as modules without breaking existing flows
- each phase can be completed, tested, and demoed independently

---

## 14. Recommended Build Order Summary

This is the exact order we should follow:

1. Foundation and architecture setup
2. Authentication and authorization
3. Shared UI shell and navigation
4. Hospital and vaccine master data management
5. Pricing and daily capacity setup
6. Search and filter experience
7. Availability viewing
8. Booking creation
9. Booking modification/cancellation
10. Admin booking visibility
11. Hardening, testing, and demo prep

This order minimizes rework and keeps the highest-risk logic behind stable earlier foundations.

---

## 15. Final Implementation Philosophy

We are not building a one-off demo with tightly interwoven code.

We are building a system where:

- each feature is a module
- each layer has clear boundaries
- contracts drive implementation
- frontend uses `shadcn/ui` for consistency and reuse
- backend logic is portable across frameworks
- data access is abstract enough to allow storage changes

If we follow this plan carefully, the app will remain:

- easy to build step by step
- easy to maintain
- easy to extend
- easy to demo
- and much easier to migrate later if the tech stack changes
