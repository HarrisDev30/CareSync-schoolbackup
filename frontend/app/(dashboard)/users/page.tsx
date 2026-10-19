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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Staff Directory & Access Control
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] font-mono uppercase bg-primary/10 text-primary border-primary/20"
            >
              RBAC + Session Governance
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage hospital staff roles, provision Argon2id credentials, and
            enforce immediate access revocation when staff members depart.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStaff}
            className="h-8 gap-1.5 text-xs cursor-pointer"
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
            className="h-8 gap-1.5 text-xs cursor-pointer"
          >
            <UserPlus className="size-3.5" />
            <span>+ Provision Staff Account</span>
          </Button>
        </div>
      </div>

      {/* 4-Card Governance KPI Strip */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>Total Hospital Staff</span>
              <Users className="size-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {staffList.length}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-[11px] text-muted-foreground pt-0">
            Across 4 clinical & administrative RBAC roles
          </CardFooter>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>Authorized Active Staff</span>
              <UserCheck className="size-4 text-emerald-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-[11px] text-muted-foreground pt-0">
            {physicianCount} attending physicians with signing privileges
          </CardFooter>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>Revoked / Disabled Accounts</span>
              <UserX className="size-4 text-destructive" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums text-destructive">
              {revokedCount}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-[11px] text-muted-foreground pt-0">
            Immediate Redis session eviction enforced
          </CardFooter>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>Credential & Session Policy</span>
              <KeyRound className="size-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-base font-bold tracking-tight pt-1">
              Argon2id + 15m Idle Lock
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-[11px] text-muted-foreground pt-0">
            Not everyone can see everything (Least Privilege)
          </CardFooter>
        </Card>
      </div>

      {/* Staff Directory & Access Revocation Table Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">
                Hospital Personnel & Access Registry
              </CardTitle>
              <CardDescription className="text-xs">
                Workflow: Staff Member Leaves → Account Disabled → Access
                Revoked & Sessions Purged
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, license..."
                  className="h-8 pl-8 text-xs"
                />
              </div>

              <Tabs
                value={roleFilter}
                onValueChange={setRoleFilter}
                className="w-full sm:w-auto"
              >
                <TabsList className="h-8 p-0.5 bg-muted/60">
                  <TabsTrigger value="ALL" className="text-xs h-7 px-2.5 cursor-pointer">
                    All ({staffList.length})
                  </TabsTrigger>
                  <TabsTrigger value="PHYSICIAN" className="text-xs h-7 px-2.5 cursor-pointer">
                    Physicians
                  </TabsTrigger>
                  <TabsTrigger value="RECEPTIONIST" className="text-xs h-7 px-2.5 cursor-pointer">
                    Reception
                  </TabsTrigger>
                  <TabsTrigger value="LABORATORY_USER" className="text-xs h-7 px-2.5 cursor-pointer">
                    Lab
                  </TabsTrigger>
                  <TabsTrigger value="REVOKED" className="text-xs h-7 px-2.5 cursor-pointer">
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
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground">
                            {staff.fullName}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {staff.email}
                          </span>
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
