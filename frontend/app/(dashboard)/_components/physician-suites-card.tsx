'use client';

import React from 'react';
import { Building2, DoorOpen, Stethoscope, User, FileText } from 'lucide-react';
import { Appointment } from '@/types';
import { PHYSICIAN_PRESETS } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  // Count active consultations across presets
  const inSessionCount = appointments.filter((a) => a.status === 'IN_PROGRESS').length;
  const availableCount = Math.max(0, PHYSICIAN_PRESETS.length - inSessionCount);

  return (
    <Card className={className}>
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-700" />
            <span>Physician Suites</span>
          </CardTitle>
          <Badge variant="outline" className="font-mono text-[10px]">
            {availableCount === 0
              ? 'All Suites Occupied'
              : `${availableCount} ${availableCount === 1 ? 'Suite' : 'Suites'} Ready`}
          </Badge>
        </div>
        <CardDescription className="text-xs text-slate-500">
          Real-time examination suite status & 1-click lobby dispatch.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 pb-4 pt-0">
        <div className="grid grid-cols-1 gap-3">
          {PHYSICIAN_PRESETS.map((doc) => {
            // Find if this doctor is currently in consultation
            const activeConsult = appointments.find(
              (a) =>
                (a.physicianName?.toLowerCase().includes(doc.name.toLowerCase().split(' ')[1]) ||
                  a.physicianId === doc.id) &&
                a.status === 'IN_PROGRESS',
            );

            const isInConsult = Boolean(activeConsult);

            // Find next waiting patient for this doctor, or first waiting in lobby
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
                className={`p-3 rounded-xl border transition-all ${
                  isInConsult
                    ? 'bg-purple-50/30 border-purple-200/70 shadow-2xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Doctor Identity & Suite Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8 border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700 shrink-0">
                      <AvatarFallback className="text-[10px] font-bold text-slate-600 bg-slate-100">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 leading-tight truncate">
                        {doc.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200/60">
                          {doc.defaultRoom}
                        </span>
                        <span>·</span>
                        <span className="truncate">{doc.specialty}</span>
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={isInConsult ? 'purple' : 'success'}
                    className="text-[10px] font-medium py-0.5 px-2 shrink-0"
                  >
                    {isInConsult ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                        In Session
                      </span>
                    ) : (
                      'Ready'
                    )}
                  </Badge>
                </div>

                {/* Occupant Detail or Dispatch Action */}
                <div className="mt-2.5 pt-2 border-t border-slate-100">
                  {isInConsult && activeConsult ? (
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0 text-slate-600">
                        <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="font-medium text-slate-900 truncate">
                          {activeConsult.patientName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          ({activeConsult.mrn})
                        </span>
                      </div>
                      {onOpenChart && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onOpenChart(activeConsult)}
                          className="h-6 px-1.5 text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          <FileText className="w-3 h-3 mr-1 text-slate-400" />
                          Chart
                        </Button>
                      )}
                    </div>
                  ) : nextCandidate ? (
                    <Button
                      size="sm"
                      onClick={() => onDispatchNextToSuite(doc.name, doc.defaultRoom)}
                      className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer active:scale-[0.98] transition-transform gap-1.5 shadow-2xs"
                    >
                      <DoorOpen className="w-3.5 h-3.5" />
                      <span className="truncate">
                        Dispatch: {nextCandidate.patientName.split(' ')[0]} ({nextCandidate.mrn})
                      </span>
                    </Button>
                  ) : (
                    <div className="text-[11px] text-slate-400 text-center py-1 bg-slate-50/70 rounded-md border border-slate-100 italic">
                      Lobby queue clear · Suite ready
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
