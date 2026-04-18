# Hospital Vaccine Search & Slot Booking System

A simplified JS-only monorepo for the hackathon app.

## Tech Stack

- `apps/web`: React + Vite + Tailwind CSS + shadcn-style UI components
- `apps/api`: Express + PostgreSQL + JWT auth

## Structure

```text
/apps
  /web
  /api
/docs
  /architecture
  /api
  /db
```

## Current Phase

The repository now covers:

- foundation setup
- real authentication
- role-aware app entry for `patient` and `admin`
- hospital and vaccine master data management
- PostgreSQL-ready backend structure

## Commands

```bash
npm install
npm run migrate:api
npm run dev
```

## App Roles

- `patient`: search, compare, and manage bookings
- `admin`: manage hospitals, pricing, daily capacity, and bookings

## Next Functional Phase

The next build slice should be:

1. price setup per hospital-vaccine offering
2. actual time-slot creation and capacity management
3. patient search and availability browsing
4. booking flow
