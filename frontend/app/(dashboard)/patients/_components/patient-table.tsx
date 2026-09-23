'use client';

import React, { useState, useEffect } from 'react';
import { Patient } from '../../../../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  FileText,
  CheckCircle2,
  Stethoscope,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PatientTableProps {
  patients: Patient[];
  onViewChart: (patient: Patient) => void;
}

const PAGE_SIZE = 10;

export function PatientTable({ patients, onViewChart }: PatientTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever filtered patients list changes length
  useEffect(() => {
    setCurrentPage(1);
  }, [patients.length]);

  const totalPages = Math.max(1, Math.ceil(patients.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visiblePatients = patients.slice(startIndex, startIndex + PAGE_SIZE);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <Badge variant="outline" className="gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </Badge>
        );
      case 'In Consult':
        return (
          <Badge variant="outline" className="gap-1.5 text-xs font-medium text-foreground bg-muted border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
            In Consult
          </Badge>
        );
      case 'Discharged':
      default:
        return (
          <Badge variant="secondary" className="text-xs font-normal text-muted-foreground">
            Discharged
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
              <TableHead className="min-w-[240px] pl-6 font-medium text-sm text-muted-foreground py-3.5">
                Patient & MRN
              </TableHead>
              <TableHead className="min-w-[140px] font-medium text-sm text-muted-foreground py-3.5">
                Demographics
              </TableHead>
              <TableHead className="w-[120px] font-medium text-sm text-muted-foreground py-3.5">
                Blood Group
              </TableHead>
              <TableHead className="min-w-[200px] font-medium text-sm text-muted-foreground py-3.5">
                Primary Physician
              </TableHead>
              <TableHead className="min-w-[180px] font-medium text-sm text-muted-foreground py-3.5">
                Contact
              </TableHead>
              <TableHead className="w-[160px] pr-6 text-right font-medium text-sm text-muted-foreground py-3.5">
                Status & Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center text-sm text-muted-foreground">
                  No patient records found matching the filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              visiblePatients.map((p) => {
                const initials = p.fullName
                  ? p.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                  : 'PT';

                return (
                  <TableRow
                    key={p.id}
                    onClick={() => onViewChart(p)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors group"
                    title="Click to view full medical chart"
                  >
                    {/* Column 1: Patient Identity & MRN */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <Avatar className="h-10 w-10 border border-border text-xs shrink-0">
                          <AvatarFallback className="text-xs font-semibold text-muted-foreground bg-muted">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-foreground leading-snug truncate">
                            {p.fullName}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground mt-0.5">
                            {p.mrn}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 2: Demographics */}
                    <TableCell className="py-4">
                      <div className="text-sm font-medium text-foreground">
                        {p.gender}, {p.age} yrs
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        DOB: {p.dateOfBirth}
                      </div>
                    </TableCell>

                    {/* Column 3: Blood Group */}
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs font-medium text-foreground border-border bg-muted/40"
                      >
                        {p.bloodType || 'Unknown'}
                      </Badge>
                    </TableCell>

                    {/* Column 4: Primary Physician */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground whitespace-nowrap">
                        <Stethoscope className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{p.primaryPhysician || 'Dr. Sarah Chen, MD'}</span>
                      </div>
                    </TableCell>

                    {/* Column 5: Contact */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-sm font-mono text-foreground">
                        <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span>{p.phone}</span>
                      </div>
                      {p.emergencyContact && (
                        <div
                          className="text-xs text-muted-foreground truncate max-w-[260px] mt-0.5"
                          title={p.emergencyContact}
                        >
                          {p.emergencyContact}
                        </div>
                      )}
                    </TableCell>

                    {/* Column 6: Status & Contextual Button */}
                    <TableCell className="pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <span className="group-hover:hidden">
                          {renderStatusBadge(p.status)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewChart(p);
                          }}
                          className="hidden group-hover:inline-flex h-8 px-3 text-xs font-medium text-foreground shadow-none cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                          View Chart
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer (Matches shadcn dashboard-01) */}
      {patients.length > 0 && (
        <div className="py-3.5 px-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <div className="font-mono text-xs sm:text-sm">
            Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, patients.length)} of{' '}
            {patients.length} patients
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
