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

The repository now covers the initial product phase:

- foundation setup
- real authentication
- role-aware app entry for `patient` and `admin`
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

After auth, the next build slice should be:

1. hospital and vaccine master data
2. price and time-slot setup
3. hospital search and availability
4. booking flow
