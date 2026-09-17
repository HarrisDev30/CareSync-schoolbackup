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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface PhysicianSuitesCardProps {
  className?: string;
  appointments: Appointment[];
  onDispatchNextToSuite: (docName: string, docRoom: string) => void;
}

export function PhysicianSuitesCard({
  className,
  appointments,
  onDispatchNextToSuite,
}: PhysicianSuitesCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-700" />
            <span>Physician Suites</span>
          </CardTitle>
          <Badge variant="outline" className="font-mono text-[10px]">
            {PHYSICIAN_PRESETS.length} Suites Active
          </Badge>
        </div>
        <CardDescription className="text-xs text-slate-500">
          Examination room occupancy & instant dispatch.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 pb-4 pt-0">
        <div className="grid grid-cols-1 gap-2.5">
          {PHYSICIAN_PRESETS.map((doc) => {
            const activeConsult = appointments.find(
              (a) =>
                (a.physicianName?.toLowerCase().includes(doc.name.toLowerCase().split(' ')[1]) ||
                  a.physicianId === doc.id) &&
                (a.status === 'IN_PROGRESS' || a.status === 'CONFIRMED'),
            );

            const isInConsult = activeConsult?.status === 'IN_PROGRESS';
            const waitingForThisDoc = appointments.find(
              (a) =>
                (a.status === 'CONFIRMED' || a.status === 'SCHEDULED') &&
                a.physicianName?.toLowerCase().includes(doc.name.toLowerCase().split(' ')[1]),
            );
            const nextCandidate = waitingForThisDoc || appointments.find((a) => a.status === 'CONFIRMED');

            return (
              <div
                key={doc.id}
                className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between gap-2 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{doc.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {doc.defaultRoom} · {doc.specialty}
                    </div>
                  </div>
                  <Badge
                    variant={isInConsult ? 'purple' : 'success'}
                    className="text-[10px] font-medium py-0 px-1.5 flex-shrink-0"
                  >
                    {isInConsult ? 'In Session' : 'Ready'}
                  </Badge>
                </div>

                <div className="text-[11px] flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                  <span className="text-slate-400">Occupant:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[140px]">
                    {activeConsult ? activeConsult.patientName : 'Vacant'}
                  </span>
                </div>

                {!isInConsult && nextCandidate && (
                  <Button
                    size="sm"
                    onClick={() => onDispatchNextToSuite(doc.name, doc.defaultRoom)}
                    className="w-full text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer active:scale-[0.98] transition-transform gap-1 mt-0.5"
                  >
                    <DoorOpen className="w-3 h-3" />
                    <span className="truncate">Dispatch: {nextCandidate.patientName.split(' ')[0]}</span>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
