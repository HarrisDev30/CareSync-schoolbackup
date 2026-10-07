'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Moon,
  Sun,
} from 'lucide-react';
import { STAFF_PRESETS, getActiveStaffUser, setActiveStaffUser } from '@/lib/api';
import { StaffUser } from '@/types';
import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentStaff, setCurrentStaff] = useState<StaffUser>(STAFF_PRESETS[0]);
  const [isLocked, setIsLocked] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStaff(getActiveStaffUser());
    const savedTheme = localStorage.getItem('caresync_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('caresync_theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('caresync_theme', 'dark');
      setIsDark(true);
    }
  };

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleSelect = async (staff: StaffUser) => {
    setCurrentStaff(staff);
    await setActiveStaffUser(staff);
    triggerToast(`Switched active terminal to ${staff.fullName} (${staff.role})`);
    
    // Auto-navigate to primary operational landing page for each role
    if (staff.role === 'ADMINISTRATOR') {
      if (pathname !== '/analytics' && pathname !== '/audit-logs' && pathname !== '/rooms') {
        router.push('/analytics');
      }
    } else if (staff.role === 'PHYSICIAN') {
      if (pathname === '/' || pathname === '/analytics' || pathname === '/audit-logs' || pathname === '/patient-portal') {
        router.push('/patients');
      }
    } else if (staff.role === 'LABORATORY_USER') {
      if (pathname === '/' || pathname === '/analytics' || pathname === '/audit-logs' || pathname === '/appointments' || pathname === '/patient-portal') {
        router.push('/labs');
      }
    } else if (staff.role === 'RECEPTIONIST') {
      if (pathname === '/analytics' || pathname === '/audit-logs' || pathname === '/patient-portal') {
        router.push('/');
      }
    } else if (staff.role === 'PATIENT') {
      router.push('/patient-portal');
    }
  };

  const getRoleHeaderInfo = () => {
    if (currentStaff.role === 'ADMINISTRATOR') {
      return { title: 'CareSync Executive', href: '/analytics' };
    }
    if (currentStaff.role === 'PHYSICIAN') {
      return { title: 'CareSync Clinical', href: '/patients' };
    }
    if (currentStaff.role === 'LABORATORY_USER') {
      return { title: 'CareSync Laboratory', href: '/labs' };
    }
    if (currentStaff.role === 'PATIENT') {
      return { title: 'CareSync Portal', href: '/patient-portal' };
    }
    return { title: 'CareSync Admissions', href: '/' };
  };

  const getPageTitle = () => {
    if (pathname === '/patient-portal') return 'My Patient Health Portal';
    if (pathname === '/') return 'Front Desk Overview';
    if (pathname.startsWith('/patients')) return 'Patient Admissions & Registry';
    if (pathname.startsWith('/appointments')) return 'Consultation Scheduling & Triage';
    if (pathname.startsWith('/labs')) return 'Diagnostic Services & Lab Orders';
    if (pathname.startsWith('/analytics')) return 'Executive Analytics';
    if (pathname.startsWith('/rooms')) return 'Rooms';
    if (pathname.startsWith('/audit-logs')) return 'Compliance Audit Logs';
    const cleaned = pathname.replace(/^\//, '').replace(/-/g, ' ');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  const roleHeader = getRoleHeaderInfo();

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-card text-foreground text-sm px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-border animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="size-4 text-emerald-500" />
          <span>{toast}</span>
        </div>
      )}

      {/* Workstation Lock Modal using shadcn Dialog */}
      <Dialog open={isLocked} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm text-center p-6 [&>button]:hidden">
          <DialogHeader className="items-center text-center sm:text-center space-y-2">
            <div className="size-12 rounded-xl bg-muted text-foreground flex items-center justify-center border border-border shadow-2xs mx-auto">
              <Lock className="size-6 text-foreground" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Workstation Secured
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Terminal secured in compliance with clinical privacy safeguards. Session state preserved.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-muted rounded-lg border border-border text-xs text-left flex items-center gap-3 mt-1">
            <Avatar className="size-9 border border-border bg-card text-xs font-semibold text-foreground">
              <AvatarFallback>
                {currentStaff.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground text-xs truncate">
                {currentStaff.fullName}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {currentStaff.department}
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase font-mono">
              {currentStaff.role}
            </Badge>
          </div>

          <DialogFooter className="mt-4 sm:justify-center">
            <Button
              onClick={() => {
                setIsLocked(false);
                triggerToast('Workstation unlocked. Session resumed.');
              }}
              className="w-full gap-2 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 h-9 cursor-pointer"
            >
              <Unlock className="size-4" />
              <span>Resume Session</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Official shadcn sidebar-08 Inset AppSidebar */}
      <AppSidebar
        currentStaff={currentStaff}
        onRoleSelect={handleRoleSelect}
        onLock={() => setIsLocked(true)}
      />

      {/* Official shadcn sidebar-08 Inset Canvas */}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-border bg-card/80 backdrop-blur-md transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={roleHeader.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {roleHeader.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-semibold text-foreground">
                    {getPageTitle()}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Dark / Light Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="h-8 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer border-border shadow-none"
              title={isDark ? 'Switch to Anti-Glare Light theme' : 'Switch to Dark theme'}
            >
              {isDark ? <Sun className="size-3.5 text-amber-500" /> : <Moon className="size-3.5" />}
              <span className="hidden sm:inline font-medium">{isDark ? 'Light' : 'Dark'}</span>
            </Button>

            {/* Workstation Lock Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLocked(true)}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-8 px-2.5 hover:bg-muted"
            >
              <Lock className="size-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Lock Desk</span>
            </Button>
          </div>
        </header>

        {/* Page Canvas (Matches sidebar-08 content wrapper) */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
