"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, LogOut, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Session } from "next-auth"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export const BottomNav = ({ user }: { user: Session["user"] }) => {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-[#0A0A0A] border-t border-[#1F1F1F] h-16 px-2">
      {navItems.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-colors",
            pathname === href ? "text-indigo-400" : "text-[#71717A]"
          )}
        >
          <Icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{label}</span>
        </Link>
      ))}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex flex-col items-center gap-1 px-5 py-2 rounded-xl text-[#71717A]"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[10px] font-medium">Sign out</span>
      </button>
    </nav>
  )
}
