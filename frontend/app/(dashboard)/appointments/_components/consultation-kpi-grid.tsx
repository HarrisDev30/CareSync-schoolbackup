'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  Stethoscope,
  CheckCircle2,
  Users,
  Activity,
  DoorOpen,
  TrendingUp,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface ConsultationKpiGridProps {
  totalAppointments: number;
  confirmedCount: number;
  inProgressCount: number;
  completedCount: number;
}

export function ConsultationKpiGrid({
  totalAppointments,
  confirmedCount,
  inProgressCount,
  completedCount,
}: ConsultationKpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
      {/* 1. Daily Bookings */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Daily Bookings
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {totalAppointments}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
              <Calendar className="size-3 text-muted-foreground" />
              <span>Schedule</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>Consultation Agenda</span>
            <Users className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            Total scheduled outpatient visits today
          </div>
        </CardFooter>
      </Card>

      {/* 2. Waiting in Lobby */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Waiting in Lobby
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {confirmedCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
              <Clock className="size-3 text-muted-foreground" />
              <span>Awaiting Call</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>Checked-In Lobby Queue</span>
            <Activity className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            {confirmedCount === 0 ? 'Lobby queue clear' : `${confirmedCount} patients ready for examination`}
          </div>
        </CardFooter>
      </Card>

      {/* 3. In Active Consult */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            In Active Consult
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {inProgressCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
              <Stethoscope className="size-3 text-muted-foreground" />
              <span>Suites Active</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>Examination Rooms</span>
            <DoorOpen className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            {inProgressCount === 0 ? 'All suites currently vacant' : `${inProgressCount} rooms in physician consultation`}
          </div>
        </CardFooter>
      </Card>

      {/* 4. Visits Completed */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Visits Completed
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {completedCount}
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
            <span>Finished Consultations</span>
            <CheckCircle2 className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            Concluded appointments archived
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

