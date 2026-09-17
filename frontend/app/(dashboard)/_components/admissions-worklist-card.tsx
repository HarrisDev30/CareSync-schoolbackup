'use client';

import React from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  DoorOpen,
  Stethoscope,
  Activity,
  FileText,
} from 'lucide-react';
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
    color: '#2563eb',
  },
  checkedIn: {
    label: 'Checked In / Active Triage',
    color: '#10b981',
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
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Admissions & Triage</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {filteredQueue.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Real-time patient check-ins, physician routing, and clinic pace.
            </CardDescription>
          </div>

          {/* Progressive Disclosure Header View Switcher */}
          <Tabs
            value={activeView}
            onValueChange={(val) => onViewChange(val as 'QUEUE' | 'FLOW')}
            className="w-auto"
          >
            <TabsList className="h-8 bg-slate-100/90 p-0.5 border border-slate-200/60">
              <TabsTrigger value="QUEUE" className="text-xs px-3 py-1 gap-1.5">
                <span>Worklist</span>
                <span className="font-mono text-[10px] text-slate-500">
                  ({appointments.length})
                </span>
              </TabsTrigger>
              <TabsTrigger value="FLOW" className="text-xs px-3 py-1 gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>Flow Analytics</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* WORKLIST CONTROLS (Search + Filter Tabs) */}
        {activeView === 'QUEUE' && (
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Filter queue by patient name, MRN, clinician, or indication..."
                className="pl-9 pr-14 h-9 text-xs border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={onOpenCommand}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
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
              <TabsList className="h-9 bg-slate-100/90 p-0.5 border border-slate-200/60">
                <TabsTrigger value="ALL" className="text-xs px-2.5 py-1">
                  All <span className="ml-1 text-[10px] font-mono text-slate-500">({appointments.length})</span>
                </TabsTrigger>
                <TabsTrigger value="WAITING" className="text-xs px-2.5 py-1 text-amber-700">
                  Lobby <span className="ml-1 text-[10px] font-mono font-semibold">({waitingCount})</span>
                </TabsTrigger>
                <TabsTrigger value="IN_PROGRESS" className="text-xs px-2.5 py-1 text-purple-700">
                  In Room <span className="ml-1 text-[10px] font-mono">({inConsultCount})</span>
                </TabsTrigger>
                <TabsTrigger value="COMPLETED" className="text-xs px-2.5 py-1 text-emerald-700">
                  Done <span className="ml-1 text-[10px] font-mono">({completedCount})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* FLOW CONTROLS (Today vs 7-Day) */}
        {activeView === 'FLOW' && (
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
            <span className="text-xs text-slate-500">
              Outpatient hourly volume vs admitted consultations
            </span>
            <Tabs
              value={chartView}
              onValueChange={(v) => onChartViewChange(v as any)}
              className="w-auto"
            >
              <TabsList className="h-7 bg-slate-100 p-0.5 border border-slate-200/60">
                <TabsTrigger value="TODAY" className="text-[10px] px-2 py-0.5">
                  Today
                </TabsTrigger>
                <TabsTrigger value="WEEK" className="text-[10px] px-2 py-0.5">
                  7-Day
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {activeView === 'QUEUE' ? (
          /* WORKLIST TABLE */
          loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Loading outpatient queue...
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No appointments matching the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Patient & MRN</TableHead>
                    <TableHead className="min-w-[220px]">Indication / Reason</TableHead>
                    <TableHead className="w-[160px]">Doctor</TableHead>
                    <TableHead className="w-[110px]">Suite</TableHead>
                    <TableHead className="w-[95px]">Time</TableHead>
                    <TableHead className="w-[110px]">Status</TableHead>
                    <TableHead className="text-right w-[160px]">Actions</TableHead>
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
                      <TableRow key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* 1. Patient Identity */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 border border-slate-200/80 text-[11px] font-semibold text-slate-700 bg-slate-100 flex-shrink-0">
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs text-slate-900 leading-tight">
                                {apt.patientName}
                              </div>
                              <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                                {apt.mrn}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* 2. Clinical Indication */}
                        <TableCell>
                          <div className="text-xs text-slate-800 font-medium leading-relaxed line-clamp-1">
                            {apt.reason}
                          </div>
                          {apt.notes && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                              {apt.notes}
                            </div>
                          )}
                        </TableCell>

                        {/* 3. Assigned Clinician */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                            <Stethoscope className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span>{apt.physicianName}</span>
                          </div>
                        </TableCell>

                        {/* 4. Suite / Room */}
                        <TableCell>
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60 whitespace-nowrap">
                            <DoorOpen className="w-3 h-3 text-purple-600 flex-shrink-0" />
                            {apt.roomNumber || 'Exam 3B'}
                          </span>
                        </TableCell>

                        {/* 5. Scheduled Time */}
                        <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {new Date(apt.scheduledAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </TableCell>

                        {/* 6. Status Badge */}
                        <TableCell>
                          {isInProgress && (
                            <Badge variant="purple" className="gap-1 text-[10px] py-0.5 whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                              In Room
                            </Badge>
                          )}
                          {isConfirmed && (
                            <Badge variant="success" className="gap-1 text-[10px] py-0.5 whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3" />
                              In Lobby
                            </Badge>
                          )}
                          {isScheduled && (
                            <Badge variant="outline" className="text-slate-600 text-[10px] py-0.5 whitespace-nowrap">
                              Scheduled
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge variant="secondary" className="text-[10px] py-0.5 whitespace-nowrap">
                              Discharged
                            </Badge>
                          )}
                        </TableCell>

                        {/* 7. Action Buttons */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onOpenChart(apt)}
                              className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer"
                              title="Open Patient Chart"
                            >
                              <FileText className="w-3 h-3 mr-0.5 text-slate-400" />
                              Chart
                            </Button>

                            {/* 1-Click Check In for Scheduled Patients */}
                            {isScheduled && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onStatusChange(apt.id, 'CONFIRMED', apt.patientName)}
                                className="h-7 px-2 text-[11px] text-emerald-700 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 cursor-pointer shadow-2xs font-medium active:scale-[0.98] transition-transform"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                                Check In
                              </Button>
                            )}

                            {/* Instant Call to Room for Confirmed Waiting Patients */}
                            {isConfirmed && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  onStatusChange(
                                    apt.id,
                                    'IN_PROGRESS',
                                    apt.patientName,
                                    apt.roomNumber || 'Exam Suite 3B',
                                  )
                                }
                                className="h-7 px-2 text-[11px] bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-2xs font-medium active:scale-[0.98] transition-transform"
                              >
                                <DoorOpen className="w-3 h-3 mr-1" />
                                Call In
                              </Button>
                            )}

                            {/* Instant Discharge for In-Progress Patients */}
                            {isInProgress && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onStatusChange(apt.id, 'COMPLETED', apt.patientName)}
                                className="h-7 px-2 text-[11px] text-emerald-700 border-emerald-200 hover:bg-emerald-50 cursor-pointer shadow-2xs font-medium active:scale-[0.98] transition-transform"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                                Discharge
                              </Button>
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
          /* FLOW ANALYTICS RECHARTS AREA CHART */
          <div className="p-5">
            <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[260px] w-full">
              <AreaChart
                data={dynamicFlowData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillScheduled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-scheduled)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-scheduled)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fillCheckedIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-checkedIn)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-checkedIn)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-100" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  className="text-[11px] font-mono text-slate-400"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  className="text-[11px] font-mono text-slate-400"
                />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area
                  type="monotone"
                  dataKey="scheduled"
                  stroke="var(--color-scheduled)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#fillScheduled)"
                />
                <Area
                  type="monotone"
                  dataKey="checkedIn"
                  stroke="var(--color-checkedIn)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#fillCheckedIn)"
                />
              </AreaChart>
            </ChartContainer>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-medium text-slate-700">Scheduled Consultations</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-700">Admitted & Checked In</span>
                </span>
              </div>
              <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
                {peakFlowInfo}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
