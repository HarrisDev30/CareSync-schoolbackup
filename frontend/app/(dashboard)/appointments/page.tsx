'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Appointment, Patient, CreateAppointmentInput, AppointmentStatus } from '@/types';
import {
  fetchAppointments,
  fetchPatients,
  createAppointment,
  updateAppointmentStatus,
  PHYSICIAN_PRESETS,
} from '@/lib/api';
import { ConsultationKpiGrid } from './_components/consultation-kpi-grid';
import { ConsultationTable } from './_components/consultation-table';
import { BookingModal } from './_components/booking-modal';
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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'IN_PROGRESS' | 'SCHEDULED' | 'COMPLETED'>('ALL');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedChartPatient, setSelectedChartPatient] = useState<Patient | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [, startTransition] = useTransition();

  const loadData = async () => {
    const [aptData, patData] = await Promise.all([
      fetchAppointments(),
      fetchPatients(),
    ]);
    setAppointments(aptData);
    setPatients(patData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStatusChange = async (
    aptId: string,
    newStatus: AppointmentStatus,
    patientName: string,
    room?: string,
  ) => {
    const res = await updateAppointmentStatus(aptId, newStatus, room);
    if (res.success) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === aptId ? { ...a, status: newStatus, roomNumber: room || a.roomNumber } : a)),
      );
      if (newStatus === 'CONFIRMED') {
        showToast('success', `${patientName} checked in. Placed in Outpatient Lobby.`);
      } else if (newStatus === 'IN_PROGRESS') {
        showToast('success', `${patientName} called to ${room || 'Consultation Suite'}.`);
      } else if (newStatus === 'COMPLETED') {
        showToast('success', `Consultation for ${patientName} marked completed.`);
      }
    } else {
      showToast('error', 'Failed to update appointment status.');
    }
  };

  const handleBookAppointment = async (input: CreateAppointmentInput) => {
    const res = await createAppointment(input);
    if (res.success && res.data) {
      const booked = { ...res.data, roomNumber: input.roomNumber };
      setAppointments((prev) => [booked, ...prev]);
      showToast('success', `Consultation scheduled for ${booked.patientName} in ${input.roomNumber}.`);
      startTransition(() => {
        loadData();
      });
      return { success: true };
    } else {
      showToast('error', res.error || 'Failed to schedule appointment.');
      return { success: false, error: res.error };
    }
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

  // Metrics
  const inProgressCount = appointments.filter((a) => a.status === 'IN_PROGRESS').length;
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const scheduledCount = appointments.filter((a) => a.status === 'SCHEDULED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.physicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.roomNumber && a.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));

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

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'ALL' || doctorFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setDoctorFilter('ALL');
  };

  return (
    <div className="w-full space-y-6">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
          <div
            className={`p-4 rounded-xl border shadow-lg flex items-center justify-between bg-card text-card-foreground ${
              toastMessage.type === 'success'
                ? 'border-emerald-500/30'
                : 'border-destructive/30'
            }`}
          >
            <div className="flex items-center gap-3 text-sm font-medium">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground ml-3 cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 1. COMMAND HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Consultation Scheduling & Triage
          </h1>
          <p className="text-sm text-muted-foreground">
            Outpatient consultation roster, examination room routing, and clinician triage queue.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCommandOpen(true)}
            className="gap-2 text-sm text-muted-foreground hover:text-foreground h-10 px-3.5 border-border shadow-none cursor-pointer"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline">Search records</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>

          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="gap-2 h-10 px-4 cursor-pointer active:scale-[0.98] transition-transform bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Book Consultation</span>
          </Button>
        </div>
      </div>

      {/* 2. TIER 1: OPERATIONAL METRICS STRIP (SHADCN DASHBOARD-01 SECTION-CARDS) */}
      <ConsultationKpiGrid
        totalAppointments={appointments.length}
        confirmedCount={confirmedCount}
        inProgressCount={inProgressCount}
        completedCount={completedCount}
      />

      {/* 3. TIER 2: PRIMARY CONSULTATION AGENDA CARD */}
      <Card className="shadow-xs border-border">
        <CardHeader className="py-5 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <span>Consultation Agenda</span>
                <Badge variant="outline" className="font-mono text-xs font-medium text-muted-foreground px-2 py-0.5">
                  {filteredAppointments.length} appointments
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Real-time outpatient calendar, room assignments, and encounter records.
              </CardDescription>
            </div>
          </div>

          {/* Unified Command Toolbar: Search + Status Tabs + Clinician Select */}
          <div className="pt-3.5 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter schedule by patient, MRN, clinician, or room..."
                className="pl-10 pr-16 h-10 text-sm border-border bg-background shadow-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => setIsCommandOpen(true)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 rounded border border-border bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Open Command Palette (⌘K)"
              >
                ⌘K
              </button>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
              <Tabs
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val as any)}
                className="w-auto shrink-0"
              >
                <TabsList className="h-10 bg-muted p-1 border border-border">
                  <TabsTrigger value="ALL" className="text-sm px-3.5 py-1.5 font-medium">
                    All ({appointments.length})
                  </TabsTrigger>
                  <TabsTrigger value="CONFIRMED" className="text-sm px-3.5 py-1.5 font-medium">
                    Waiting ({confirmedCount})
                  </TabsTrigger>
                  <TabsTrigger value="IN_PROGRESS" className="text-sm px-3.5 py-1.5 font-medium">
                    In Room ({inProgressCount})
                  </TabsTrigger>
                  <TabsTrigger value="SCHEDULED" className="text-sm px-3.5 py-1.5 font-medium">
                    Scheduled ({scheduledCount})
                  </TabsTrigger>
                  <TabsTrigger value="COMPLETED" className="text-sm px-3.5 py-1.5 font-medium">
                    Completed ({completedCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="w-full sm:w-48 shrink-0">
                <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                  <SelectTrigger className="h-10 text-sm border-border bg-background shadow-none">
                    <SelectValue placeholder="All Clinicians" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ALL" className="text-sm">All Clinicians</SelectItem>
                      {PHYSICIAN_PRESETS.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id} className="text-sm">
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
                  className="h-10 text-xs text-muted-foreground hover:text-foreground gap-1.5 px-3 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* WORKLIST TABLE: 100% NATIVE SHADCN DATA-TABLE */}
        <CardContent className="p-0">
          <ConsultationTable
            appointments={filteredAppointments}
            onOpenChart={handleOpenChartForAppointment}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>

      {/* Book Consultation Modal (Cal.com Split-Workbench Style) */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patients={patients}
        appointments={appointments}
        onBook={handleBookAppointment}
      />

      {/* Patient EHR Chart Modal */}
      <PatientChartModal
        patient={selectedChartPatient}
        onClose={() => setSelectedChartPatient(null)}
      />

      {/* Command Palette (⌘K) */}
      <CommandMenu
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        onSelectPatient={(p) => setSelectedChartPatient(p)}
        onRegisterWalkIn={() => {}}
      />
    </div>
  );
}
