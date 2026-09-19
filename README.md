# SportsVilla Backend

This is the Next.js backend and admin dashboard for the SportsVilla platform. 

## Architectural Overview: Modular Domain-Driven Design (MDDD)

To maintain scalability and prevent massive file bloat, this project strictly adheres to a **Modular Domain-Driven Design** architecture. 

Business logic is strictly decoupled from the Next.js routing layer. The `src/app/` directory is responsible **only** for HTTP routing and React UI rendering. All actual business logic, database transactions, background workers, and external service integrations live in `src/modules/`.

### Directory Structure

```text
src/
├── app/                  # Next.js App Router (UI, Pages, Layouts)
│   └── (admin)/          # Admin Dashboard - ONLY imports from src/modules/
├── modules/              # Core Domain Business Logic
│   ├── bookings/         # Example Module
│   ├── crm/
│   ├── members/
│   └── wallets/
├── automations/          # Centralized Cron Jobs and Background Tasks
│   └── tasks/
└── lib/                  # Global Infrastructure ONLY (Prisma, Logger, etc.)
```

### Module File Conventions

When building or modifying a feature within `src/modules/[module_name]/`, strictly follow this naming convention to ensure separation of concerns:

| File Type | Naming Convention | Purpose |
| :--- | :--- | :--- |
| **Server Actions** | `[module].action.ts` | Next.js `"use server"` endpoints. These act as controllers, validating inputs before passing them to libraries. |
| **Domain Logic** | `lib/*.lib.ts` | The core database queries, mutations, and business rules. Should be chunked by sub-domain (e.g., `booking-creation.lib.ts`) if it gets too large. Knows nothing about HTTP. |
| **Services** | `[module].services.ts` | Complex domain integrations or third-party orchestrations (e.g., NFC Checkin Service). |
| **Background Workers**| `[module].worker.ts` | Asynchronous operations, queue processors, or heavy background jobs. |
| **External Integrations**| `[module].whatsapp.ts` | Third-party formatting and API payload construction (e.g., formatting WhatsApp templates). |
| **Utilities** | `[module].helper.ts` | Pure functions, date manipulation, pricing calculators, status mappers. |

### Architectural Rules (Do's and Don'ts)

1. **DO NOT put business logic in `src/app/`:** Files like `src/app/(admin)/bookings/actions.ts` should only contain backwards-compatible re-exports or extremely thin wrappers that immediately call `src/modules/bookings/bookings.action.ts`.
2. **DO NOT put domain logic in `src/lib/`:** `src/lib/` is exclusively for global, domain-agnostic infrastructure. For example, `src/lib/prisma.ts` is fine, but `src/lib/whatsapp-booking-sender.ts` is strictly forbidden. It belongs in `src/modules/whatsapp/` or `src/modules/bookings/`.
3. **DO NOT let `.lib.ts` files get massive:** If a library file exceeds ~300-400 lines, chunk it into a `lib/` sub-folder by specific domains (e.g., `lib/booking-payment.lib.ts` and `lib/booking-queries.lib.ts`).
4. **DO put all crons in `src/automations/`:** If you write a task that runs on a timer, it belongs in `src/automations/tasks/[name].task.ts`, coordinated by the unified `/api/cron` runner.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the admin dashboard.
