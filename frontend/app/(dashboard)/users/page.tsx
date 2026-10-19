'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  UserX,
  UserCheck,
  Search,
  Lock,
  KeyRound,
  Stethoscope,
  Beaker,
  Building2,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  StaffAccount,
  StaffRole,
  StaffUser,
  CreateStaffAccountInput,
} from '@/types';
import {
  fetchStaffAccounts,
  createStaffAccount,
  revokeStaffAccess,
  restoreStaffAccess,
  getActiveStaffUser,
  setActiveStaffUser,
  STAFF_PRESETS,
} from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CommandMenu } from '@/components/command-menu';

const REVOCATION_PRESETS = [
  'Staff Member Leaves — Account Disabled & Access Revoked',
  'Completed Clinical Rotation — Privileges Terminated',
  'Departmental Reassignment — Pending New Credentialing',
  'Security Policy Audit — Immediate Session Lockout',
];

const DEPARTMENT_PRESETS: Record<StaffRole, string[]> = {
  PHYSICIAN: [
    'Outpatient Clinic — General Practice',
    'Cardiology & Specialty Wing',
    'OB/GYN & Maternal Care',
    'Internal Medicine & Diagnostics',
  ],
  RECEPTIONIST: [
    'Front Desk & Triage Admissions',
    'Outpatient Intake & Scheduling',
  ],
  LABORATORY_USER: [
    'Diagnostic Laboratory & Pathology',
    'Hematology & STAT Biomarkers',
  ],
  ADMINISTRATOR: [
    'Information Security & Governance',
    'Executive Hospital Operations',
  ],
};

