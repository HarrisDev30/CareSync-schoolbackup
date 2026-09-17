"use client"

import * as React from "react"
import {
  ChevronsUpDown,
  Lock,
  UserCheck,
  ShieldCheck,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { STAFF_PRESETS } from "@/lib/api"
import { StaffUser } from "@/types"

export function NavUser({
  user,
  onRoleSelect,
  onLock,
}: {
  user: {
    name: string
    email: string
    role?: string
    department?: string
  }
  onRoleSelect?: (staff: StaffUser) => void
  onLock?: () => void
}) {
  const { isMobile } = useSidebar()
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-sidebar-border">
                <AvatarFallback className="rounded-lg bg-blue-100 text-blue-700 font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground flex items-center gap-1">
                  <span className="inline-block size-1.5 rounded-full bg-emerald-500"></span>
                  {user.role || "RECEPTIONIST"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg border">
                  <AvatarFallback className="rounded-lg bg-blue-100 text-blue-700 font-semibold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider px-2 py-1">
              Switch Hospital Terminal
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {STAFF_PRESETS.map((staff) => (
                <DropdownMenuItem
                  key={staff.id}
                  onClick={() => onRoleSelect?.(staff)}
                  className={`flex items-center justify-between cursor-pointer ${
                    user.email === staff.email ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs">{staff.fullName}</span>
                    <span className="text-[10px] text-muted-foreground">{staff.department}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono py-0">
                    {staff.role}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onLock?.()}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <Lock className="size-4 mr-2" />
              <span>Lock Workstation (HIPAA)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
