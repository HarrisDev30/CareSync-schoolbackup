'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  Stethoscope,
  Search,
  Users,
  FileText,
  RotateCcw,
  DoorOpen,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Appointment, Patient, CreateAppointmentInput } from '@/types';
import {
  fetchAppointments,
  fetchPatients,
  createAppointment,
  PHYSICIAN_PRESETS,
} from '@/lib/api';
import { PatientChartModal } from '../patients/_components/patient-chart-modal';
import { CommandMenu } from '@/components/command-menu';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'CONFIRMED' | 'SCHEDULED' | 'COMPLETED'>('ALL');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [selectedChartPatient, setSelectedChartPatient] = useState<Patient | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Form state for booking modal
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPhysicianId, setSelectedPhysicianId] = useState(PHYSICIAN_PRESETS[0]?.id || 'u-1');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState('10:00');
  const [examRoom, setExamRoom] = useState(PHYSICIAN_PRESETS[0]?.defaultRoom || 'Exam Suite 3B');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [aptData, patData] = await Promise.all([
        fetchAppointments(),
        fetchPatients(),
      ]);
      setAppointments(aptData);
      setPatients(patData);
      if (patData.length > 0) {
        setSelectedPatientId(patData[0].id);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const inProgressCount = appointments.filter((a) => a.status === 'IN_PROGRESS').length;
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const scheduledCount = appointments.filter((a) => a.status === 'SCHEDULED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.physicianName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (doctorFilter !== 'ALL') {
      const doc = PHYSICIAN_PRESETS.find((d) => d.id === doctorFilter);
      if (doc && !a.physicianName.toLowerCase().includes(doc.name.toLowerCase().split(' ')[1])) {
        return false;
      }
    }

    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleAppointments = filteredAppointments.slice(startIndex, startIndex + pageSize);

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'ALL' || doctorFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setDoctorFilter('ALL');
    setCurrentPage(1);
  };

  const handleOpenChartForAppointment = (apt: Appointment) => {
    const matched = patients.find((p) => p.id === apt.patientId || p.mrn === apt.mrn);
    if (matched) {
      setSelectedChartPatient(matched);
    } else {
      setSelectedChartPatient({
        id: apt.patientId,
        mrn: apt.mrn,
        fullName: apt.patientName,
        firstName: apt.patientName.split(' ')[0] || 'Patient',
        lastName: apt.patientName.split(' ')[1] || '',
        gender: 'Female',
        dateOfBirth: '1985-06-15',
        age: 39,
        bloodType: 'O+',
        phone: '(555) 349-8201',
        status: 'In Consult',
        primaryPhysician: apt.physicianName,
        allergies: [],
        createdAt: apt.scheduledAt,
      });
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !reason.trim()) return;

    setIsSubmitting(true);
    const scheduledAt = `${appointmentDate}T${appointmentTime}:00Z`;

    const input: CreateAppointmentInput = {
      patientId: selectedPatientId,
      physicianId: selectedPhysicianId,
      scheduledAt,
      durationMinutes: 30,
      reason: reason.trim(),
      notes: notes.trim() || undefined,
    };

    const res = await createAppointment(input);
    if (res.success && res.data) {
      const booked = { ...res.data, roomNumber: examRoom };
      setAppointments([booked, ...appointments]);
      setIsModalOpen(false);
      setReason('');
      setNotes('');
      showToast('success', `Consultation scheduled for ${booked.patientName} in ${examRoom}.`);
    } else {
      showToast('error', res.error || 'Failed to schedule appointment.');
    }
    setIsSubmitting(false);
  };

  const renderStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <Badge variant="purple" className="gap-1 text-[11px] py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
            In Consult
          </Badge>
        );
      case 'CONFIRMED':
        return (
          <Badge variant="warning" className="gap-1 text-[11px] py-0.5">
            <Clock className="w-3 h-3" />
            Waiting
          </Badge>
        );
      case 'SCHEDULED':
        return (
          <Badge variant="outline" className="text-[11px] py-0.5 text-blue-700 bg-blue-50/60 border-blue-200">
            Scheduled
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge variant="secondary" className="text-[11px] py-0.5 text-slate-600">
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Floating Toast Notification (Zero Layout Shift) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
          <div
            className={`p-3.5 rounded-xl border shadow-lg flex items-center justify-between bg-white ${
              toastMessage.type === 'success'
                ? 'border-emerald-200/90 text-slate-900'
                : 'border-red-200/90 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-xs font-medium text-slate-400 hover:text-slate-700 ml-3 cursor-pointer p-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 1. COMMAND HEADER (Exact match to Front Desk Overview & Patients Registry) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Consultation Scheduling & Triage
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Clinical Scheduling
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time outpatient calendar, room assignments, and clinician availability.
          </p>
        </div>

        {/* Global Action Group */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCommandOpen(true)}
            className="gap-2 text-xs text-slate-600 hover:text-slate-900 h-9 px-3 border-slate-200 shadow-2xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search records</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500">
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 text-xs gap-1.5 border-slate-200 shadow-2xs"
          >
            <Link href="/patients">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Patients</span>
            </Link>
          </Button>

          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="gap-1.5 shadow-xs bg-blue-600 hover:bg-blue-700 text-white h-9 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Book Consultation</span>
          </Button>
        </div>
      </div>

      {/* 2. OPERATIONAL METRICS STRIP (Exact match to Front Desk Overview & Patients Registry) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Total Consultations</div>
              <div className="text-xs text-slate-700 font-medium mt-0.5">
                Scheduled Today
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-slate-900">{appointments.length}</span>
            <span className="block text-[10px] font-mono text-blue-700">Daily Bookings</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Waiting in Lobby</div>
              <div className="text-xs text-slate-700 font-medium mt-0.5">
                {confirmedCount === 0 ? 'Lobby clear' : `${confirmedCount} checked in`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-slate-900">{confirmedCount}</span>
            <span className="block text-[10px] font-mono text-amber-700">Awaiting call</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 flex-shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">In Active Consult</div>
              <div className="text-xs text-slate-700 font-medium mt-0.5">
                Exam Suites Occupied
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-slate-900">{inProgressCount}</span>
            <span className="block text-[10px] font-mono text-purple-700">In consultation</span>
          </div>
        </div>
      </div>

      {/* 3. SCHEDULE WORKLIST CARD (Exact match to Front Desk Overview & Patients Registry) */}
      <Card className="shadow-2xs border-slate-200/80">
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Consultation Schedule</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {filteredAppointments.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Daily outpatient appointments, exam room routing, and encounter records.
              </CardDescription>
            </div>

            {/* Linear-Style Segmented Tabs */}
            <Tabs
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val as any);
                setCurrentPage(1);
              }}
              className="w-auto"
            >
              <TabsList className="h-8 bg-slate-100/90 p-0.5 border border-slate-200/60">
                <TabsTrigger value="ALL" className="text-xs px-2.5 py-1">
                  All <span className="ml-1 text-[10px] font-mono text-slate-500">({appointments.length})</span>
                </TabsTrigger>
                <TabsTrigger value="IN_PROGRESS" className="text-xs px-2.5 py-1">
                  In Room <span className="ml-1 text-[10px] font-mono text-purple-700">({inProgressCount})</span>
                </TabsTrigger>
                <TabsTrigger value="CONFIRMED" className="text-xs px-2.5 py-1">
                  Waiting <span className="ml-1 text-[10px] font-mono text-amber-700 font-semibold">({confirmedCount})</span>
                </TabsTrigger>
                <TabsTrigger value="SCHEDULED" className="text-xs px-2.5 py-1">
                  Queued <span className="ml-1 text-[10px] font-mono text-blue-700">({scheduledCount})</span>
                </TabsTrigger>
                <TabsTrigger value="COMPLETED" className="text-xs px-2.5 py-1">
                  Done <span className="ml-1 text-[10px] font-mono text-emerald-700">({completedCount})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Integrated Search & Doctor Filter Bar */}
          <div className="pt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter schedule by patient, MRN, clinician, or indication..."
                className="pl-9 pr-14 h-9 text-xs border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setIsCommandOpen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                title="Open Command Palette (⌘K)"
              >
                ⌘K
              </button>
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={doctorFilter}
                onValueChange={(val) => {
                  setDoctorFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                  <SelectValue placeholder="All Clinicians" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ALL" className="text-xs">All Clinicians</SelectItem>
                    {PHYSICIAN_PRESETS.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id} className="text-xs">
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 text-xs text-slate-500 hover:text-slate-800 gap-1 px-2.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </CardHeader>

        {/* 100% NATIVE SHADCN TABLE (Zero Truncation, Full Data Visibility) */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Patient & MRN</TableHead>
                <TableHead className="min-w-[240px]">Clinical Indication</TableHead>
                <TableHead className="w-[180px]">Assigned Doctor</TableHead>
                <TableHead className="w-[140px]">Suite / Room</TableHead>
                <TableHead className="w-[110px]">Time Slot</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="text-right w-[130px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-xs text-slate-400">
                    Loading clinical schedules...
                  </TableCell>
                </TableRow>
              ) : visibleAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-xs text-slate-400">
                    No consultations found matching the filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                visibleAppointments.map((apt) => {
                  const initials = apt.patientName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2);

                  let formattedTime = '10:00 AM';
                  try {
                    const d = new Date(apt.scheduledAt);
                    if (!isNaN(d.getTime())) {
                      formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                  } catch {
                    // Fallback
                  }

                  return (
                    <TableRow key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Column 1: Patient Identity */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border border-slate-200/80 text-xs font-semibold text-slate-700 bg-slate-100 flex-shrink-0">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-slate-900 leading-tight">
                              {apt.patientName}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                              {apt.mrn}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Column 2: Clinical Indication */}
                      <TableCell>
                        <div className="text-xs text-slate-800 font-medium leading-snug">
                          {apt.reason}
                        </div>
                        {apt.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {apt.notes}
                          </div>
                        )}
                      </TableCell>

                      {/* Column 3: Doctor */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium whitespace-nowrap">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span>{apt.physicianName}</span>
                        </div>
                      </TableCell>

                      {/* Column 4: Suite / Room */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
                          <DoorOpen className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{apt.roomNumber || 'TBD'}</span>
                        </div>
                      </TableCell>

                      {/* Column 5: Time */}
                      <TableCell>
                        <div className="text-xs font-mono text-slate-600 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{formattedTime}</span>
                        </div>
                      </TableCell>

                      {/* Column 6: Status */}
                      <TableCell>{renderStatusBadge(apt.status)}</TableCell>

                      {/* Column 7: Actions */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenChartForAppointment(apt)}
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

          {/* Pagination Footer */}
          <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing{' '}
              <span className="font-medium text-slate-900">
                {filteredAppointments.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, filteredAppointments.length)}
              </span>{' '}
              of <span className="font-medium text-slate-900">{filteredAppointments.length}</span> consultations
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
        </CardContent>
      </Card>

      {/* Book Consultation Modal (Standard Native shadcn Dialog) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
                <CalendarIcon className="size-4 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-slate-900">
                  Schedule Outpatient Consultation
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Select verified patient, assign attending physician, and set exam room.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleBookAppointment} className="space-y-4 text-xs mt-1">
            {/* Section 1: Patient & Care Assignment */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Patient & Clinician Assignment
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Select Patient *
                  </label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger className="w-full text-xs h-8.5">
                      <SelectValue placeholder="Select patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">
                            {p.fullName} ({p.mrn}) — {p.bloodType}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Assigned Clinician *
                    </label>
                    <Select
                      value={selectedPhysicianId}
                      onValueChange={(docId) => {
                        setSelectedPhysicianId(docId);
                        const doc = PHYSICIAN_PRESETS.find((p) => p.id === docId);
                        if (doc) setExamRoom(doc.defaultRoom);
                      }}
                    >
                      <SelectTrigger className="w-full text-xs h-8.5">
                        <SelectValue placeholder="Select clinician..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {PHYSICIAN_PRESETS.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id} className="text-xs">
                              {doc.name} ({doc.specialty})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Exam Suite / Room
                    </label>
                    <Input
                      type="text"
                      value={examRoom}
                      onChange={(e) => setExamRoom(e.target.value)}
                      className="h-8.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Section 2: Date & Time */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Scheduling & Time Slot
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Consultation Date
                  </label>
                  <Input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="h-8.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Time Slot
                  </label>
                  <Input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="h-8.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Section 3: Clinical Reason & Notes */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Clinical Indication & Notes
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Primary Clinical Reason *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Hypertension review, Post-op follow-up, Lab results"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="h-8.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Internal Triage Notes
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="Optional notes for physician or nursing care team..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[64px]"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-8.5 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-8.5 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
              >
                <span>{isSubmitting ? 'Booking...' : 'Confirm Appointment'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Shared Command Palette */}
      <CommandMenu
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        onSelectPatient={(patient) => setSelectedChartPatient(patient)}
      />

      {/* Patient Chart Modal */}
      <PatientChartModal
        patient={selectedChartPatient}
        onClose={() => setSelectedChartPatient(null)}
      />
    </div>
  );
}
