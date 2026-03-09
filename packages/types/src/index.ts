
export enum Role {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
}

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  createdAt: Date
}

export interface Workspace {
  id: string
  name: string
  slug: string
  createdAt: Date
  members?: WorkspaceMember[]
  boards?: Board[]
}

export interface WorkspaceMember {
  id: string
  role: Role
  userId: string
  workspaceId: string
  user?: User
}

export interface Board {
  id: string
  name: string
  description: string | null
  workspaceId: string
  createdAt: Date
  columns?: Column[]
  labels?: Label[]
}

export interface Column {
  id: string
  name: string
  position: number
  boardId: string
  cards?: Card[]
}

export interface Card {
  id: string
  title: string
  description: string | null
  position: number
  dueDate: Date | null
  columnId: string
  assignees?: User[]
  labels?: Label[]
}

export interface Label {
  id: string
  name: string
  color: string
  boardId: string
}

export interface ActivityLog {
  id: string
  action: string
  metadata: Record<string, unknown> | null
  userId: string
  cardId: string | null
  createdAt: Date
  user?: User
}

export enum WSEvent {
  CARD_CREATED = "card:created",
  CARD_UPDATED = "card:updated",
  CARD_MOVED = "card:moved",
  CARD_DELETED = "card:deleted",
  COLUMN_CREATED = "column:created",
  COLUMN_UPDATED = "column:updated",
  COLUMN_REORDERED = "column:reordered",
  COLUMN_DELETED = "column:deleted",
  MEMBER_JOINED = "member:joined",
}

export interface WSPayload<T = unknown> {
  event: WSEvent
  boardId: string
  data: T
}