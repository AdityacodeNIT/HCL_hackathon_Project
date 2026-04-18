Classification: Internal

Fullstack - Hackathon Use Case

Hospital Vaccine Search & Slot Booking

## Problem Statement

Citizens often struggle to identify nearby hospitals offering specific vaccines, understand daily availability, compare costs, and book slots without delays or overbooking.

## Objective

Build a web application that helps users find hospitals offering vaccines, check daily slot availability, view vaccine cost, and book a slot.

Hospitals/admin users should be able to manage vaccines, prices, and daily capacity.

## User Capabilities

Citizen / Patient

- Search hospitals by city / pincode / name
- Filter by vaccine type and price
- View availability day-by-day (today, tomorrow, upcoming days)
- See cost per vaccine per hospital
- Book a vaccine slot and receive a confirmation
- View, Modify or cancel existing bookings

Hospital / Admin

- Add and update hospital details
- Define vaccines offered and cost per dose
- Set daily slot capacity (date-based)
- View bookings for a given day

## What the Solution Must Handle (Core Expectations)

- Daily availability tracking (slots vary per date)
- No overbooking (once slots are filled, booking should fail gracefully)
- Price transparency (show and lock price at booking time)
- Persistent data storage (users, hospitals, vaccines, bookings)

## Key Features to Demonstrate Full-Stack Skills

- Search & filter experience (UX matters)
- Clean backend logic for availability & booking
- Proper data modeling for hospitals, vaccines, slots, bookings
- Role separation (user vs admin)
- Basic validations (date, availability, duplicate booking)

## Design and Tech Stack

Candidates are free to decide:

- How slots are modeled (time-based, count-based, hybrid)
- Exact API structure
- UI flow and layout
- Database schema choices
- Tech stack and patterns
