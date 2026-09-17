'use client';

import React from 'react';
import { Search, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Appointment, AppointmentStatus } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const CHART_CONFIG = {
  scheduled: {
    label: 'Expected Consultations',
    color: '#0f172a',
  },
  checkedIn: {
    label: 'Admitted & Checked In',
    color: '#64748b',
  },
} satisfies ChartConfig;

export interface AdmissionsWorklistCardProps {
  className?: string;
  appointments: Appointment[];
  filteredQueue: Appointment[];
  loading: boolean;
  activeView: 'QUEUE' | 'FLOW';
  onViewChange: (view: 'QUEUE' | 'FLOW') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterTab: 'ALL' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  onFilterChange: (tab: 'ALL' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED') => void;
  waitingCount: number;
  inConsultCount: number;
  completedCount: number;
  chartView: 'TODAY' | 'WEEK';
  onChartViewChange: (view: 'TODAY' | 'WEEK') => void;
  dynamicFlowData: Array<{ hour: string; scheduled: number; checkedIn: number }>;
  peakFlowInfo: string;
  onOpenChart: (apt: Appointment) => void;
  onStatusChange: (
    aptId: string,
    newStatus: AppointmentStatus,
    patientName: string,
    room?: string,
  ) => void;
  onOpenCommand: () => void;
}

export function AdmissionsWorklistCard({
  className,
  appointments,
  filteredQueue,
  loading,
  activeView,
  onViewChange,
  searchQuery,
  onSearchChange,
  filterTab,
  onFilterChange,
  waitingCount,
  inConsultCount,
  completedCount,
  chartView,
  onChartViewChange,
  dynamicFlowData,
  peakFlowInfo,
  onOpenChart,
  onStatusChange,
  onOpenCommand,
}: AdmissionsWorklistCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-4 pt-5 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <span>Admissions & Triage</span>
              <Badge variant="outline" className="font-mono text-xs font-normal text-muted-foreground">
                {filteredQueue.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Outpatient triage worklist and clinic intake pace.
            </CardDescription>
          </div>

          {/* Progressive Disclosure Header View Switcher */}
          <Tabs
            value={activeView}
            onValueChange={(val) => onViewChange(val as 'QUEUE' | 'FLOW')}
            className="w-auto"
          >
            <TabsList className="h-8 bg-muted p-0.5 border border-border">
              <TabsTrigger value="QUEUE" className="text-xs px-3 py-1 gap-1.5">
                <span>Worklist</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  ({appointments.length})
                </span>
              </TabsTrigger>
              <TabsTrigger value="FLOW" className="text-xs px-3 py-1 gap-1.5">
                <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Flow Analytics</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* WORKLIST CONTROLS: Clean Monochrome Search + Tabs */}
        {activeView === 'QUEUE' && (
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Filter by patient name, MRN, clinician..."
                className="pl-9 pr-14 h-9 text-xs border-border bg-background shadow-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={onOpenCommand}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Open Command Palette (⌘K)"
              >
                ⌘K
              </button>
            </div>

            <Tabs
              value={filterTab}
              onValueChange={(val) => onFilterChange(val as any)}
              className="w-auto shrink-0"
            >
              <TabsList className="h-9 bg-muted p-0.5 border border-border">
                <TabsTrigger value="ALL" className="text-xs px-2.5 py-1">
                  All
                </TabsTrigger>
                <TabsTrigger value="WAITING" className="text-xs px-2.5 py-1">
                  Lobby ({waitingCount})
                </TabsTrigger>
                <TabsTrigger value="IN_PROGRESS" className="text-xs px-2.5 py-1">
                  In Room ({inConsultCount})
                </TabsTrigger>
                <TabsTrigger value="COMPLETED" className="text-xs px-2.5 py-1">
                  Done ({completedCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* FLOW CONTROLS */}
        {activeView === 'FLOW' && (
          <div className="pt-2 flex items-center justify-between border-t border-border mt-2">
            <span className="text-xs text-muted-foreground">
              Outpatient scheduled volume vs admitted consultations
            </span>
            <Tabs
              value={chartView}
              onValueChange={(v) => onChartViewChange(v as any)}
              className="w-auto"
            >
              <TabsList className="h-7 bg-muted p-0.5 border border-border">
                <TabsTrigger value="TODAY" className="text-[11px] px-2.5 py-0.5">
                  Today
                </TabsTrigger>
                <TabsTrigger value="WEEK" className="text-[11px] px-2.5 py-0.5">
                  7-Day
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {activeView === 'QUEUE' ? (
          /* AIRY 5-COLUMN TABLE */
          loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              Loading queue...
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No matching records.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[200px] pl-6 font-medium text-xs text-muted-foreground">
                      Patient
                    </TableHead>
                    <TableHead className="min-w-[180px] font-medium text-xs text-muted-foreground">
                      Indication
                    </TableHead>
                    <TableHead className="w-[160px] font-medium text-xs text-muted-foreground">
                      Clinician
                    </TableHead>
                    <TableHead className="w-[100px] font-medium text-xs text-muted-foreground">
                      Time
                    </TableHead>
                    <TableHead className="w-[140px] pr-6 text-right font-medium text-xs text-muted-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueue.map((apt) => {
                    const isConfirmed = apt.status === 'CONFIRMED';
                    const isInProgress = apt.status === 'IN_PROGRESS';
                    const isScheduled = apt.status === 'SCHEDULED';
                    const isCompleted = apt.status === 'COMPLETED';

                    const initials = apt.patientName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2);

                    return (
                      <TableRow
                        key={apt.id}
                        onClick={() => onOpenChart(apt)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors group"
                        title="Click to view patient chart"
                      >
                        {/* 1. Patient */}
                        <TableCell className="pl-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-border text-xs shrink-0">
                              <AvatarFallback className="text-[10px] font-medium text-muted-foreground bg-muted">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium text-xs text-foreground leading-tight truncate">
                                {apt.patientName}
                              </div>
                              <div className="font-mono text-[11px] text-muted-foreground mt-0.5">
                                {apt.mrn}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* 2. Indication */}
                        <TableCell className="py-3">
                          <div className="text-xs text-foreground truncate max-w-[240px]">
                            {apt.reason}
                          </div>
                        </TableCell>

                        {/* 3. Clinician */}
                        <TableCell className="py-3">
                          <div className="text-xs text-foreground truncate">
                            {apt.physicianName}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {apt.roomNumber || 'Room TBD'}
                          </div>
                        </TableCell>

                        {/* 4. Scheduled Time */}
                        <TableCell className="py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(apt.scheduledAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>

                        {/* 5. Status & Contextual Hover Action */}
                        <TableCell className="pr-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Hover Actions: Swap or complement status on hover */}
                            {isScheduled && (
                              <>
                                <span className="group-hover:hidden">
                                  <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-border">
                                    Scheduled
                                  </Badge>
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStatusChange(apt.id, 'CONFIRMED', apt.patientName);
                                  }}
                                  className="hidden group-hover:inline-flex h-7 px-2 text-xs font-normal text-foreground shadow-none cursor-pointer"
                                >
                                  Check In
                                </Button>
                              </>
                            )}

                            {isConfirmed && (
                              <>
                                <span className="group-hover:hidden">
                                  <Badge variant="secondary" className="text-xs font-normal text-foreground">
                                    In Lobby
                                  </Badge>
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStatusChange(
                                      apt.id,
                                      'IN_PROGRESS',
                                      apt.patientName,
                                      apt.roomNumber || 'Exam 3B',
                                    );
                                  }}
                                  className="hidden group-hover:inline-flex h-7 px-2 text-xs font-normal text-foreground shadow-none cursor-pointer"
                                >
                                  Call In
                                </Button>
                              </>
                            )}

                            {isInProgress && (
                              <>
                                <span className="group-hover:hidden">
                                  <Badge variant="outline" className="text-xs font-medium text-foreground bg-muted/60 border-border">
                                    In Room
                                  </Badge>
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStatusChange(apt.id, 'COMPLETED', apt.patientName);
                                  }}
                                  className="hidden group-hover:inline-flex h-7 px-2 text-xs font-normal text-foreground shadow-none cursor-pointer"
                                >
                                  Discharge
                                </Button>
                              </>
                            )}

                            {isCompleted && (
                              <Badge variant="secondary" className="text-xs font-normal text-muted-foreground">
                                Discharged
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          /* CLEAN MINIMALIST FLOW ANALYTICS */
          <div className="p-6">
            <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[260px] w-full">
              <AreaChart
                data={dynamicFlowData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillScheduled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-scheduled)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-scheduled)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fillCheckedIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-checkedIn)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-checkedIn)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  className="text-[11px] font-mono text-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  className="text-[11px] font-mono text-muted-foreground"
                />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area
                  type="monotone"
                  dataKey="scheduled"
                  stroke="var(--color-scheduled)"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#fillScheduled)"
                />
                <Area
                  type="monotone"
                  dataKey="checkedIn"
                  stroke="var(--color-checkedIn)"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#fillCheckedIn)"
                />
              </AreaChart>
            </ChartContainer>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-900" />
                  <span className="font-medium text-foreground">Scheduled</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="font-medium text-foreground">Admitted</span>
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {peakFlowInfo}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
