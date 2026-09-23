'use client';

import React from 'react';
import {
  Users,
  Stethoscope,
  TrendingUp,
  Activity,
  Clock,
  DoorOpen,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
      {/* 1. Lobby Waiting */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Lobby Waiting
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {waitingCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
              <Users className="size-3 text-muted-foreground" />
              <span>In Queue</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>~11m avg wait</span>
            <Clock className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            {waitingCount === 0 ? 'Lobby clear · All admitted' : `${waitingCount} patients awaiting call-in`}
          </div>
        </CardFooter>
      </Card>

      {/* 2. Active Consultations */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Active Consultations
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {inConsultCount}
            <span className="text-lg font-normal text-muted-foreground"> / {totalSuites}</span>
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
              <Stethoscope className="size-3 text-muted-foreground" />
              <span>{availableSuites} Free</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>Suites Active</span>
            <DoorOpen className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            {availableSuites === 0
              ? 'All 4 examination suites in session'
              : `${availableSuites} of ${totalSuites} suites ready for dispatch`}
          </div>
        </CardFooter>
      </Card>

      {/* 3. Discharged Today */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Discharged Today
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {completedCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
              <TrendingUp className="size-3 text-muted-foreground" />
              <span>On Track</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>Encounters Closed</span>
            <CheckCircle2 className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            {todayStr} · Encounters archived
          </div>
        </CardFooter>
      </Card>

      {/* 4. Pending Diagnostics */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Pending Diagnostics
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {pendingLabsCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant={statLabsCount > 0 ? 'destructive' : 'outline'}
              className="flex items-center gap-1.5 rounded-lg text-xs font-medium"
            >
              <Activity className="size-3" />
              <span>{statLabsCount > 0 ? `${statLabsCount} STAT Alert` : 'Routine'}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            {statLabsCount > 0 ? (
              <span className="text-destructive flex items-center gap-1.5">
                Priority Orders Pending <AlertCircle className="size-3.5 text-destructive animate-pulse" />
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Standard Pace <Activity className="size-3.5 text-muted-foreground" />
              </span>
            )}
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            {statLabsCount > 0
              ? `${statLabsCount} critical STAT orders requiring triage`
              : 'All outpatient lab specimens in processing'}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
