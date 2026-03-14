"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, LogOut, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Session } from "next-auth"

type SidebarProps = {
  user: Session["user"]
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname()

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?"

  return (
    <aside className="hidden md:flex w-14 flex-col items-center py-4 gap-4 border-r border-[#1F1F1F] bg-[#0A0A0A]">
      {/* Logo */}
      <Link href="/dashboard">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center hover:bg-indigo-400 transition-colors">
          <span className="text-white font-bold text-xs">TF</span>
        </div>
      </Link>

      <div className="w-full px-2">
        <div className="h-px bg-[#1F1F1F]" />
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Tooltip key={href}>
            <TooltipTrigger render={<Link href={href} />}>
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                  pathname === href
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "text-[#71717A] hover:text-white hover:bg-[#1A1A1A]"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        ))}
      </nav>

      {/* Logout */}
      <div className="flex flex-col items-center gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#71717A] hover:text-white hover:bg-[#1A1A1A] transition-colors"
              />
            }
          >
            <LogOut className="w-4 h-4" />
          </TooltipTrigger>
          <TooltipContent side="right">Sign out</TooltipContent>
        </Tooltip>

        {/* Avatar */}
        <Tooltip>
          <TooltipTrigger render={<div className="cursor-pointer" />}>
            <Avatar className="w-8 h-8 ring-2 ring-transparent hover:ring-indigo-500 transition-all">
              <AvatarImage src={user?.image ?? undefined} />
              <AvatarFallback className="bg-[#1F1F1F] text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="right">{user?.name}</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  )
}
