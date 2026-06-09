# AquaFlow

Multi-tenant water distribution management system for the UAE market.

## Tech stack

- **Frontend:** React (Vite) + Tailwind CSS — `/client`
- **Backend:** Node.js + Express — `/server`
- **Database:** Google Sheets API (`googleapis`) — one spreadsheet, one tab per table
- **Auth:** JWT with role-based access control (super_admin / admin / driver)

## Project structure

```
/client                → React frontend (Vite + Tailwind)
/server                → Express API
/server/sheets         → Google Sheets read/write logic (client, schema, CRUD, init script)
/server/routes         → auth, admin (super admin), distributor, driver routes
/server/middleware     → JWT verification + role guard
```

## Roles

| Role | Description |
|---|---|
| Super Admin | Platform owner — manages distributors and support tickets |
| Admin (Distributor) | Manages their own customers, drivers and orders |
| Driver | Receives and completes delivery tasks |

## Google Sheets schema

Each tab is one table; row 1 is the header row.

- **Distributors** — id, company_name, trade_license, registration_doc_url, contact_email, contact_phone, status, created_at
- **Admins** — id, distributor_id, name, email, password_hash, status
- **Customers** — id, distributor_id, name, phone, address, emirate, type[one_time|subscription], subscription_frequency, subscription_qty, last_order_date, next_followup_date, notes, created_at
- **Drivers** — id, distributor_id, name, phone, email, password_hash, status[active|inactive], is_live[true|false], created_at
- **Orders** — id, distributor_id, customer_id, driver_id, type[one_time|subscription], qty, status[pending|assigned|in_transit|delivered|cancelled], scheduled_date, delivered_at, notes, created_at
- **SupportTickets** — id, distributor_id, raised_by_admin_id, subject, description, status[open|in_progress|resolved], created_at, resolved_at

## Setup

1. Install dependencies:
   ```bash
   npm run install:all
   ```
2. Create a Google Cloud service account with the Sheets API enabled, create an
   empty spreadsheet, and share it with the service account email (Editor).
3. Copy `server/.env.example` to `server/.env` and fill in:
   - `GOOGLE_SHEETS_CREDENTIALS` — service account JSON (single line)
   - `SPREADSHEET_ID`
   - `JWT_SECRET`
   - `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`
4. Create the sheet tabs and header rows:
   ```bash
   npm run sheets:init
   ```
5. Run both apps in development:
   ```bash
   npm run dev
   ```
   API: http://localhost:4000 — Client: http://localhost:5173 (proxies `/api`)

## Deployment

- **Client:** Vercel — build command `npm run build`, root directory `client`.
- **Server:** Railway — root directory `server`, start command `npm start`.
  Set the env vars from `.env.example` in the Railway dashboard.
