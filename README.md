<div align="center">

<img src="public/favicon.svg" alt="Kakatua Logo" width="120" />

# Kakatua

### Language & Culture Exchange

**Everyone belongs here.**

[![Beta](https://img.shields.io/badge/status-Beta-green?style=for-the-badge)](https://github.com/soms3r/kakatua)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06b6d4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.1-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io)

---

Find a language partner. Share your culture. Explore the world.

Kakatua goes beyond random chat. It matches you with the **right people** through
reciprocal language goals, timezone alignment, and shared interests — so every
conversation feels meaningful.

</div>

<br />

---

## Why Kakatua?

<table>
<tr>
<td width="50%" valign="top">

### The Problem

Random language exchange apps throw you into conversations with strangers across the globe at 3 AM. You get mismatched partners, dead conversations, and no real cultural exchange.

</td>
<td width="50%" valign="top">

### The Solution

Kakatua matches you with people who **speak what you're learning** and **want to learn what you speak** — in timezones that actually work. Every match is intentional.

</td>
</tr>
</table>

---

## Features

<table>
<tr>
<td align="center" width="25%">
<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f426/lottie.json" width="40"><br /><br />
<b>The Nest</b><br />
<sub>Your home dashboard with streaks,<br />missions, and daily engagement</sub>
</td>
<td align="center" width="25%">
<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f30d/lottie.json" width="40"><br /><br />
<b>Discover</b><br />
<sub>Explore a Culture Library of<br />countries, each with a story to tell</sub>
</td>
<td align="center" width="25%">
<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/lottie.json" width="40"><br /><br />
<b>Missions</b><br />
<sub>Earn EXP by completing cultural<br />tasks and building flight chains</sub>
</td>
<td align="center" width="25%">
<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f33a/lottie.json" width="40"><br /><br />
<b>Cultural Cards</b><br />
<sub>Create your card with traditions,<br />food, history, and fun facts</sub>
</td>
</tr>
</table>

<br />

- **Smart Matching** — Reciprocal language pairing with timezone and interest weighting
- **Cultural Cards** — Rich profiles with traditions, cuisine, history, and social etiquette
- **Culture Library** — Explore detailed country pages with language info, festivals, and cuisine
- **Ambassador System** — Community guardians: Guides, Global Buddies, and Local Experts
- **Missions & Progress** — Daily and weekly tasks to keep your language journey on track
- **Flock Feedback** — Built-in feedback system so the community shapes the platform
- **PWA Ready** — Installable on mobile and desktop for a native-app experience

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | React framework with server components |
| **Language** | TypeScript 5.7 | Type-safe development |
| **Styling** | Tailwind CSS 3.4 | Utility-first responsive design |
| **Database** | PostgreSQL / SQLite | Production / local development |
| **ORM** | Prisma 6.1 | Type-safe database access & migrations |
| **Auth** | NextAuth.js 4 | Credential-based authentication |
| **Runtime** | Node.js 22+ | Server runtime |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22 or newer
- [npm](https://www.npmjs.com/) 9 or newer
- [PostgreSQL](https://www.postgresql.org/) 14+ (or use SQLite for local dev)

### Install & Run

```bash
# 1. Clone the repository
git clone https://github.com/soms3r/kakatua.git
cd kakatua

# 2. Install dependencies
npm install

# 3. Set up your environment
cp .env.example .env
```

**For SQLite (quick start):**
```env
DATABASE_URL="file:./dev.db"
```

**For PostgreSQL (production):**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kakatua"
```

```bash
# 4. Run database migrations
npx prisma migrate dev

# 5. (Optional) Seed ambassador profiles
npx tsx prisma/seed.ts

# 6. Start the dev server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** and you're in the canopy.

---

## Project Structure

```
kakatua/
├── app/
│   ├── actions/           # Server Actions (matchmaking, reports, cards)
│   ├── api/               # API routes (auth, registration)
│   ├── components/        # UI components (LayoutShell, CultureCard, etc.)
│   ├── lib/               # Auth config & utilities
│   ├── discover/          # Culture Library pages
│   ├── missions/          # Mission tracker page
│   ├── profile/           # User profile & card creation
│   ├── legal/             # Legal pages (terms, privacy, about)
│   ├── login/             # Sign in
│   └── register/          # Create account
├── prisma/
│   ├── schema.prisma      # Database schema (source of truth)
│   ├── seed.ts            # Ambassador seed data
│   └── migrations/        # Database migration history
├── public/                # Static assets, PWA manifest, icons
├── simulate.js            # Matching & moderation simulation
└── tailwind.config.js     # Theme & design tokens
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma studio` | Open the database GUI |
| `npx tsx prisma/seed.ts` | Seed ambassador profiles |
| `node simulate.js` | Run matching & moderation simulation |

---

## How Matching Works

```
User A speaks English, learning Japanese
User B speaks Japanese, learning English
         ↓
    Reciprocal match!
         ↓
    Timezone check → compatible hours?
         ↓
    Interest overlap → conversation starters
         ↓
    🎉 Connected in The Nest
```

The matching engine considers:
- **Language reciprocity** — Both users get what they want
- **Timezone alignment** — Matches during overlapping active hours
- **Interest overlap** — Shared hobbies as conversation starters
- **Availability** — Only matches users currently searching

---

## Contributing

Contributions are welcome! Whether it's a bug fix, a new feature, or a cultural card for your country — every contribution helps the flock grow.

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-thing`)
3. **Commit** your changes (`git commit -m 'Add amazing thing'`)
4. **Push** to the branch (`git push origin feature/amazing-thing`)
5. **Open** a Pull Request

Please read [DEVELOPMENT_CONSTITUTION.md](DEVELOPMENT_CONSTITUTION.md) for architecture guidelines and business logic rules.

---

## License

Licensed under the **GNU General Public License v3.0** — ensuring Kakatua stays open-source and credit is maintained in all modifications. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with care for language learners everywhere.**

*Every nest has a story. Fly together, learn together.* 🌿

</div>
