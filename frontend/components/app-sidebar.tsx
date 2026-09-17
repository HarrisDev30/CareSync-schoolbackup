"use client"

import * as React from "react"
import Link from "next/link"
import {
  Activity,
  Users,
  Calendar,
  Beaker,
  ShieldCheck,
  Stethoscope,
  Lock,
  LifeBuoy,
  FileSpreadsheet,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { StaffUser } from "@/types"
import { STAFF_PRESETS, PHYSICIAN_PRESETS } from "@/lib/api"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  currentStaff?: StaffUser
  onRoleSelect?: (staff: StaffUser) => void
  onLock?: () => void
}

export function AppSidebar({
  currentStaff = STAFF_PRESETS.find((s) => s.role === 'RECEPTIONIST') || STAFF_PRESETS[0],
  onRoleSelect,
  onLock,
  ...props
}: AppSidebarProps) {
  const isPatient = currentStaff.role === 'PATIENT';
  const isAdmin = currentStaff.role === 'ADMINISTRATOR';

  const staffNav = [
    {
      title: "Patient Admissions",
      url: "/",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "Front Desk Overview",
          url: "/",
        },
        {
          title: "Admissions & Registry",
          url: "/patients",
        },
      ],
    },
    {
      title: "Consultation Scheduling",
      url: "/appointments",
      icon: Calendar,
      isActive: true,
      items: [
        {
          title: "Daily Outpatient Queue",
          url: "/appointments",
        },
      ],
    },
    {
      title: "Diagnostic Services",
      url: "/labs",
      icon: Beaker,
      items: [
        {
          title: "Lab Requisitions & Worklist",
          url: "/labs",
        },
      ],
    },
  ];

  const patientNav = [
    {
      title: "My Health Record",
      url: "/patient-portal",
      icon: Activity,
      isActive: true,
      items: [
        {
          title: "Vitals & Health Overview",
          url: "/patient-portal",
        },
      ],
    },
    {
      title: "My Appointments",
      url: "/patient-portal",
      icon: Calendar,
      isActive: true,
      items: [
        {
          title: "Scheduled Doctor Visits",
          url: "/patient-portal?tab=appointments",
        },
      ],
    },
    {
      title: "Diagnostic Results",
      url: "/patient-portal",
      icon: Beaker,
      items: [
        {
          title: "Verified Lab Tests",
          url: "/patient-portal?tab=labs",
        },
      ],
    },
    {
      title: "Prescriptions & Care",
      url: "/patient-portal",
      icon: FileSpreadsheet,
      items: [
        {
          title: "Active Medications",
          url: "/patient-portal?tab=medications",
        },
      ],
    },
  ];

  const careProjects = isPatient
    ? [
        {
          name: "Dr. Sarah Chen, MD",
          url: "/patient-portal?tab=appointments",
          icon: Stethoscope,
          badge: "Primary Physician",
        },
        {
          name: "Dr. Marcus Vance, MD",
          url: "/patient-portal?tab=appointments",
          icon: Stethoscope,
          badge: "Cardiology",
        },
      ]
    : PHYSICIAN_PRESETS.map((doc) => ({
        name: `${doc.defaultRoom} • ${doc.name.split(',')[0]}`,
        url: "/appointments",
        icon: Stethoscope,
        badge: doc.specialty,
      }));

  const navSecondary = [
    ...(isAdmin
      ? [
          {
            title: "Compliance Audit Logs",
            url: "/audit-logs",
            icon: ShieldCheck,
          },
        ]
      : []),
    {
      title: "Lock Workstation",
      url: "#",
      icon: Lock,
      onClick: onLock,
    },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={isPatient ? "/patient-portal" : "/"}>
                <div className={`flex aspect-square size-8 items-center justify-center rounded-lg text-white font-bold shadow-xs ${
                  isPatient ? "bg-emerald-600" : "bg-blue-600"
                }`}>
                  <Activity className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="truncate font-bold flex items-center gap-1.5 text-slate-900">
                    <span>CareSync</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] py-0 px-1 font-mono ${
                        isPatient
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : "text-blue-700 bg-blue-50 border-blue-200"
                      }`}
                    >
                      {isPatient ? "PATIENT" : "INTAKE"}
                    </Badge>
                  </div>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {isPatient ? "Patient Health Portal" : "Admissions & Clinic OS"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={isPatient ? patientNav : staffNav}
          label={isPatient ? "Patient Health Portal" : "Admissions & Clinical Care"}
        />
        <NavProjects
          projects={careProjects}
          label={isPatient ? "Assigned Care Team" : "Doctor Examination Suites"}
        />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: currentStaff.fullName,
            email: currentStaff.email,
            role: currentStaff.role,
            department: currentStaff.department,
          }}
          onRoleSelect={onRoleSelect}
          onLock={onLock}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
