import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/shared/login-form"

const LoginPage = async () => {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">TF</span>
          </div>
          <span className="text-white text-xl font-semibold tracking-tight">TaskFlow</span>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-8">
          <h1 className="text-white text-2xl font-semibold mb-1">Welcome back</h1>
          <p className="text-[#71717A] text-sm mb-8">Sign in to your account to continue</p>
          <LoginForm />
        </div>

        <p className="text-center text-[#71717A] text-xs mt-6">
          By signing in, you agree to our{" "}
          <span className="text-indigo-400 hover:underline cursor-pointer">Terms of Service</span>
          {" "}and{" "}
          <span className="text-indigo-400 hover:underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </main>
  )
}

export default LoginPage
