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
  FileSpreadsheet,
  Building2,
  TrendingUp,
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
import { STAFF_PRESETS } from "@/lib/api"

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
  const isPhysician = currentStaff.role === 'PHYSICIAN';
  const isLabUser = currentStaff.role === 'LABORATORY_USER';

  // Role-Segmented Navigation Items
  const staffNav = React.useMemo(() => {
    // 1. ADMINISTRATOR NAVIGATION (Executive Governance & Facility Suite)
    if (isAdmin) {
      return [
        {
          title: "Hospital Analytics",
          url: "/analytics",
          icon: TrendingUp,
        },
        {
          title: "Facility & Rooms",
          url: "/rooms",
          icon: Building2,
        },
        {
          title: "Staff & Access Control",
          url: "/users",
          icon: Users,
        },
        {
          title: "Audit Logs",
          url: "/audit-logs",
          icon: ShieldCheck,
        },
      ];
    }

    // 2. PHYSICIAN / DOCTOR NAVIGATION
    if (isPhysician) {
      return [
        {
          title: "Clinical Workstation",
          url: "/patients",
          icon: Users,
          isActive: true,
          items: [
            {
              title: "Doctor Patient Chart & EMR",
              url: "/patients",
            },
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
              title: "Lab Requisitions & Review",
              url: "/labs",
            },
          ],
        },
        {
          title: "Room Availability",
          url: "/rooms",
          icon: Building2,
          items: [
            {
              title: "Hospital Rooms & Wings",
              url: "/rooms",
            },
          ],
        },
      ];
    }

    // 3. LABORATORY TECHNICIAN NAVIGATION
    if (isLabUser) {
      return [
        {
          title: "Diagnostic Laboratory",
          url: "/labs",
          icon: Beaker,
          isActive: true,
          items: [
            {
              title: "Lab Requisitions & Worklist",
              url: "/labs",
            },
          ],
        },
        {
          title: "Patient Directory",
          url: "/patients",
          icon: Users,
          items: [
            {
              title: "Patient Directory (Read-Only)",
              url: "/patients",
            },
          ],
        },
        {
          title: "Hospital Capacity",
          url: "/rooms",
          icon: Building2,
          items: [
            {
              title: "Room Availability",
              url: "/rooms",
            },
          ],
        },
      ];
    }

    // 4. RECEPTIONIST NAVIGATION (DEFAULT FRONT DESK)
    return [
      {
        title: "Front Desk & Admissions",
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
        title: "Room Management",
        url: "/rooms",
        icon: Building2,
        items: [
          {
            title: "Hospital Rooms & Capacity",
            url: "/rooms",
          },
        ],
      },
    ];
  }, [isAdmin, isPhysician, isLabUser]);

  const patientNav = [
    {
      title: "My Health Record",
      url: "/patient-portal?tab=overview",
      icon: Activity,
      isActive: true,
    },
    {
      title: "My Appointments",
      url: "/patient-portal?tab=appointments",
      icon: Calendar,
    },
    {
      title: "Diagnostic Results",
      url: "/patient-portal?tab=labs",
      icon: Beaker,
    },
    {
      title: "Prescriptions & Care",
      url: "/patient-portal?tab=medications",
      icon: FileSpreadsheet,
    },
  ];

  const patientCareTeam = [
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
  ];

  const navSecondary = [
    {
      title: "Lock Workstation",
      url: "#",
      icon: Lock,
      onClick: onLock,
    },
  ];

  // Dynamic branding based on active role
  const getBrandInfo = () => {
    if (isPatient) {
      return {
        href: "/patient-portal",
        badge: "PATIENT",
        subtitle: "Patient Health Portal",
      };
    }
    if (isAdmin) {
      return {
        href: "/analytics",
        badge: "ADMIN",
        subtitle: "Executive Governance & Analytics",
      };
    }
    if (isPhysician) {
      return {
        href: "/patients",
        badge: "CLINICAL",
        subtitle: "Doctor Clinical Workstation",
      };
    }
    if (isLabUser) {
      return {
        href: "/labs",
        badge: "LAB",
        subtitle: "Diagnostic Pathology & Testing",
      };
    }
    return {
      href: "/",
      badge: "ADMISSIONS",
      subtitle: "Front Desk & Admissions OS",
    };
  };

  const brand = getBrandInfo();

  const getNavLabel = () => {
    if (isPatient) return "Patient Health Portal";
    if (isAdmin) return "Hospital Administration";
    if (isPhysician) return "Physician Clinical Care";
    if (isLabUser) return "Diagnostic Laboratory Services";
    return "Admissions & Front Desk";
  };

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={brand.href}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
                  <Activity className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="truncate font-bold flex items-center gap-1.5 text-foreground">
                    <span>CareSync</span>
                    <Badge
                      variant="outline"
                      className="text-[9px] py-0 px-1 font-mono text-muted-foreground border-border"
                    >
                      {brand.badge}
                    </Badge>
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {brand.subtitle}
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
          label={getNavLabel()}
        />
        {isPatient && (
          <NavProjects
            projects={patientCareTeam}
            label="Assigned Care Team"
          />
        )}
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
