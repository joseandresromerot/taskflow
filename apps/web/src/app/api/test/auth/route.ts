import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

const TEST_USER_EMAIL = "e2e-test@taskflow.io"

export const GET = async () => {
  if (process.env.E2E_TESTING !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const user = await prisma.user.upsert({
    where: { email: TEST_USER_EMAIL },
    update: {},
    create: {
      email: TEST_USER_EMAIL,
      name: "E2E Test User",
      emailVerified: new Date(),
    },
  })

  await prisma.session.deleteMany({ where: { userId: user.id } })

  const sessionToken = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.session.create({
    data: { sessionToken, userId: user.id, expires },
  })

  const response = NextResponse.redirect(new URL("/dashboard", "http://localhost:3000"))
  response.cookies.set("authjs.session-token", sessionToken, {
    httpOnly: true,
    secure: false,
    expires,
    path: "/",
    sameSite: "lax",
  })

  return response
}
