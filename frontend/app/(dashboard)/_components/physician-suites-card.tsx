'use client';

import React from 'react';
import { Building2, DoorOpen } from 'lucide-react';
import { Appointment } from '@/types';
import { PHYSICIAN_PRESETS } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export interface PhysicianSuitesCardProps {
  className?: string;
  appointments: Appointment[];
  onDispatchNextToSuite: (docName: string, docRoom: string) => void;
  onOpenChart?: (apt: Appointment) => void;
}

export function PhysicianSuitesCard({
  className,
  appointments,
  onDispatchNextToSuite,
  onOpenChart,
}: PhysicianSuitesCardProps) {
  const inSessionCount = appointments.filter((a) => a.status === 'IN_PROGRESS').length;
  const availableCount = Math.max(0, PHYSICIAN_PRESETS.length - inSessionCount);

  return (
    <Card className={className}>
      <CardHeader className="pb-4 pt-5 px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span>Physician Suites</span>
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs font-normal text-muted-foreground">
            {availableCount} of {PHYSICIAN_PRESETS.length} Ready
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          Live suite occupancy and patient dispatch.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        <div className="space-y-4">
          {PHYSICIAN_PRESETS.map((doc) => {
            const activeConsult = appointments.find(
              (a) =>
                (a.physicianName?.toLowerCase().includes(doc.name.toLowerCase().split(' ')[1]) ||
                  a.physicianId === doc.id) &&
                a.status === 'IN_PROGRESS',
            );

            const isInConsult = Boolean(activeConsult);

            // Find next candidate for this doctor or next in queue
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
                className="flex items-center justify-between gap-3 py-1 text-sm group"
              >
                {/* Doctor Avatar + Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 border border-border shrink-0">
                    <AvatarFallback className="text-xs font-medium text-muted-foreground bg-muted">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium text-xs text-foreground truncate">
                      {doc.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {doc.specialty}
                    </div>
                  </div>
                </div>

                {/* Right Status / Dispatch Button */}
                <div className="shrink-0 text-right">
                  {isInConsult && activeConsult ? (
                    <div
                      onClick={() => onOpenChart && onOpenChart(activeConsult)}
                      className="cursor-pointer text-right group/consult"
                      title="Click to view patient chart"
                    >
                      <div className="text-xs font-medium font-mono text-foreground flex items-center justify-end gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>{doc.defaultRoom}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground group-hover/consult:text-foreground transition-colors truncate max-w-[130px]">
                        {activeConsult.patientName}
                      </div>
                    </div>
                  ) : nextCandidate ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDispatchNextToSuite(doc.name, doc.defaultRoom)}
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground font-normal gap-1.5 cursor-pointer shadow-none"
                    >
                      <DoorOpen className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{doc.defaultRoom} · Call In</span>
                    </Button>
                  ) : (
                    <div className="text-xs text-muted-foreground font-mono">
                      {doc.defaultRoom} · Ready
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