export default function UsersGovernancePage() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<StaffUser>(STAFF_PRESETS[0]);
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'info' | 'warning';
    text: string;
  } | null>(null);

  // Provision Staff Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('PHYSICIAN');
  const [department, setDepartment] = useState(DEPARTMENT_PRESETS.PHYSICIAN[0]);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revoke Access Confirmation Modal State
  const [revokeTarget, setRevokeTarget] = useState<StaffAccount | null>(null);
  const [revokeReason, setRevokeReason] = useState(REVOCATION_PRESETS[0]);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const data = await fetchStaffAccounts();
      setStaffList(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    setCurrentUser(getActiveStaffUser());
    loadStaff();
  }, []);

  const showToast = (type: 'success' | 'info' | 'warning', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSwitchToAdmin = async () => {
    const adminUser =
      STAFF_PRESETS.find((s) => s.role === 'ADMINISTRATOR') || STAFF_PRESETS[4];
    await setActiveStaffUser(adminUser);
    setCurrentUser(adminUser);
    loadStaff();
  };

  const handleRoleChangeInModal = (newRole: StaffRole) => {
    setRole(newRole);
    setDepartment(DEPARTMENT_PRESETS[newRole][0]);
  };

  const handleProvisionStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const payload: CreateStaffAccountInput = {
      firstName,
      lastName,
      email,
      role,
      department,
      licenseNumber,
    };

    const res = await createStaffAccount(payload);
    setIsSubmitting(false);

    if (!res.success || !res.data) {
      setFormError(res.error || 'Unable to provision staff account.');
      return;
    }

    setIsCreateOpen(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setLicenseNumber('');
    await loadStaff();
    showToast(
      'success',
      `Provisioned ${res.data.fullName} (${res.data.role}) with Argon2id credential protection.`,
    );
  };

  const handleConfirmRevoke = async () => {
    if (!revokeTarget) return;
    setIsSubmitting(true);
    const res = await revokeStaffAccess(revokeTarget.id, revokeReason);
    setIsSubmitting(false);

    if (res.success && res.data) {
      const name = revokeTarget.fullName;
      setRevokeTarget(null);
      await loadStaff();
      showToast(
        'warning',
        `Access revoked for ${name}. Account disabled and active Redis sessions purged immediately.`,
      );
    }
  };

  const handleRestoreAccess = async (account: StaffAccount) => {
    const res = await restoreStaffAccess(account.id);
    if (res.success) {
      await loadStaff();
      showToast(
        'success',
        `Restored active hospital access and unlocked workstation sessions for ${account.fullName}.`,
      );
    }
  };

  const activeCount = staffList.filter((u) => u.isActive).length;
  const revokedCount = staffList.filter((u) => !u.isActive).length;
  const physicianCount = staffList.filter(
    (u) => u.role === 'PHYSICIAN' && u.isActive,
  ).length;

  const filteredStaff = staffList.filter((u) => {
    const matchesSearch =
      !searchQuery.trim() ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.licenseNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (roleFilter === 'ALL') return true;
    if (roleFilter === 'REVOKED') return !u.isActive;
    return u.role === roleFilter;
  });

  const getRoleBadge = (r: StaffRole) => {
    switch (r) {
      case 'PHYSICIAN':
        return (
          <Badge
            variant="outline"
            className="gap-1.5 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
          >
            <Stethoscope className="size-3" />
            <span>Physician</span>
          </Badge>
        );
      case 'LABORATORY_USER':
        return (
          <Badge
            variant="outline"
            className="gap-1.5 text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
          >
            <Beaker className="size-3" />
            <span>Laboratory User</span>
          </Badge>
        );
      case 'ADMINISTRATOR':
        return (
          <Badge
            variant="outline"
            className="gap-1.5 text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
          >
            <ShieldCheck className="size-3" />
            <span>Administrator</span>
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="gap-1.5 text-xs font-medium bg-slate-500/10 text-slate-700 dark:text-slate-300 border-border"
          >
            <Building2 className="size-3" />
            <span>Receptionist</span>
          </Badge>
        );
    }
  };

  // RBAC Security Gate for Non-Administrators
  if (mounted && currentUser.role !== 'ADMINISTRATOR') {
    return (
      <div className="@container/main flex flex-1 flex-col items-center justify-center py-16">
        <Card className="max-w-md w-full border-border shadow-sm">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto size-11 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <Lock className="size-5" />
            </div>
            <CardTitle className="text-base font-bold">
              Administrator Access Required
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Staff credential provisioning and immediate user access revocation
              are restricted to the <strong>Hospital Administrator</strong> role
              under CareSync RBAC policy.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pt-2">
            <Button
              size="sm"
              onClick={handleSwitchToAdmin}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <ShieldCheck className="size-3.5" />
              <span>Switch to Administrator Persona</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-xs font-medium shadow-xs transition-all ${
            toastMessage.type === 'warning'
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'warning' ? (
              <ShieldAlert className="size-4 shrink-0" />
            ) : (
              <CheckCircle2 className="size-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Staff Directory & Access Control
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage hospital personnel credentials, assigned roles, and immediate access revocation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStaff}
            className="h-9 gap-1.5 text-sm cursor-pointer border-border"
          >
            <RefreshCw className="size-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setFormError(null);
              setIsCreateOpen(true);
            }}
            className="h-9 gap-1.5 text-sm cursor-pointer"
          >
            <UserPlus className="size-3.5" />
            <span>+ Provision Staff Account</span>
          </Button>
        </div>
      </div>

      {/* 4-Card Governance KPI Strip (Standardized CareSync KPI Grid) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
        {/* 1. Total Personnel */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Total Personnel
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {staffList.length}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <Users className="size-3 text-muted-foreground" />
                <span>Personnel</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Master Staff Registry</span>
              <Building2 className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Across all hospital departments & wings
            </div>
          </CardFooter>
        </Card>

        {/* 2. Active & Authorized */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Active & Authorized
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {activeCount}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <UserCheck className="size-3 text-emerald-600" />
                <span>Authorized</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Active Credentials</span>
              <CheckCircle2 className="size-3.5 text-emerald-600" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Operational staff with live session access
            </div>
          </CardFooter>
        </Card>

        {/* 3. Access Revoked */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Access Revoked
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              <span className={revokedCount > 0 ? 'text-destructive' : ''}>
                {revokedCount}
              </span>
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge
                variant={revokedCount > 0 ? 'destructive' : 'outline'}
                className="flex items-center gap-1.5 rounded-lg text-xs font-medium"
              >
                <Lock className="size-3" />
                <span>Disabled</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Deactivated Accounts</span>
              <UserX className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              {revokedCount === 0
                ? 'All accounts active · Zero locks'
                : 'Workstations locked · Sessions purged'}
            </div>
          </CardFooter>
        </Card>

        {/* 4. Attending Physicians */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Attending Physicians
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {physicianCount}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <Stethoscope className="size-3 text-muted-foreground" />
                <span>Medical Staff</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Prescription Authority</span>
              <Stethoscope className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Licensed clinicians with signing rights
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Staff Directory & Access Revocation Table Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="py-5 px-6 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <span>Personnel Directory</span>
                <Badge variant="outline" className="font-mono text-xs font-medium text-muted-foreground px-2 py-0.5">
                  {filteredStaff.length} accounts
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Hospital staff credentials, role-based permissions, and active session status.
              </CardDescription>
            </div>
          </div>

          {/* Unified Command Toolbar: Search Bar + Role Tabs */}
          <div className="pt-3.5 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter personnel by name, email, department, or credential ID..."
                className="pl-10 pr-16 h-10 text-sm border-border bg-background shadow-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => setIsCommandOpen(true)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 rounded border border-border bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Open Command Palette (⌘K)"
              >
                ⌘K
              </button>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
              <Tabs
                value={roleFilter}
                onValueChange={setRoleFilter}
                className="w-auto shrink-0"
              >
                <TabsList className="h-10 bg-muted p-1 border border-border">
                  <TabsTrigger value="ALL" className="text-sm px-3.5 py-1.5 font-medium cursor-pointer">
                    All ({staffList.length})
                  </TabsTrigger>
                  <TabsTrigger value="PHYSICIAN" className="text-sm px-3.5 py-1.5 font-medium cursor-pointer">
                    Physicians
                  </TabsTrigger>
                  <TabsTrigger value="RECEPTIONIST" className="text-sm px-3.5 py-1.5 font-medium cursor-pointer">
                    Reception
                  </TabsTrigger>
                  <TabsTrigger value="LABORATORY_USER" className="text-sm px-3.5 py-1.5 font-medium cursor-pointer">
                    Lab Techs
                  </TabsTrigger>
                  <TabsTrigger value="REVOKED" className="text-sm px-3.5 py-1.5 font-medium cursor-pointer">
                    Revoked ({revokedCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs font-semibold pl-5">
                  Staff Member
                </TableHead>
                <TableHead className="text-xs font-semibold">
                  RBAC Role
                </TableHead>
                <TableHead className="text-xs font-semibold">
                  Assigned Department / Wing
                </TableHead>
                <TableHead className="text-xs font-semibold">
                  Credential ID
                </TableHead>
                <TableHead className="text-xs font-semibold">
                  Access & Session Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-right pr-5">
                  Governance Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-xs text-muted-foreground"
                  >
                    Loading hospital staff registry...
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-xs text-muted-foreground"
                  >
                    No staff accounts match your current filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staff) => {
                  const isRootAdmin =
                    staff.role === 'ADMINISTRATOR' &&
                    staff.email === 'admin@caresync.org';

                  return (
                    <TableRow
                      key={staff.id}
                      className={
                        !staff.isActive ? 'bg-destructive/[0.03] opacity-85' : ''
                      }
                    >
                      <TableCell className="pl-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 text-xs font-semibold text-muted-foreground bg-muted border border-border shrink-0 shadow-2xs">
                            <AvatarFallback>
                              {(staff.firstName?.[0] || 'S') + (staff.lastName?.[0] || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-foreground">
                              {staff.fullName}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {staff.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{getRoleBadge(staff.role)}</TableCell>

                      <TableCell className="text-xs text-foreground">
                        {staff.department}
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted border border-border text-foreground">
                          {staff.licenseNumber || 'CS-STAFF'}
                        </span>
                      </TableCell>

                      <TableCell>
                        {staff.isActive ? (
                          <div className="flex flex-col gap-0.5">
                            <Badge
                              variant="outline"
                              className="w-fit gap-1.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                            >
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              <span>Active & Authorized</span>
                            </Badge>
                            {staff.lastActiveAt && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                Last active:{' '}
                                {new Date(staff.lastActiveAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <Badge
                              variant="outline"
                              className="w-fit gap-1.5 text-[11px] font-medium bg-destructive/10 text-destructive border-destructive/30"
                            >
                              <Lock className="size-3" />
                              <span>Access Revoked (Disabled)</span>
                            </Badge>
                            {staff.revokedReason && (
                              <span className="text-[10px] text-muted-foreground max-w-xs truncate">
                                {staff.revokedReason}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right pr-5">
                        {isRootAdmin ? (
                          <span className="text-[11px] font-mono text-muted-foreground">
                            Protected Root Admin
                          </span>
                        ) : staff.isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRevokeReason(REVOCATION_PRESETS[0]);
                              setRevokeTarget(staff);
                            }}
                            className="h-7 px-2.5 text-xs gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <UserX className="size-3.5" />
                            <span>Revoke Access</span>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreAccess(staff)}
                            className="h-7 px-2.5 text-xs gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                          >
                            <UserCheck className="size-3.5" />
                            <span>Restore Access</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Provision New Staff Account Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserPlus className="size-4 text-primary" />
              <span>Provision Hospital Staff Account</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign least-privilege RBAC permissions. Passwords are
              automatically hashed with Argon2id (m=64MB, t=3, p=4).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProvisionStaff} className="space-y-4 py-2">
            {formError && (
              <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">First Name</Label>
                <Input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Julian"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Last Name</Label>
                <Input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Bashir"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Hospital Email</Label>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="julian.bashir@caresync.org"
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Medical / Staff License ID</Label>
                <Input
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="MD-CA-94810"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Assigned RBAC Role</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'PHYSICIAN', label: 'Physician (Doctor)' },
                    { id: 'RECEPTIONIST', label: 'Receptionist' },
                    { id: 'LABORATORY_USER', label: 'Laboratory User' },
                    { id: 'ADMINISTRATOR', label: 'Administrator' },
                  ] as { id: StaffRole; label: string }[]
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleRoleChangeInModal(item.id)}
                    className={`px-3 py-2 rounded-md border text-xs font-medium text-left transition-colors cursor-pointer ${
                      role === item.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-foreground hover:bg-muted/60'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Assigned Department / Wing</Label>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {DEPARTMENT_PRESETS[role].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDepartment(preset)}
                    className={`px-2 py-1 rounded border text-[11px] cursor-pointer ${
                      department === preset
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <Input
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="text-xs gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="size-3.5" />
                <span>Authorize & Provision Staff</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Immediate Access Revocation Confirmation Modal */}
      <Dialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-4" />
              <span>Immediate User Access Revocation</span>
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              You are revoking hospital access for{' '}
              <strong>{revokeTarget?.fullName}</strong> (
              <span className="font-mono">{revokeTarget?.email}</span>). This
              action immediately disables the account, locks active workstations,
              and purges Redis session tokens.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Revocation Reason (Audit Trail)</Label>
              <div className="flex flex-col gap-1.5">
                {REVOCATION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRevokeReason(preset)}
                    className={`px-2.5 py-1.5 rounded border text-left text-xs transition-colors cursor-pointer ${
                      revokeReason === preset
                        ? 'border-destructive/50 bg-destructive/10 text-destructive font-medium'
                        : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <Input
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="h-8 text-xs mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRevokeTarget(null)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isSubmitting}
              onClick={handleConfirmRevoke}
              className="text-xs gap-1.5 cursor-pointer"
            >
              <UserX className="size-3.5" />
              <span>Confirm Access Revocation</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CommandMenu open={isCommandOpen} onOpenChange={setIsCommandOpen} />
    </div>
  );
}
