import Link from "next/link"

const NotFound = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0A0A0A] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
        <span className="text-indigo-400 font-bold text-2xl">TF</span>
      </div>
      <h1 className="text-white text-4xl font-bold mb-2">404</h1>
      <p className="text-[#71717A] text-sm mb-8">This page doesn't exist.</p>
      <Link
        href="/dashboard"
        className="bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  )
}

export default NotFound
