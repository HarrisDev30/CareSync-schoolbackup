'use client';

import React, { useState } from 'react';
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

export function PatientTable({ patients, onViewChart }: PatientTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const totalPages = Math.max(1, Math.ceil(patients.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visiblePatients = patients.slice(startIndex, startIndex + pageSize);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <Badge variant="success" className="gap-1 text-[11px] py-0.5">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </Badge>
        );
      case 'In Consult':
        return (
          <Badge variant="purple" className="gap-1 text-[11px] py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
            In Consult
          </Badge>
        );
      case 'Discharged':
      default:
        return (
          <Badge variant="secondary" className="text-[11px] py-0.5 text-slate-600">
            Discharged
          </Badge>
        );
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[240px]">Patient & MRN</TableHead>
            <TableHead className="w-[150px]">Demographics</TableHead>
            <TableHead className="w-[110px]">Blood Group</TableHead>
            <TableHead className="w-[180px]">Primary Physician</TableHead>
            <TableHead className="w-[160px]">Contact</TableHead>
            <TableHead className="w-[130px]">Status</TableHead>
            <TableHead className="text-right w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-16 text-center text-xs text-slate-400">
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
                <TableRow key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Column 1: Patient Identity & MRN */}
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 border border-slate-200/80 text-xs font-semibold text-slate-700 bg-slate-100 flex-shrink-0">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 leading-tight">
                          {p.fullName}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {p.mrn}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Column 2: Demographics */}
                  <TableCell>
                    <div className="text-xs text-slate-700 font-medium">
                      {p.gender}, {p.age} yrs
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      DOB: {p.dateOfBirth}
                    </div>
                  </TableCell>

                  {/* Column 3: Blood Group */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs font-semibold text-slate-700 bg-slate-50 border-slate-200/80"
                    >
                      {p.bloodType || 'Unknown'}
                    </Badge>
                  </TableCell>

                  {/* Column 4: Primary Physician */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium whitespace-nowrap">
                      <Stethoscope className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>{p.primaryPhysician || 'Dr. Sarah Chen, MD'}</span>
                    </div>
                  </TableCell>

                  {/* Column 5: Contact */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
                      <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span>{p.phone}</span>
                    </div>
                    {p.emergencyContact && (
                      <div
                        className="text-[10px] text-slate-400 truncate max-w-[140px] mt-0.5"
                        title={p.emergencyContact}
                      >
                        {p.emergencyContact}
                      </div>
                    )}
                  </TableCell>

                  {/* Column 6: Status */}
                  <TableCell>{renderStatusBadge(p.status)}</TableCell>

                  {/* Column 7: Actions */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewChart(p)}
                      className="text-xs text-slate-600 hover:text-slate-900 h-8 px-2.5 cursor-pointer font-medium"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      View Chart
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer (Identical to Front Desk Table) */}
      <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-medium text-slate-900">
            {patients.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, patients.length)}
          </span>{' '}
          of <span className="font-medium text-slate-900">{patients.length}</span> patients
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="h-8 text-xs px-2.5 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            Previous
          </Button>
          <span className="text-slate-400 font-mono text-xs px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="h-8 text-xs px-2.5 cursor-pointer"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
