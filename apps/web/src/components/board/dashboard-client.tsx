"use client"

import { useState } from "react"
import { DashboardHeader } from "./dashboard-header"
import { WorkspaceList } from "./workspace-list"

type DashboardClientProps = {
  name: string
  userId: string
}

export const DashboardClient = ({ name, userId }: DashboardClientProps) => {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <>
      <DashboardHeader name={name} userId={userId} onCreated={() => setRefreshKey((k) => k + 1)} />
      <WorkspaceList userId={userId} refreshKey={refreshKey} />
    </>
  )
}
