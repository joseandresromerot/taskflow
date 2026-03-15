# TaskFlow

Real-time Kanban board with team collaboration.

## Structure

```
taskflow/
├── apps/
│   ├── web/        # Next.js frontend
│   └── server/     # Fastify backend
├── packages/
│   └── types/      # Shared TypeScript types
└── docker-compose.yml
```

## Requirements

- Node.js 20+
- pnpm 10+
- Docker

## Getting started

```bash
pnpm install
docker-compose up -d   # Start PostgreSQL
pnpm dev               # Start all apps
```

See each app's README for detailed setup instructions.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Fastify, TypeScript, Prisma
- **Database:** PostgreSQL (Neon)
- **Real-time:** Socket.io
- **Auth:** NextAuth.js
