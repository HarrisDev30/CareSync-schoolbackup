'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  UserCheck,
  FileBadge,
} from 'lucide-react';
import { StaffAccount, StaffRole, UpdateStaffAccountInput } from '@/types';
import { updateStaffAccount } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface EditStaffModalProps {
  staff: StaffAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onStaffUpdated: (updated: StaffAccount) => void;
}

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

const ROLES: { id: StaffRole; label: string; desc: string }[] = [
  { id: 'PHYSICIAN', label: 'Physician (Doctor)', desc: 'Clinical consultations, prescriptions, and lab orders' },
  { id: 'RECEPTIONIST', label: 'Receptionist', desc: 'Outpatient admissions desk and appointment scheduling' },
  { id: 'LABORATORY_USER', label: 'Laboratory Tech', desc: 'Specimen accessioning and certified analyzer findings' },
  { id: 'ADMINISTRATOR', label: 'Security Admin', desc: 'Staff directory governance and audit trail monitoring' },
];

export function EditStaffModal({
  staff,
  isOpen,
  onClose,
  onStaffUpdated,
}: EditStaffModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [role, setRole] = useState<StaffRole>('PHYSICIAN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (staff) {
      setFirstName(staff.firstName || '');
      setLastName(staff.lastName || '');
      setDepartment(staff.department || '');
      setLicenseNumber(staff.licenseNumber || '');
      setRole(staff.role);
      setError(null);
    }
  }, [staff, isOpen]);

  if (!staff) return null;

  const isRoleChanged = role !== staff.role;
  const isRootAdmin = staff.role === 'ADMINISTRATOR' && staff.email === 'admin@caresync.org';

  const handleRoleSelect = (newRole: StaffRole) => {
    if (isRootAdmin && newRole !== 'ADMINISTRATOR') {
      setError('Root Security Administrator account role cannot be altered.');
      return;
    }
    setRole(newRole);
    // If current department doesn't match new role's presets, pick the first preset
    if (!DEPARTMENT_PRESETS[newRole].includes(department)) {
      setDepartment(DEPARTMENT_PRESETS[newRole][0]);
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    if (!department.trim()) {
      setError('Department assignment is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const input: UpdateStaffAccountInput = {
        id: staff.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        department: department.trim(),
        licenseNumber: licenseNumber.trim(),
        role,
      };

      const res = await updateStaffAccount(input);
      if (res.success && res.data) {
        onStaffUpdated(res.data);
        onClose();
      } else {
        setError(res.error || 'Failed to update staff account profile.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred updating staff profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-card text-card-foreground border-border shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <UserCheck className="size-5" />
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
              Modify Staff Profile & Credentials
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Update clinical wing assignments, medical license number, or RBAC role permissions for{' '}
            <strong className="text-foreground">{staff.fullName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Identity Readonly Banner */}
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-mono">Hospital Identifier</span>
              <span className="font-mono font-semibold text-foreground">{staff.email}</span>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] bg-background">
              {staff.id}
            </Badge>
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="h-8 text-xs bg-background border-border"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="h-8 text-xs bg-background border-border"
              />
            </div>
          </div>

          {/* Medical License ID */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileBadge className="size-3 text-muted-foreground" />
              <span>Medical / Staff Credential License ID</span>
            </Label>
            <Input
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="e.g. MD-CA-94810 or CLS-44120"
              className="h-8 text-xs font-mono bg-background border-border"
            />
          </div>

          {/* RBAC Role Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Assigned Hospital RBAC Role
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={isRootAdmin && item.id !== 'ADMINISTRATOR'}
                  onClick={() => handleRoleSelect(item.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    role === item.id
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/40'
                      : 'border-border bg-background text-foreground hover:bg-muted/50'
                  } ${isRootAdmin && item.id !== 'ADMINISTRATOR' ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold text-xs">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</div>
                </button>
              ))}
            </div>

            {isRoleChanged && (
              <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 mt-1">
                <AlertTriangle className="size-4 shrink-0" />
                <span>
                  <strong>Security Audit Notice:</strong> Role reassignment from <u>{staff.role}</u> to <u>{role}</u> will take effect across active sessions.
                </span>
              </div>
            )}
          </div>

          {/* Department Assignment */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="size-3 text-muted-foreground" />
              <span>Assigned Department / Clinical Wing</span>
            </Label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {DEPARTMENT_PRESETS[role]?.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDepartment(preset)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    department === preset
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60'
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
              placeholder="e.g. Outpatient Clinic — General Practice"
              className="h-8 text-xs bg-background border-border"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-8 text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Updating Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

