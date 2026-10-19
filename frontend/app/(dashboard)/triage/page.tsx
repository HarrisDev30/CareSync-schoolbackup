'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Users,
  Search,
  CheckCircle2,
  Clock,
  DoorOpen,
  Stethoscope,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  Plus,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Appointment, Patient, HospitalRoom } from '@/types';
import {
  fetchAppointments,
  fetchPatients,
  fetchHospitalRooms,
  updateAppointmentStatus,
} from '@/lib/api';
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TriageIntakeModal } from './_components/triage-intake-modal';
import { PatientChartModal } from '../patients/_components/patient-chart-modal';

export default function TriagePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rooms, setRooms] = useState<HospitalRoom[]>([]);
  const [activeTab, setActiveTab] = useState<'WAITING' | 'IN_ROOM' | 'ALL'>('WAITING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTriageApt, setSelectedTriageApt] = useState<Appointment | null>(null);
  const [selectedChartPatient, setSelectedChartPatient] = useState<Patient | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [aptData, patData, roomData] = await Promise.all([
        fetchAppointments(),
        fetchPatients(),
        fetchHospitalRooms(),
      ]);
      setAppointments(aptData);
      setPatients(patData);
      setRooms(roomData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Metrics
  const lobbyWaitingCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const inRoomCount = appointments.filter((a) => a.status === 'IN_PROGRESS').length;
  const completedTodayCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const availableRoomsCount = rooms.filter((r) => r.status === 'AVAILABLE').length;

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      a.patientName.toLowerCase().includes(q) ||
      a.mrn.toLowerCase().includes(q) ||
      a.physicianName.toLowerCase().includes(q) ||
      a.reason.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTab === 'WAITING') return a.status === 'CONFIRMED';
    if (activeTab === 'IN_ROOM') return a.status === 'IN_PROGRESS';
    return true;
  });

  const handleOpenChart = (apt: Appointment) => {
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

  return (
    <div className="w-full space-y-6 text-foreground">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
          <div
            className={`p-4 rounded-xl border shadow-lg flex items-center justify-between bg-card text-card-foreground ${
              toastMessage.type === 'success' ? 'border-emerald-500/30' : 'border-destructive/30'
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Clinical Triage & Vitals Intake Station
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary bg-primary/10">
              Station A-1
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Nurse workstation for rapid lobby triage intake, baseline vital signs recording, pain assessment (0–10 NRS), and exam room routing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="secondary" className="px-3 py-1.5 text-xs font-medium gap-2">
            <UserCheck className="size-3.5 text-primary" />
            <span>Attending Nurse: <strong>Nurse Chloe Bennett, RN</strong></span>
          </Badge>
        </div>
      </div>

      {/* 2. OPERATIONAL METRICS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Lobby Waiting for Triage
              </span>
              <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                <span>{lobbyWaitingCount}</span>
                {lobbyWaitingCount > 0 && (
                  <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                In Examination Suite
              </span>
              <div className="text-2xl font-bold text-foreground">
                {inRoomCount}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <DoorOpen className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Clean Suites Available
              </span>
              <div className="text-2xl font-bold text-foreground">
                {availableRoomsCount}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Consults Completed Today
              </span>
              <div className="text-2xl font-bold text-foreground">
                {completedTodayCount}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. TRIAGE WORKLIST CARD */}
      <Card className="shadow-xs border-border">
        <CardHeader className="py-5 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <Activity className="size-4 text-primary" />
                <span>Outpatient Triage Queue</span>
                <Badge variant="outline" className="font-mono text-xs font-medium text-muted-foreground px-2 py-0.5">
                  {filteredAppointments.length} Record(s)
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Patients checked in at admissions requiring vital signs capture and examination suite placement.
              </CardDescription>
            </div>
          </div>

          {/* Search + Tab Bar */}
          <div className="pt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter queue by patient, MRN, clinician, or reason..."
                className="pl-10 h-10 text-sm border-border bg-background shadow-none"
              />
            </div>

            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-auto shrink-0">
              <TabsList className="h-10 bg-muted p-1 border border-border">
                <TabsTrigger value="WAITING" className="text-xs px-3.5 py-1.5 font-medium">
                  Awaiting Triage ({lobbyWaitingCount})
                </TabsTrigger>
                <TabsTrigger value="IN_ROOM" className="text-xs px-3.5 py-1.5 font-medium">
                  In Examination Suite ({inRoomCount})
                </TabsTrigger>
                <TabsTrigger value="ALL" className="text-xs px-3.5 py-1.5 font-medium">
                  All Encounters ({appointments.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[240px] text-xs font-semibold uppercase tracking-wider py-3.5">
                    Patient & MRN
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider py-3.5">
                    Scheduled Time
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider py-3.5">
                    Attending Physician
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider py-3.5">
                    Chief Complaint
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider py-3.5">
                    Current Status & Suite
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider py-3.5 pr-6">
                    Triage Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((apt) => {
                    const isWaiting = apt.status === 'CONFIRMED';
                    const isInRoom = apt.status === 'IN_PROGRESS';

                    return (
                      <TableRow key={apt.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="py-3.5 font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8 rounded-lg border border-border bg-muted">
                              <AvatarFallback className="text-xs font-bold text-foreground">
                                {apt.patientName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <span>{apt.patientName}</span>
                              </div>
                              <span className="text-xs font-mono text-muted-foreground">
                                {apt.mrn}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5 font-mono">
                            <Clock className="size-3.5 text-muted-foreground" />
                            <span>
                              {new Date(apt.scheduledAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Stethoscope className="size-3.5 text-muted-foreground" />
                            <span className="font-medium text-foreground">{apt.physicianName}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 text-xs text-muted-foreground max-w-[200px] truncate">
                          {apt.reason}
                        </TableCell>

                        <TableCell className="py-3.5">
                          {isWaiting ? (
                            <Badge
                              variant="outline"
                              className="text-xs font-mono py-0.5 px-2.5 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 gap-1.5 flex items-center w-fit animate-pulse"
                            >
                              <span className="size-1.5 rounded-full bg-amber-500" />
                              <span>Lobby Waiting</span>
                            </Badge>
                          ) : isInRoom ? (
                            <Badge
                              variant="outline"
                              className="text-xs font-mono py-0.5 px-2.5 border-primary/40 bg-primary/10 text-primary gap-1.5 flex items-center w-fit"
                            >
                              <DoorOpen className="size-3.5" />
                              <span>In {apt.roomNumber || 'Exam Room'}</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs font-mono py-0.5 px-2 border-border text-muted-foreground">
                              {apt.status}
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="py-3.5 text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            {isWaiting ? (
                              <Button
                                size="sm"
                                onClick={() => setSelectedTriageApt(apt)}
                                className="h-8 px-3.5 text-xs font-medium cursor-pointer gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                              >
                                <Activity className="size-3.5" />
                                <span>Start Triage Intake</span>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedTriageApt(apt)}
                                className="h-8 px-3 text-xs font-medium cursor-pointer gap-1.5 border-border hover:bg-muted"
                              >
                                <span>Update Vitals</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenChart(apt)}
                              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Open EHR Chart"
                            >
                              <ChevronRight className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground italic">
                      No outpatient records found matching the active queue filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Triage Intake Modal */}
      <TriageIntakeModal
        isOpen={!!selectedTriageApt}
        onClose={() => setSelectedTriageApt(null)}
        appointment={selectedTriageApt}
        onSuccess={() => {
          loadData();
          showToast('success', `Triage completed for ${selectedTriageApt?.patientName}. Vitals recorded and routed to room.`);
        }}
      />

      {/* Patient EHR Chart Modal */}
      <PatientChartModal
        patient={selectedChartPatient}
        onClose={() => setSelectedChartPatient(null)}
      />
    </div>
  );
}

