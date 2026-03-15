import { auth } from "@/lib/auth"
import { DashboardClient } from "@/components/board/dashboard-client"

const DashboardPage = async () => {
  const session = await auth()
  const firstName = session?.user?.name?.split(" ")[0] ?? "there"

  return (
    <div className="p-4 sm:p-8">
      <DashboardClient name={firstName} userId={session?.user?.id ?? ""} />
    </div>
  )
}

export default DashboardPage
