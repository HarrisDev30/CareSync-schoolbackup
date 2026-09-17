'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  Beaker,
  ShieldCheck,
  UserPlus,
  Search,
  Stethoscope,
  Lock,
  ArrowRight,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Patient, Appointment } from '@/types';
import { fetchPatients, fetchAppointments, PHYSICIAN_PRESETS } from '@/lib/api';

interface CommandMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectPatient?: (patient: Patient) => void;
  onRegisterWalkIn?: () => void;
}

export function CommandMenu({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSelectPatient,
  onRegisterWalkIn,
}: CommandMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const router = useRouter();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  React.useEffect(() => {
    if (open) {
      Promise.all([fetchPatients(), fetchAppointments()]).then(([p, a]) => {
        setPatients(p);
        setAppointments(a);
      });
    }
  }, [open]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command, patient name, or MRN..." />
      <CommandList className="max-h-[380px]">
        <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
          No matching clinical records or commands found.
        </CommandEmpty>

        <CommandGroup heading="Quick Clinical Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                if (onRegisterWalkIn) onRegisterWalkIn();
                else router.push('/patients');
              })
            }
          >
            <UserPlus className="mr-2 h-4 w-4 text-blue-600" />
            <span>Register Walk-In Patient</span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">
              Intake
            </span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push('/appointments'))
            }
          >
            <Calendar className="mr-2 h-4 w-4 text-purple-600" />
            <span>Schedule Outpatient Consultation</span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">
              Triage
            </span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/labs'))}
          >
            <Beaker className="mr-2 h-4 w-4 text-amber-600" />
            <span>Create Diagnostic Lab Requisition</span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">
              Orders
            </span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/audit-logs'))}
          >
            <ShieldCheck className="mr-2 h-4 w-4 text-emerald-600" />
            <span>View Compliance Audit Logs</span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">
              Admin
            </span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent Patients">
          {patients.slice(0, 5).map((patient) => (
            <CommandItem
              key={patient.id}
              value={`${patient.fullName} ${patient.mrn} ${patient.bloodType}`}
              onSelect={() =>
                runCommand(() => {
                  if (onSelectPatient) {
                    onSelectPatient(patient);
                  } else {
                    router.push('/patients');
                  }
                })
              }
            >
              <Users className="mr-2 h-4 w-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">
                  {patient.fullName}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {patient.gender} • {patient.age} yrs • Blood: {patient.bloodType}
                </span>
              </div>
              <span className="ml-auto font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                {patient.mrn}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Doctor Examination Suites">
          {PHYSICIAN_PRESETS.map((doc) => (
            <CommandItem
              key={doc.id}
              value={`${doc.name} ${doc.department} ${doc.defaultRoom}`}
              onSelect={() =>
                runCommand(() => router.push('/appointments'))
              }
            >
              <Stethoscope className="mr-2 h-4 w-4 text-blue-500" />
              <span>
                {doc.defaultRoom} — {doc.name}
              </span>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                {doc.specialty}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>

      <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-[11px] text-slate-400 bg-slate-50/60 select-none">
        <div className="flex items-center gap-2">
          <span>Navigate</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-500 shadow-2xs">
            ↑↓
          </kbd>
          <span className="ml-1">Select</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-500 shadow-2xs">
            ↵
          </kbd>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Dismiss</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-500 shadow-2xs">
            esc
          </kbd>
        </div>
      </div>
    </CommandDialog>
  );
}
