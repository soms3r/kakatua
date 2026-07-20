# Kakatua — Language & Culture Exchange

> Everyone belongs here.

Kakatua is an open-source, volunteer-led language and culture exchange platform. It moves beyond random chat by matching users through reciprocal language goals, timezone alignment, and shared interests.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend/ORM:** PostgreSQL + Prisma ORM
- **Auth:** Auth.js (planned)
- **Video:** P2P WebRTC (planned)
- **Hosting:** Vercel (frontend) / Railway or Render (database)

## Prerequisites

- **Node.js** >= 18 (tested with v22)
- **npm** >= 9
- **PostgreSQL** >= 14 running locally or remotely
- **PowerShell 5.1+** (Windows) or **bash** (macOS/Linux) for the integrity checker

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/soms3r/kakatua.git
cd kakatua
cp .env.example .env
npm install
```

### 2. Configure the database

Edit `.env` with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kakatua"
```

### 3. Run migrations

```bash
npm run db:migrate
```

This applies the SQL migrations in `db/migrations/` and generates the Prisma client.

### 4. Seed the database (optional)

Populates ambassador profiles — a Guide, a Global Buddy, and a Dhaka Local:

```bash
npm run seed
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Checks

### Integrity check

Validates schema consistency, import hygiene, and TypeScript safety:

```bash
npm run check
```

### Simulation

Runs the matching engine and moderation race-condition simulation:

```bash
npm run simulate
```

### Prisma Studio

Browse and edit data through a GUI:

```bash
npm run db:studio
```

## Project Structure

```
kakatua/
├── app/
│   ├── actions/         # Server Actions (reportUser, findAKakatua, etc.)
│   ├── components/      # React components (LayoutShell, TheNestDashboard, etc.)
│   ├── lib/             # Utility helpers (GitHub issue template)
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Tailwind base styles
├── prisma/
│   ├── schema.prisma    # Database schema (source of truth)
│   └── seed.ts          # Seed script for ambassador profiles
├── db/
│   └── migrations/      # SQL migration files
├── public/
│   ├── manifest.json    # PWA manifest
│   └── sw.js            # Service worker
├── simulate.js          # Matching & moderation simulation
├── run_integrity_check.ps1  # PowerShell integrity checker
├── VALIDATION_REPORT.md # Full-Stack Validation Protocol report
└── DEVELOPMENT_CONSTITUTION.md  # Architecture & business logic rules
```

## License

GPLv3 — Ensures the project remains open-source and that credit is maintained in all modifications.
