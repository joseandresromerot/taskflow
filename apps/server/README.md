# TaskFlow — Server

Fastify REST API with WebSocket support for real-time collaboration.

## Tech stack

- [Fastify](https://fastify.dev/) — HTTP server
- [Prisma](https://www.prisma.io/) — ORM
- [PostgreSQL](https://www.postgresql.org/) — Database
- [Socket.io](https://socket.io/) — WebSockets
- [Zod](https://zod.dev/) — Schema validation
- [TypeScript](https://www.typescriptlang.org/)

## Requirements

- Node.js 20+
- pnpm 10+
- Docker (for local PostgreSQL)

## Setup

**1. Install dependencies**
```bash
pnpm install
```

**2. Set up environment variables**
```bash
cp ../../.env.example .env
```

**3. Start the database**
```bash
docker-compose up -d
```
> Run from the monorepo root.

**4. Run database migrations**
```bash
pnpm exec prisma migrate dev
```

**5. Start the server**
```bash
pnpm dev
```

Server runs on `http://localhost:3001`.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start in watch mode |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Run compiled output |
| `pnpm typecheck` | Type check without emitting |

## API overview

| Prefix | Resource |
|--------|----------|
| `/api/workspaces` | Workspaces and members |
| `/api/boards` | Boards |
| `/api/columns` | Columns |
| `/api/cards` | Cards, assignees, labels and activity |
| `/health` | Health check |

## WebSocket events

All events are scoped to a board room (`board:<id>`).

| Event | Trigger |
|-------|---------|
| `card:created` | New card added |
| `card:updated` | Card edited |
| `card:moved` | Card moved between columns |
| `card:deleted` | Card removed |
| `column:created` | New column added |
| `column:reordered` | Columns reordered |
| `member:joined` | New member joined workspace |
