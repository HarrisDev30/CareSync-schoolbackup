'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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

export interface AdmissionsWorklistCardProps {
  className?: string;
  appointments: Appointment[];
  filteredQueue: Appointment[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterTab: 'ALL' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  onFilterChange: (tab: 'ALL' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED') => void;
  waitingCount: number;
  inConsultCount: number;
  completedCount: number;
  onOpenChart: (apt: Appointment) => void;
  onStatusChange: (
    aptId: string,
    newStatus: AppointmentStatus,
    patientName: string,
    room?: string,
  ) => void;
  onOpenCommand: () => void;
}

const PAGE_SIZE = 10;

export function AdmissionsWorklistCard({
  className,
  appointments,
  filteredQueue,
  loading,
  searchQuery,
  onSearchChange,
  filterTab,
  onFilterChange,
  waitingCount,
  inConsultCount,
  completedCount,
  onOpenChart,
  onStatusChange,
  onOpenCommand,
}: AdmissionsWorklistCardProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search or tab filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterTab]);

  const totalPages = Math.max(1, Math.ceil(filteredQueue.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedQueue = useMemo(() => {
    return filteredQueue.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredQueue, startIndex]);

  return (
    <Card className={className}>
      <CardHeader className="py-5 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2.5">
              <span>Admissions Worklist</span>
              <Badge variant="outline" className="font-mono text-xs font-medium text-muted-foreground px-2 py-0.5">
                {filteredQueue.length} records
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Live outpatient queue, consultation room tracking, and rapid triage dispatch.
            </CardDescription>
          </div>
        </div>

        {/* WORKLIST CONTROLS: Scaled-up Search + Status Filter Tabs */}
        <div className="pt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter by patient name, MRN, clinician, or room..."
              className="pl-10 pr-16 h-10 text-sm border-border bg-background shadow-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={onOpenCommand}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 rounded border border-border bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
            <TabsList className="h-10 bg-muted p-1 border border-border">
              <TabsTrigger value="ALL" className="text-sm px-3.5 py-1.5 font-medium">
                All
              </TabsTrigger>
              <TabsTrigger value="WAITING" className="text-sm px-3.5 py-1.5 font-medium">
                Lobby ({waitingCount})
              </TabsTrigger>
              <TabsTrigger value="IN_PROGRESS" className="text-sm px-3.5 py-1.5 font-medium">
                In Room ({inConsultCount})
              </TabsTrigger>
              <TabsTrigger value="COMPLETED" className="text-sm px-3.5 py-1.5 font-medium">
                Done ({completedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            Loading admissions worklist...
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            No matching patient records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-t border-border">
                  <TableHead className="w-[240px] pl-6 font-medium text-sm text-muted-foreground py-3.5">
                    Patient
                  </TableHead>
                  <TableHead className="min-w-[220px] font-medium text-sm text-muted-foreground py-3.5">
                    Indication
                  </TableHead>
                  <TableHead className="w-[200px] font-medium text-sm text-muted-foreground py-3.5">
                    Clinician & Suite
                  </TableHead>
                  <TableHead className="w-[130px] font-medium text-sm text-muted-foreground py-3.5">
                    Scheduled
                  </TableHead>
                  <TableHead className="w-[160px] pr-6 text-right font-medium text-sm text-muted-foreground py-3.5">
                    Status & Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedQueue.map((apt) => {
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
                      {/* 1. Patient: Larger Avatar + Clear Typo */}
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <Avatar className="h-10 w-10 border border-border shrink-0">
                            <AvatarFallback className="text-xs font-semibold text-muted-foreground bg-muted">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-foreground leading-snug truncate">
                              {apt.patientName}
                            </div>
                            <div className="font-mono text-xs text-muted-foreground mt-0.5">
                              {apt.mrn}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* 2. Indication */}
                      <TableCell className="py-4">
                        <div className="text-sm text-foreground truncate max-w-[280px]">
                          {apt.reason}
                        </div>
                      </TableCell>

                      {/* 3. Clinician & Suite */}
                      <TableCell className="py-4">
                        <div className="text-sm font-medium text-foreground truncate">
                          {apt.physicianName}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {apt.roomNumber || 'Room TBD'}
                        </div>
                      </TableCell>

                      {/* 4. Scheduled Time */}
                      <TableCell className="py-4 font-mono text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(apt.scheduledAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>

                      {/* 5. Status & Contextual Hover Action */}
                      <TableCell className="pr-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isScheduled && (
                            <>
                              <span className="group-hover:hidden">
                                <Badge variant="outline" className="text-xs font-medium text-muted-foreground border-border px-2.5 py-0.5">
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
                                className="hidden group-hover:inline-flex h-8 px-3 text-xs font-medium text-foreground shadow-none cursor-pointer"
                              >
                                Check In
                              </Button>
                            </>
                          )}

                          {isConfirmed && (
                            <>
                              <span className="group-hover:hidden">
                                <Badge variant="secondary" className="text-xs font-medium text-foreground px-2.5 py-0.5">
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
                                className="hidden group-hover:inline-flex h-8 px-3 text-xs font-medium text-foreground shadow-none cursor-pointer"
                              >
                                Call In
                              </Button>
                            </>
                          )}

                          {isInProgress && (
                            <>
                              <span className="group-hover:hidden">
                                <Badge variant="outline" className="text-xs font-medium text-foreground bg-muted/60 border-border px-2.5 py-0.5">
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
                                className="hidden group-hover:inline-flex h-8 px-3 text-xs font-medium text-foreground shadow-none cursor-pointer"
                              >
                                Discharge
                              </Button>
                            </>
                          )}

                          {isCompleted && (
                            <Badge variant="secondary" className="text-xs font-medium text-muted-foreground px-2.5 py-0.5">
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
        )}
      </CardContent>

      {/* SHADCN DASHBOARD-01 DATA TABLE PAGINATION FOOTER */}
      {filteredQueue.length > 0 && (
        <CardFooter className="py-3.5 px-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <div className="font-mono text-xs sm:text-sm">
            Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filteredQueue.length)} of{' '}
            {filteredQueue.length} patients
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-mono mr-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-9 w-9 p-0 cursor-pointer disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 w-9 p-0 cursor-pointer disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
