# TaskFlow — Web

Next.js frontend with real-time Kanban board powered by WebSockets.

## Tech stack

- [Next.js 16](https://nextjs.org/) — React framework with App Router
- [NextAuth v5](https://authjs.dev/) — Authentication (Google, Apple OAuth)
- [shadcn/ui](https://ui.shadcn.com/) — Component library
- [Tailwind CSS v4](https://tailwindcss.com/) — Styling
- [dnd kit](https://dndkit.com/) — Drag and drop
- [Socket.io client](https://socket.io/) — Real-time updates
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [TypeScript](https://www.typescriptlang.org/)

## Requirements

- Node.js 20+
- pnpm 10+
- Backend server running (see `apps/server/README.md`)

## Setup

**1. Install dependencies**
```bash
pnpm install
```

**2. Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in the values:

```env
AUTH_SECRET="generate with: openssl rand -base64 32"
NEXT_PUBLIC_SERVER_URL="http://localhost:3001"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""
```

**3. Start the development server**
```bash
pnpm dev
```

App runs on `http://localhost:3000`.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm typecheck` | Type check without emitting |
| `pnpm lint` | Run ESLint |

## Project structure

```
src/
├── app/
│   ├── (auth)/login/         # Login page
│   ├── (app)/dashboard/      # Workspaces dashboard
│   ├── (app)/board/[boardId] # Kanban board
│   └── api/auth/             # NextAuth route handler
├── components/
│   ├── board/                # Board, column, card components
│   └── shared/               # Layout, sidebar, theme provider
├── hooks/
│   └── use-board.ts          # Board data + WebSocket hook
└── lib/
    ├── auth.ts               # NextAuth config
    ├── api.ts                # HTTP client for Fastify backend
    ├── prisma.ts             # Prisma client singleton
    └── socket.ts             # Socket.io client
```

## Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable OAuth consent screen
3. Create OAuth credentials (Web application)
4. Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`
5. Copy Client ID and Client Secret to your environment variables

## Deployment

Deployed on [Vercel](https://vercel.com). Set the following environment variables in the Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | Random secret string |
| `NEXT_PUBLIC_SERVER_URL` | URL of the deployed Fastify backend |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
