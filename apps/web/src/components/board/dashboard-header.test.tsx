import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { DashboardHeader } from "./dashboard-header"

vi.mock("./create-workspace-modal", () => ({
  CreateWorkspaceModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="workspace-modal" /> : null,
}))

describe("DashboardHeader", () => {
  const defaultProps = {
    name: "Jose",
    userId: "user-1",
    onCreated: vi.fn(),
  }

  it("renders greeting with user name", () => {
    render(<DashboardHeader {...defaultProps} />)
    expect(screen.getByText(/good morning, jose/i)).toBeInTheDocument()
  })

  it("renders the subtitle", () => {
    render(<DashboardHeader {...defaultProps} />)
    expect(screen.getByText(/here are your workspaces/i)).toBeInTheDocument()
  })

  it("renders the New Workspace button", () => {
    render(<DashboardHeader {...defaultProps} />)
    expect(screen.getByRole("button", { name: /new workspace/i })).toBeInTheDocument()
  })

  it("modal is closed by default", () => {
    render(<DashboardHeader {...defaultProps} />)
    expect(screen.queryByTestId("workspace-modal")).not.toBeInTheDocument()
  })

  it("opens modal when New Workspace button is clicked", () => {
    render(<DashboardHeader {...defaultProps} />)
    fireEvent.click(screen.getByRole("button", { name: /new workspace/i }))
    expect(screen.getByTestId("workspace-modal")).toBeInTheDocument()
  })
})
