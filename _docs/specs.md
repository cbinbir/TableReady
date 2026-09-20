# Restaurant Waitlist Manager — Project Spec

## Overview
A lean, host-controlled waitlist and table-status tool for a single restaurant. No algorithms, no auth complexity, no multi-tenancy — designed to be simple to build and simple to operate at a busy host stand.

## Core Scope

### Intake
- **Primary**: host-entered — staff manually adds walk-ins at the podium/tablet
- **Secondary**: call-ahead — guests phone in, host logs it
- Call-ahead entries are **visually distinct** on the list (badge/icon) from walk-ins

### Wait Time Estimate
- Manual entry — host eyeballs it and types in a number
- No formula, no historical modeling

### Notification
- In-person only — host calls the party's name or walks over
- No SMS, no pagers, no notification infrastructure

### Floor / Table Management
- Table status board: open / occupied / dirty
- Host updates table status manually
- No auto-assignment or auto-matching of parties to tables

### Access / Roles
- Single shared login — one device at the podium
- No individual accounts, no role-based permissions

### Location Scope
- Single restaurant, single instance
- No multi-location or multi-tenant support

### Platform
- Responsive web app
- Works across tablet, phone, or desktop interchangeably

### Data & History
- Daily log kept as history (not session-only, not cleared each day)
- No analytics/reporting dashboard (no avg wait stats, no busiest-time breakdowns)

### No-Shows & Cancellations
- Tracked status — host marks a party as "no-show" or "cancelled"
- Entries are kept in the log with that status, not silently deleted

### Party Data Captured
- Name
- Party size
- Phone number
- Notes field

### Waitlist Ordering
- Manual reorder — host can move parties up/down the list
- Not strict FIFO; host has full control over sequencing

## Explicitly Out of Scope (for now)
These were considered and deliberately deferred as separate future builds:
- Self-service / QR-code guest sign-up
- Automated wait-time estimation (formula or historical)
- SMS/text notifications
- Pager/buzzer hardware integration
- Auto table-matching or table suggestions
- Multi-user roles/permissions
- Multi-location or multi-tenant SaaS support
- Reporting/analytics dashboard

## Design Rationale
Every "smart" feature skipped above is a separate build with its own failure modes (SMS delivery issues, bad auto-matching logic, etc.). This scope keeps the host in control and the system simple, with room to bolt on smarter features later without reworking the core.

## Next Steps
- Data model design
- Screen layout / UI design
