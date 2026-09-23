'use client';

import React, { useState, useEffect } from 'react';
import {
  Appointment,
  AppointmentStatus,
  Patient,
} from '@/types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Clock,
  CheckCircle2,
  Stethoscope,
  DoorOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  UserCheck,
  PhoneCall,
} from 'lucide-react';

export interface ConsultationTableProps {
  appointments: Appointment[];
  onOpenChart: (apt: Appointment) => void;
  onStatusChange: (
    aptId: string,
    newStatus: AppointmentStatus,
    patientName: string,
    room?: string,
  ) => void;
}

const PAGE_SIZE = 10;

export function ConsultationTable({
  appointments,
  onOpenChart,
  onStatusChange,
}: ConsultationTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [appointments.length]);

  const totalPages = Math.max(1, Math.ceil(appointments.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleAppointments = appointments.slice(startIndex, startIndex + PAGE_SIZE);

  const formatTimeSlot = (isoString?: string) => {
    if (!isoString) return '09:00 AM';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '09:00 AM';
    }
  };

  const renderStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <Badge
            variant="outline"
            className="gap-1.5 text-xs font-medium text-foreground bg-muted border-border"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            In Consult
          </Badge>
        );
      case 'CONFIRMED':
        return (
          <Badge
            variant="outline"
            className="gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"
          >
            <Clock className="w-3 h-3" />
            Waiting
          </Badge>
        );
      case 'SCHEDULED':
        return (
          <Badge
            variant="outline"
            className="text-xs font-medium text-muted-foreground border-border bg-muted/30"
          >
            Scheduled
          </Badge>
        );
      case 'COMPLETED':
      default:
        return (
          <Badge
            variant="outline"
            className="gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
          >
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        );
    }
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-t border-border">
              <TableHead className="min-w-[260px] pl-6 font-medium text-sm text-muted-foreground py-3.5">
                Time & Patient
              </TableHead>
              <TableHead className="min-w-[260px] font-medium text-sm text-muted-foreground py-3.5">
                Clinical Indication
              </TableHead>
              <TableHead className="min-w-[220px] font-medium text-sm text-muted-foreground py-3.5">
                Clinician & Suite
              </TableHead>
              <TableHead className="w-[140px] font-medium text-sm text-muted-foreground py-3.5">
                Status
              </TableHead>
              <TableHead className="w-[180px] pr-6 text-right font-medium text-sm text-muted-foreground py-3.5">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center text-sm text-muted-foreground">
                  No consultation records found matching current filters.
                </TableCell>
              </TableRow>
            ) : (
              visibleAppointments.map((apt) => {
                const initials = apt.patientName
                  ? apt.patientName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                  : 'PT';

                const timeSlot = formatTimeSlot(apt.scheduledAt);

                return (
                  <TableRow
                    key={apt.id}
                    onClick={() => onOpenChart(apt)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors group"
                    title="Click to view full patient EHR chart"
                  >
                    {/* 1. Time & Patient */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="text-xs font-mono font-medium text-muted-foreground bg-muted/60 px-2 py-1 rounded border border-border shrink-0">
                          {timeSlot}
                        </div>
                        <Avatar className="h-10 w-10 border border-border text-xs shrink-0">
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

                    {/* 2. Clinical Indication (Clean & Uncluttered) */}
                    <TableCell className="py-4">
                      <div className="text-sm text-foreground font-medium line-clamp-1">
                        {apt.reason || 'General Consultation'}
                      </div>
                      {apt.notes && (
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {apt.notes}
                        </div>
                      )}
                    </TableCell>

                    {/* 3. Clinician & Examination Suite */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground whitespace-nowrap">
                        <Stethoscope className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{apt.physicianName || 'Dr. Sarah Chen, MD'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <DoorOpen className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span>{apt.roomNumber || 'Exam Suite 3B'}</span>
                      </div>
                    </TableCell>

                    {/* 4. Status Badge */}
                    <TableCell className="py-4">
                      {renderStatusBadge(apt.status)}
                    </TableCell>

                    {/* 5. Triage Action Button */}
                    <TableCell className="pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {apt.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              onStatusChange(apt.id, 'IN_PROGRESS', apt.patientName, apt.roomNumber || 'Exam Suite 3B')
                            }
                            className="h-8 px-3 text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Call to Room</span>
                          </Button>
                        )}

                        {apt.status === 'SCHEDULED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onStatusChange(apt.id, 'CONFIRMED', apt.patientName)
                            }
                            className="h-8 px-3 text-xs gap-1.5 cursor-pointer hover:bg-muted text-foreground font-medium"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Check In</span>
                          </Button>
                        )}

                        {apt.status === 'IN_PROGRESS' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onStatusChange(apt.id, 'COMPLETED', apt.patientName)
                            }
                            className="h-8 px-3 text-xs gap-1.5 cursor-pointer hover:bg-muted text-foreground font-medium"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Complete</span>
                          </Button>
                        )}

                        {apt.status === 'COMPLETED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChart(apt)}
                            className="h-8 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Chart</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Clean Pagination Footer */}
      {appointments.length > 0 && (
        <div className="py-3.5 px-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <div className="font-mono text-xs sm:text-sm">
            Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, appointments.length)} of{' '}
            {appointments.length} consultations
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-mono mr-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="h-9 w-9 p-0 cursor-pointer disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

