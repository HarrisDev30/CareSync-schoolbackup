'use client';

import React from 'react';
import { Building2, DoorOpen, CheckCircle2 } from 'lucide-react';
import { Appointment } from '@/types';
import { PHYSICIAN_PRESETS } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export interface PhysicianSuitesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
  onDispatchNextToSuite: (docName: string, docRoom: string) => void;
  onOpenChart?: (apt: Appointment) => void;
}

export function PhysicianSuitesDialog({
  open,
  onOpenChange,
  appointments,
  onDispatchNextToSuite,
  onOpenChart,
}: PhysicianSuitesDialogProps) {
  const inSessionCount = appointments.filter((a) => a.status === 'IN_PROGRESS').length;
  const availableCount = Math.max(0, PHYSICIAN_PRESETS.length - inSessionCount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <span>Physician Suites & Examination Rooms</span>
            </DialogTitle>
            <Badge variant="outline" className="font-mono text-xs font-medium text-muted-foreground px-2 py-0.5">
              {availableCount} of {PHYSICIAN_PRESETS.length} Ready
            </Badge>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Monitor real-time suite occupancy, ongoing consultations, and dispatch waiting lobby patients.
          </DialogDescription>
        </DialogHeader>

        <div className="divide-y divide-border mt-3 max-h-[60vh] overflow-y-auto pr-1">
          {PHYSICIAN_PRESETS.map((doc) => {
            const activeConsult = appointments.find(
              (a) =>
                (a.physicianName?.toLowerCase().includes(doc.name.toLowerCase().split(' ')[1]) ||
                  a.physicianId === doc.id) &&
                a.status === 'IN_PROGRESS',
            );

            const isInConsult = Boolean(activeConsult);

            // Find next candidate for this doctor or next general waiting patient
            const docLastName = doc.name.toLowerCase().split(' ')[1] || '';
            const waitingForThisDoc = appointments.find(
              (a) =>
                (a.status === 'CONFIRMED' || a.status === 'SCHEDULED') &&
                a.physicianName?.toLowerCase().includes(docLastName),
            );
            const nextCandidate =
              waitingForThisDoc ||
              appointments.find((a) => a.status === 'CONFIRMED' || a.status === 'SCHEDULED');

            const initials = doc.name
              .replace('Dr. ', '')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2);

            return (
              <div
                key={doc.id}
                className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Doctor Avatar + Identity */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar className="h-10 w-10 border border-border shrink-0">
                    <AvatarFallback className="text-xs font-semibold text-muted-foreground bg-muted">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {doc.name}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        {doc.defaultRoom}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {doc.specialty}
                    </div>
                  </div>
                </div>

                {/* Right Status / Dispatch Button */}
                <div className="shrink-0 flex items-center justify-end">
                  {isInConsult && activeConsult ? (
                    <div
                      onClick={() => {
                        onOpenChange(false);
                        onOpenChart?.(activeConsult);
                      }}
                      className="cursor-pointer text-right p-2 rounded-lg hover:bg-muted transition-colors group/consult"
                      title="Click to view patient chart"
                    >
                      <div className="text-sm font-medium text-foreground flex items-center justify-end gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        <span className="truncate max-w-[160px]">{activeConsult.patientName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        In Session · {activeConsult.mrn}
                      </div>
                    </div>
                  ) : nextCandidate ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onDispatchNextToSuite(doc.name, doc.defaultRoom);
                        onOpenChange(false);
                      }}
                      className="h-9 px-3.5 text-xs text-muted-foreground hover:text-foreground font-medium gap-1.5 cursor-pointer shadow-none"
                    >
                      <DoorOpen className="w-4 h-4 text-muted-foreground" />
                      <span>Call In ({nextCandidate.patientName.split(' ')[0]})</span>
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono px-2 py-1">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                      <span>Ready</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
