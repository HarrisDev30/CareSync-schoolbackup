'use client';

import React from 'react';
import { Users, Stethoscope, CheckCircle2, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export interface TriageKpiGridProps {
  waitingCount: number;
  inConsultCount: number;
  totalSuites: number;
  completedCount: number;
  pendingLabsCount: number;
  statLabsCount: number;
  todayStr: string;
}

export function TriageKpiGrid({
  waitingCount,
  inConsultCount,
  totalSuites,
  completedCount,
  pendingLabsCount,
  statLabsCount,
  todayStr,
}: TriageKpiGridProps) {
  const availableSuites = Math.max(0, totalSuites - inConsultCount);

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
      {/* 1. Lobby Waiting */}
      <Card className="border-slate-200/80 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Lobby Waiting
          </CardTitle>
          <Users className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {waitingCount}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="font-mono text-amber-700 font-semibold">~11m avg</span>
            <span className="text-slate-300">·</span>
            <span>{waitingCount === 0 ? 'Lobby clear' : `${waitingCount} in waiting area`}</span>
          </p>
        </CardContent>
      </Card>

      {/* 2. Active Consultations */}
      <Card className="border-slate-200/80 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Active Consultations
          </CardTitle>
          <Stethoscope className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {inConsultCount}
            <span className="text-sm font-normal text-slate-400"> / {totalSuites}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="font-medium text-blue-700">
              {availableSuites === 0 ? 'All suites occupied' : `${availableSuites} suite${availableSuites > 1 ? 's' : ''} available`}
            </span>
            <span className="text-slate-300">·</span>
            <span>Physician Suites</span>
          </p>
        </CardContent>
      </Card>

      {/* 3. Discharged Today */}
      <Card className="border-slate-200/80 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Discharged Today
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {completedCount}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="font-medium text-emerald-700">{todayStr}</span>
            <span className="text-slate-300">·</span>
            <span>Completed</span>
          </p>
        </CardContent>
      </Card>

      {/* 4. Pending Diagnostics */}
      <Card className="border-slate-200/80 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Pending Diagnostics
          </CardTitle>
          <Activity className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {pendingLabsCount}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            {statLabsCount > 0 ? (
              <>
                <span className="font-semibold text-rose-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {statLabsCount} STAT
                </span>
                <span className="text-slate-300">·</span>
                <span>Urgent review</span>
              </>
            ) : (
              <>
                <span className="font-medium text-purple-700">Routine</span>
                <span className="text-slate-300">·</span>
                <span>All standard</span>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

