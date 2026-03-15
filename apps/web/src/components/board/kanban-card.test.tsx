import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { KanbanCard } from "./kanban-card"
import type { Card } from "@taskflow/types"

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    setNodeRef: vi.fn(),
    attributes: {},
    listeners: {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => "" } },
}))

const baseCard: Card = {
  id: "card-1",
  title: "Fix login bug",
  description: null,
  position: 0,
  dueDate: null,
  columnId: "col-1",
}

describe("KanbanCard", () => {
  it("renders the card title", () => {
    render(<KanbanCard card={baseCard} />)
    expect(screen.getByText("Fix login bug")).toBeInTheDocument()
  })

  it("does not show due date when not set", () => {
    render(<KanbanCard card={baseCard} />)
    expect(screen.queryByText(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i)).not.toBeInTheDocument()
  })

  it("shows formatted due date when set", () => {
    const card = { ...baseCard, dueDate: new Date("2026-06-15T12:00:00") }
    render(<KanbanCard card={card} />)
    expect(screen.getByText("Jun 15")).toBeInTheDocument()
  })

  it("renders a color strip for each label", () => {
    const card = {
      ...baseCard,
      labels: [
        { label: { id: "l1", name: "Bug", color: "#EF4444", boardId: "b1" } },
        { label: { id: "l2", name: "Feature", color: "#6366F1", boardId: "b1" } },
      ],
    }
    const { container } = render(<KanbanCard card={card} />)
    expect(container.querySelectorAll("[style*='background-color']")).toHaveLength(2)
  })

  it("calls onClick with the card when clicked", () => {
    const onClick = vi.fn()
    render(<KanbanCard card={baseCard} onClick={onClick} />)
    fireEvent.click(screen.getByText("Fix login bug"))
    expect(onClick).toHaveBeenCalledOnce()
    expect(onClick).toHaveBeenCalledWith(baseCard)
  })

  it("applies drag overlay styles when isDragging prop is true", () => {
    const { container } = render(<KanbanCard card={baseCard} isDragging />)
    expect(container.firstChild).toHaveClass("rotate-1")
  })
})
