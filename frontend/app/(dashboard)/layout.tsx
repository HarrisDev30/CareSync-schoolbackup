'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Lock,
  Unlock,
  CheckCircle2,
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
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStaff(getActiveStaffUser());
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleSelect = async (staff: StaffUser) => {
    setCurrentStaff(staff);
    await setActiveStaffUser(staff);
    triggerToast(`Switched active terminal to ${staff.fullName} (${staff.role})`);
    if (staff.role === 'PATIENT') {
      router.push('/patient-portal');
    } else if (pathname === '/patient-portal') {
      router.push('/');
    }
  };

  const getPageTitle = () => {
    if (pathname === '/patient-portal') return 'My Patient Health Portal';
    if (pathname === '/') return 'Front Desk Overview';
    if (pathname.startsWith('/patients')) return 'Patient Admissions & Registry';
    if (pathname.startsWith('/appointments')) return 'Consultation Scheduling & Triage';
    if (pathname.startsWith('/labs')) return 'Diagnostic Services & Lab Orders';
    if (pathname.startsWith('/audit-logs')) return 'Compliance Audit Logs';
    return pathname.replace('/', '').replace('-', ' ');
  };

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Workstation Lock Modal using shadcn Dialog */}
      <Dialog open={isLocked} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm text-center p-6 [&>button]:hidden">
          <DialogHeader className="items-center text-center sm:text-center space-y-2">
            <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs mx-auto">
              <Lock className="size-6 text-blue-600" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Workstation Secured
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Terminal secured in compliance with clinical privacy safeguards. Session state preserved.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-left flex items-center gap-3 mt-1">
            <Avatar className="size-9 border border-slate-200 bg-white text-xs font-semibold text-slate-700">
              <AvatarFallback>
                {currentStaff.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-900 text-xs truncate">
                {currentStaff.fullName}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
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
              className="w-full gap-2 shadow-xs bg-blue-600 hover:bg-blue-700 text-white h-9 cursor-pointer"
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
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-sidebar-border bg-white transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-slate-600 hover:text-slate-900" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/" className="text-xs text-slate-500 hover:text-slate-900">
                    CareSync Admissions
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs font-semibold text-slate-900">
                    {getPageTitle()}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Session Security Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-slate-500 bg-slate-50 border border-slate-200/60 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500"></span>
              <span>Encrypted Session</span>
            </div>

            {/* Workstation Lock Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLocked(true)}
              className="gap-1.5 text-xs text-slate-600 hover:text-slate-900 h-8 px-2.5 hover:bg-slate-100"
            >
              <Lock className="size-3.5 text-slate-400" />
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
