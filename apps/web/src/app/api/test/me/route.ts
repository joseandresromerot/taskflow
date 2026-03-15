import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export const GET = async () => {
  if (process.env.E2E_TESTING !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  return NextResponse.json({ userId: session.user.id })
}
