# Kakatua Development Constitution

This document defines the architecture, styling principles, business logic rules, and operational guidelines for the **Kakatua** platform.

---

## 1. System Architecture

Kakatua is built as a high-concurrency, mobile-first Progressive Web Application (PWA).

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend/ORM**: PostgreSQL database using **Prisma ORM** (configured with client pooling and explicit model maps).
- **Video/Calling**: Peer-to-peer WebRTC signaling.
- **Directory Structure**:
  - `prisma/schema.prisma` (Database design)
  - `app/actions/` (Server Actions)
  - `components/` (Frontend UI elements)
  - `tailwind.config.js` (Design token configuration)

---

## 2. Styling Guidelines & Brand Aesthetic ("Nest & Flight")

The visual design system centers on the **"Nest"** aesthetic—prioritizing soft curves, nature-inspired colors, and unhurried whitespace.

- **Colors**:
  - Primary (Nature Green): `#2D5A27`
  - Secondary (Warm Sunset Yellow): `#F4B41A`
  - Background (Paper Off-white): `#FDFBF7`
  - Warning/Alert (Earthy Terracotta): `#C05A3E`
- **Geometries**:
  - Extra rounded corners: Minimum `rounded-xl` (12px/16px) for small containers, `rounded-3xl` (24px) for cards, and `rounded-full` for active action pills and buttons.
  - Generous spacing (element gaps of 12px, section gaps of 48px).
- **Depth**: Diffused, organic shadows with low opacity and ambient occlusion.

---

## 3. Core Business Logic Protocols

### A. Matching Engine ("Find a Kakatua")
- **Reciprocal Exchange Constraint**: A match requires that User A's `native_languages` overlap User B's `learning_languages` AND User A's `learning_languages` overlap User B's `native_languages`.
- **Compatibility Score Formula**: 
  $$\text{Compatibility\_Score} = (\text{Overlap\_Interests\_Count} \times 10) + (12 - \text{Timezone\_Circular\_Difference})$$
- **Timezone Circular Difference**: 
  $$\text{diff} = |\text{tz1} - \text{tz2}|$$
  $$\text{circular\_difference} = \min(\text{diff}, 24 - \text{diff})$$
- **Timeout**: Users seeking a match have a patience threshold of 600 seconds (10 minutes) before timing out and leaving the queue.

### B. Tiered Moderation System ("Alert the Flock")
Abuse reports must increment atomically and trigger suspensions/bans:
1. **5 Unique Reports**: 15-day suspension.
2. **10 Unique Reports**: 30-day suspension.
3. **20+ Unique Reports**: Permanent Account & IP ban.
- **Uniqueness**: The schema must enforce `UNIQUE(reporter_id, reported_id)` to prevent report-count spamming.
- **Atomicity**: Increments must be database-level atomic operations or transaction-locked to prevent stale-state reads during race conditions.

---

## 4. Operational Self-Correction Rule

> [!IMPORTANT]
> **Autocorrection Principle**: If any code change or database migration breaks the verified matching or moderation logic, the developer agent **MUST** run tests (e.g., execute `simulate.js` or unit checks), analyze the logs, and self-correct the code before proceeding.
