import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

const HomePage = async () => {
  const session = await auth()
  redirect(session ? "/dashboard" : "/login")
}

export default HomePage
