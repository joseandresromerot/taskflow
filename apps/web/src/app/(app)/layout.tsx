import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/shared/sidebar"

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export default AppLayout
