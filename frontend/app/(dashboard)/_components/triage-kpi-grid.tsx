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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 1. Lobby Waiting */}
      <Card className="border-border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Lobby Waiting
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {waitingCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {waitingCount === 0 ? 'Lobby clear' : `~11m avg wait · ${waitingCount} in waiting area`}
          </p>
        </CardContent>
      </Card>

      {/* 2. Active Consultations */}
      <Card className="border-border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Consultations
          </CardTitle>
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {inConsultCount}
            <span className="text-sm font-normal text-muted-foreground"> / {totalSuites}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {availableSuites === 0
              ? 'All examination suites in session'
              : `${availableSuites} of ${totalSuites} examination suites ready`}
          </p>
        </CardContent>
      </Card>

      {/* 3. Discharged Today */}
      <Card className="border-border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Discharged Today
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {completedCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {todayStr} · Completed encounters
          </p>
        </CardContent>
      </Card>

      {/* 4. Pending Diagnostics */}
      <Card className="border-border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending Diagnostics
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {pendingLabsCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {statLabsCount > 0 ? (
              <span className="text-rose-600 font-medium inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                {statLabsCount} STAT priority orders
              </span>
            ) : (
              'All standard routine orders'
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
