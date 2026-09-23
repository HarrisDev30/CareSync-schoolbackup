'use client';

import React from 'react';
import {
  Users,
  Activity,
  Stethoscope,
  TrendingUp,
  Clock,
  DoorOpen,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface PatientKpiGridProps {
  totalPatients: number;
  activeCount: number;
  inConsultCount: number;
  dischargedCount: number;
}

export function PatientKpiGrid({
  totalPatients,
  activeCount,
  inConsultCount,
  dischargedCount,
}: PatientKpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
      {/* 1. Total Enrolled */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Total Enrolled
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {totalPatients}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
              <Users className="size-3 text-muted-foreground" />
              <span>Master Index</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>Total Registry Size</span>
            <FileText className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            Demographic & verified clinical records
          </div>
        </CardFooter>
      </Card>

      {/* 2. Active in Clinic */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Active in Clinic
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {activeCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
              <Activity className="size-3 text-muted-foreground" />
              <span>In Triage</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>Lobby Queue Active</span>
            <Clock className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            {activeCount === 0 ? 'No patients in waiting' : `${activeCount} patients currently in outpatient triage`}
          </div>
        </CardFooter>
      </Card>

      {/* 3. In Consultation */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            In Consultation
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {inConsultCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
              <Stethoscope className="size-3 text-muted-foreground" />
              <span>Exam Active</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>Suites Occupied</span>
            <DoorOpen className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            {inConsultCount === 0 ? 'All examination suites clear' : `${inConsultCount} patients in physician consult`}
          </div>
        </CardFooter>
      </Card>

      {/* 4. Discharged Today */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Discharged Today
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {dischargedCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
              <TrendingUp className="size-3 text-muted-foreground" />
              <span>Encounters Closed</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>Completed Visits</span>
            <CheckCircle2 className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            Care encounters concluded & archived
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

