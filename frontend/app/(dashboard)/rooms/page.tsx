'use client';

import React, { useState, useEffect } from 'react';
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
import {
  Search,
  Building2,
  Stethoscope,
  Clock,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  DoorOpen,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCw,
  Settings2,
  Wrench,
  AlertCircle,
  FileText,
  Activity,
  Flame,
  UserCheck,
} from 'lucide-react';
import {
  Patient,
  HospitalRoom,
  CreateRoomInput,
  UpdateRoomInput,
  RoomWing,
  RoomStatus,
  StaffUser,
} from '@/types';
import {
  fetchPatients,
  fetchHospitalRooms,
  createHospitalRoom,
  updateHospitalRoom,
  deleteHospitalRoom,
  getActiveStaffUser,
  STAFF_PRESETS,
} from '@/lib/api';
import { AssignRoomModal } from './_components/assign-room-modal';
import { AddRoomModal } from './_components/add-room-modal';
import { EditRoomModal } from './_components/edit-room-modal';
import { PatientChartModal } from '../patients/_components/patient-chart-modal';
import { CommandMenu } from '@/components/command-menu';

const WINGS: RoomWing[] = [
  'Outpatient Clinic',
  'Cardiology & Specialty',
  'Diagnostic Laboratory',
];

export default function RoomsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffUser>(STAFF_PRESETS[0]);
  const [rooms, setRooms] = useState<HospitalRoom[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeWingFilter, setActiveWingFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetAssignRoom, setTargetAssignRoom] = useState<string | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<HospitalRoom | null>(null);
  const [selectedChartPatient, setSelectedChartPatient] = useState<Patient | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [roomData, patData] = await Promise.all([
        fetchHospitalRooms(),
        fetchPatients(),
      ]);
      setRooms(roomData);
      setPatients(patData);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    setCurrentStaff(getActiveStaffUser());
    loadData();
  }, []);

  const showToast = (type: 'success' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isAdmin = mounted && currentStaff.role === 'ADMINISTRATOR';

  // Modal Handlers
  const handleRoomCreated = async (input: CreateRoomInput) => {
    const res = await createHospitalRoom(input);
    if (res.success && res.data) {
      showToast('success', `Room ${res.data.roomNumber} created and added to ${res.data.wing}.`);
      await loadData();
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to create room.' };
  };

  const handleRoomUpdated = async (input: UpdateRoomInput) => {
    const res = await updateHospitalRoom(input);
    if (res.success && res.data) {
      showToast('success', `Suite ${res.data.roomNumber} configuration updated successfully.`);
      await loadData();
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to update room.' };
  };

  const handleRoomDeleted = async (roomId: string) => {
    const target = rooms.find((r) => r.id === roomId);
    const res = await deleteHospitalRoom(roomId);
    if (res.success) {
      showToast('info', `Room ${target?.roomNumber || roomId} decommissioned from active facility inventory.`);
      await loadData();
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to decommission room.' };
  };

  const handleQuickStatusToggle = async (room: HospitalRoom, newStatus: RoomStatus) => {
    const res = await updateHospitalRoom({
      id: room.id,
      status: newStatus,
      ...(newStatus === 'AVAILABLE'
        ? { assignedPatient: undefined, patientId: undefined, mrn: undefined, reason: undefined, elapsedMinutes: undefined }
        : {}),
    });
    if (res.success) {
      showToast('success', `${room.roomNumber} status set to ${newStatus}.`);
      await loadData();
    }
  };

  const handleAssignPatient = (data: {
    roomNumber: string;
    patientId: string;
    patientName: string;
    patientMrn: string;
    doctorName: string;
    reason: string;
  }) => {
    const {
      roomNumber: targetRoom,
      patientId,
      patientMrn: mrn,
      patientName,
      doctorName: assignedDoctor,
      reason,
    } = data;
    const foundRoom = rooms.find((r) => r.roomNumber === targetRoom);
    if (foundRoom) {
      updateHospitalRoom({
        id: foundRoom.id,
        status: 'IN_USE',
        assignedPatient: patientName,
        patientId,
        mrn,
        reason,
        assignedDoctor,
        elapsedMinutes: 1,
        expectedDurationMinutes: 30,
      }).then(() => {
        loadData();
        showToast('success', `Patient ${patientName} (${mrn}) successfully assigned to ${targetRoom}.`);
      });
    }
  };

  const handleOpenPatientChart = (patientId?: string, mrn?: string) => {
    if (!patientId && !mrn) return;
    const found = patients.find((p) => p.id === patientId || p.mrn === mrn);
    if (found) {
      setSelectedChartPatient(found);
    }
  };

  // Metrics
  const totalSuites = rooms.length;
  const occupiedCount = rooms.filter((r) => r.status === 'IN_USE' || r.status === 'STAT_EMERGENCY').length;
  const availableCount = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const sanitizingCount = rooms.filter((r) => r.status === 'SANITIZING').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'MAINTENANCE').length;
  const availableRoomsList = rooms.filter((r) => r.status === 'AVAILABLE').map((r) => r.roomNumber);

  // Filtered Rooms
  const filteredRooms = rooms.filter((room) => {
    // Search Query
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchNumber = room.roomNumber.toLowerCase().includes(query);
      const matchWing = room.wing.toLowerCase().includes(query);
      const matchDoctor = room.assignedDoctor && room.assignedDoctor.toLowerCase().includes(query);
      const matchPatient = room.assignedPatient && room.assignedPatient.toLowerCase().includes(query);
      const matchMrn = room.mrn && room.mrn.toLowerCase().includes(query);
      const matchType = room.roomType && room.roomType.toLowerCase().includes(query);
      if (!matchNumber && !matchWing && !matchDoctor && !matchPatient && !matchMrn && !matchType) {
        return false;
      }
    }

    // Wing Filter
    if (activeWingFilter !== 'ALL' && room.wing !== activeWingFilter) {
      return false;
    }

    // Status Filter
    if (statusFilter === 'AVAILABLE' && room.status !== 'AVAILABLE') return false;
    if (statusFilter === 'IN_USE' && room.status !== 'IN_USE' && room.status !== 'STAT_EMERGENCY') return false;
    if (statusFilter === 'SANITIZING' && room.status !== 'SANITIZING') return false;
    if (statusFilter === 'MAINTENANCE' && room.status !== 'MAINTENANCE') return false;

    return true;
  });

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-card text-foreground text-sm px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-border animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="size-4 text-emerald-500" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. COMMAND HEADER (Strict DESIGN.md §2 Standard) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isAdmin ? 'Facility & Room Management' : 'Hospital Rooms & Capacity'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? 'Configure hospital suites, manage department wings, toggle maintenance turnover, and register new clinical facilities.'
              : 'Real-time floor census, patient suite allocations, and department wing turnover.'}
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCommandOpen(true)}
            className="gap-2 text-sm text-muted-foreground hover:text-foreground h-10 px-3.5 border-border shadow-none cursor-pointer"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline">Search rooms</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="gap-2 text-sm text-muted-foreground hover:text-foreground h-10 px-3.5 border-border shadow-none cursor-pointer"
            title="Refresh room telemetry from database"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Live</span>
          </Button>

          {isAdmin ? (
            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 h-10 px-4 cursor-pointer active:scale-[0.98] transition-transform bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Room</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setTargetAssignRoom(undefined);
                setIsAssignModalOpen(true);
              }}
              className="gap-2 h-10 px-4 cursor-pointer active:scale-[0.98] transition-transform bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Assign Room</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. TOP 4 KPI METRIC STRIP (Strict dashboard-01 section-cards Standard) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
        {/* KPI 1: Total Hospital Suites */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Total Facility Suites
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {totalSuites}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <Building2 className="size-3 text-muted-foreground" />
                <span>Facility Inventory</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Roster Capacity</span>
              <FileText className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Across 3 active hospital department wings
            </div>
          </CardFooter>
        </Card>

        {/* KPI 2: Operational in Use */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Operational In Use
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {occupiedCount}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <Stethoscope className="size-3 text-muted-foreground" />
                <span>Active Encounters</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Patient Consultations</span>
              <Activity className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Suites with ongoing examinations or testing
            </div>
          </CardFooter>
        </Card>

        {/* KPI 3: Available for Intake */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Available for Intake
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {availableCount}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <DoorOpen className="size-3 text-muted-foreground" />
                <span>Ready for Intake</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Immediate Dispatch</span>
              <CheckCircle2 className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Sanitized and prepared for triage intake
            </div>
          </CardFooter>
        </Card>

        {/* KPI 4: Sanitizing / Maintenance */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Turnover & Maintenance
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {sanitizingCount + maintenanceCount}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <Wrench className="size-3 text-muted-foreground" />
                <span>Turnaround</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Turnover & Service</span>
              <Sparkles className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              {sanitizingCount} sanitizing · {maintenanceCount} in maintenance
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* 3. PRIMARY ROOM MANAGEMENT & WING CENSUS WORKLIST CARD */}
      <Card className="border-border shadow-xs">
        <CardHeader className="py-5 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <span>Facility Suites & Wing Directory</span>
                <Badge variant="outline" className="font-mono text-xs font-medium text-muted-foreground px-2 py-0.5">
                  {filteredRooms.length} suites
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Real-time room availability, equipment amenities, and clinical occupant management.
              </CardDescription>
            </div>
          </div>

          {/* Unified Command Toolbar & Wing Filter Tabs */}
          <div className="pt-3.5 space-y-3">
            {/* Top Toolbar: Search + Status Filter Tabs */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by room name, wing, doctor, patient, or equipment..."
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

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
                <Tabs
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  className="w-auto shrink-0"
                >
                  <TabsList className="h-10 bg-muted p-1 border border-border">
                    <TabsTrigger value="ALL" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                      All Status ({rooms.length})
                    </TabsTrigger>
                    <TabsTrigger value="AVAILABLE" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                      Available ({availableCount})
                    </TabsTrigger>
                    <TabsTrigger value="IN_USE" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                      In Use ({occupiedCount})
                    </TabsTrigger>
                    <TabsTrigger value="SANITIZING" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                      Sanitizing ({sanitizingCount})
                    </TabsTrigger>
                    <TabsTrigger value="MAINTENANCE" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                      Maint. ({maintenanceCount})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Department Wing Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveWingFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  activeWingFilter === 'ALL'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                }`}
              >
                All Departments ({rooms.length})
              </button>

              {WINGS.map((wing) => {
                const wingRooms = rooms.filter((r) => r.wing === wing);
                const wingAvail = wingRooms.filter((r) => r.status === 'AVAILABLE').length;
                const isSelected = activeWingFilter === wing;
                return (
                  <button
                    key={wing}
                    type="button"
                    onClick={() => setActiveWingFilter(wing)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span>{wing}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-foreground'
                      }`}
                    >
                      {wingAvail} free
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        {/* High-Density Room Grid */}
        <CardContent className="px-6 pb-6 pt-0">
          {filteredRooms.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-xl space-y-2 text-muted-foreground">
              <Building2 className="size-8 mx-auto stroke-[1.5]" />
              <p className="text-sm font-medium text-foreground">No rooms match your filter criteria.</p>
              <p className="text-xs">Adjust your search terms or department wing selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => {
                const isInUse = room.status === 'IN_USE';
                const isAvailable = room.status === 'AVAILABLE';
                const isSanitizing = room.status === 'SANITIZING';
                const isMaintenance = room.status === 'MAINTENANCE';
                const isStat = room.status === 'STAT_EMERGENCY';

                return (
                  <div
                    key={room.id}
                    className={`rounded-xl border p-4.5 transition-all flex flex-col justify-between bg-card text-card-foreground shadow-2xs hover:shadow-xs min-w-0 overflow-hidden w-full ${
                      isStat
                        ? 'border-red-500/40 bg-red-500/5 ring-1 ring-red-500/30'
                        : isInUse
                        ? 'border-blue-500/30'
                        : isSanitizing
                        ? 'border-amber-500/30'
                        : isMaintenance
                        ? 'border-border bg-muted/30 opacity-80'
                        : 'border-border hover:border-foreground/30'
                    }`}
                  >
                    {/* Top Header */}
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-start justify-between gap-2.5 min-w-0">
                        <div className="min-w-0 flex-1">
                          <span
                            className="font-bold text-base text-foreground tracking-tight block truncate"
                            title={room.roomNumber}
                          >
                            {room.roomNumber}
                          </span>
                          <span
                            className="text-xs text-muted-foreground block truncate mt-0.5"
                            title={`${room.wing} · ${room.floor || 'Floor 1'}`}
                          >
                            {room.wing} · {room.floor || 'Floor 1'}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 pt-0.5">
                          {isStat ? (
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-1 shrink-0"
                            >
                              <span className="size-1.5 rounded-full bg-red-500 animate-ping" />
                              <span>STAT Urgent</span>
                            </Badge>
                          ) : isInUse ? (
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] uppercase px-2 py-0.5 border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0"
                            >
                              In Use
                            </Badge>
                          ) : isSanitizing ? (
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] uppercase px-2 py-0.5 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0"
                            >
                              Sanitizing
                            </Badge>
                          ) : isMaintenance ? (
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] uppercase px-2 py-0.5 border-border bg-muted text-muted-foreground shrink-0"
                            >
                              Maintenance
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] uppercase px-2 py-0.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0"
                            >
                              Available
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Room Spec Strip */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 overflow-hidden pt-0.5">
                        <span
                          className="font-medium text-foreground truncate shrink-0 max-w-[50%]"
                          title={room.roomType || 'Exam Suite'}
                        >
                          {room.roomType || 'Exam Suite'}
                        </span>
                        <span className="text-muted-foreground/50 shrink-0">·</span>
                        <span
                          className="truncate flex-1 min-w-0 text-muted-foreground"
                          title={room.bedType || 'Standard Bed'}
                        >
                          {room.bedType || 'Standard Bed'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Body: Occupant / Maintenance Details */}
                    <div className="my-3 space-y-2 py-2 border-y border-border/50 text-xs min-w-0">
                      {isInUse || isStat ? (
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <span
                              className="font-semibold text-foreground text-xs truncate min-w-0 flex-1"
                              title={room.assignedPatient || 'Active Patient'}
                            >
                              {room.assignedPatient || 'Active Patient'}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                              {room.mrn || 'MRN-Pending'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs min-w-0">
                            <Stethoscope className="size-3 text-muted-foreground shrink-0" />
                            <span
                              className="truncate font-medium text-foreground min-w-0 flex-1"
                              title={room.assignedDoctor || 'Assigned MD'}
                            >
                              {room.assignedDoctor || 'Assigned MD'}
                            </span>
                          </div>

                          {room.reason && (
                            <p
                              className="text-muted-foreground text-xs truncate min-w-0 block"
                              title={room.reason}
                            >
                              &ldquo;{room.reason}&rdquo;
                            </p>
                          )}

                          <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground pt-1 min-w-0">
                            <span className="truncate">{room.elapsedMinutes || 12}m in session</span>
                            <span className="shrink-0">Slot: {room.expectedDurationMinutes || 30}m</span>
                          </div>
                        </div>
                      ) : isSanitizing ? (
                        <div className="py-2 text-center space-y-0.5 text-amber-700 dark:text-amber-400 min-w-0">
                          <span className="font-medium flex items-center justify-center gap-1.5">
                            <Sparkles className="size-3.5 shrink-0" />
                            <span className="truncate">Sanitization Turnover</span>
                          </span>
                          <p className="text-[11px] text-muted-foreground font-mono truncate">
                            Turnaround ready in ~{room.elapsedMinutes || 5} min
                          </p>
                        </div>
                      ) : isMaintenance ? (
                        <div className="py-2 text-center space-y-0.5 text-muted-foreground min-w-0">
                          <span className="font-medium flex items-center justify-center gap-1.5 text-foreground">
                            <Wrench className="size-3.5 shrink-0" />
                            <span className="truncate">Out of Service (Maintenance)</span>
                          </span>
                          <p className="text-[11px] text-muted-foreground truncate">
                            Engineering maintenance inspection
                          </p>
                        </div>
                      ) : (
                        <div className="py-2.5 text-center space-y-0.5 text-muted-foreground min-w-0">
                          <span className="font-medium text-foreground block truncate">Suite Ready</span>
                          <p className="text-[11px] truncate">Clean and ready for patient intake</p>
                        </div>
                      )}

                      {/* Equipment Chips Preview */}
                      {room.equipment && room.equipment.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1.5 min-w-0 overflow-hidden">
                          {room.equipment.slice(0, 3).map((eq) => (
                            <span
                              key={eq}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground truncate max-w-[140px] inline-block"
                              title={eq}
                            >
                              {eq}
                            </span>
                          ))}
                          {room.equipment.length > 3 && (
                            <span
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0"
                              title={`${room.equipment.length - 3} more equipment tags`}
                            >
                              +{room.equipment.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 flex items-center justify-between gap-2 min-w-0">
                      {isAdmin ? (
                        // Administrator Action Toolbar
                        <div className="w-full flex items-center justify-between gap-2 min-w-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRoomForEdit(room)}
                            className="h-8 px-2.5 text-xs gap-1 border-border text-foreground hover:bg-muted cursor-pointer shrink-0"
                          >
                            <Settings2 className="size-3.5 text-muted-foreground" />
                            <span>Manage</span>
                          </Button>

                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                            {isAvailable && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickStatusToggle(room, 'SANITIZING')}
                                className="h-8 px-2 text-xs text-muted-foreground hover:text-amber-600 cursor-pointer"
                                title="Set room to Sanitizing"
                              >
                                <Sparkles className="size-3 mr-1" />
                                <span>Sanitize</span>
                              </Button>
                            )}

                            {isSanitizing && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickStatusToggle(room, 'AVAILABLE')}
                                className="h-8 px-2.5 text-xs gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                              >
                                <CheckCircle2 className="size-3" />
                                <span>Mark Ready</span>
                              </Button>
                            )}

                            {isMaintenance && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickStatusToggle(room, 'AVAILABLE')}
                                className="h-8 px-2.5 text-xs gap-1 border-border text-foreground hover:bg-muted cursor-pointer"
                              >
                                <CheckCircle2 className="size-3 text-emerald-600" />
                                <span>Restore</span>
                              </Button>
                            )}

                            {(isInUse || isStat) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickStatusToggle(room, 'AVAILABLE')}
                                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                <span>Free Suite</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Front-Desk / Doctor Action Toolbar
                        <div className="w-full flex items-center justify-between gap-2 min-w-0">
                          {isInUse || isStat ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickStatusToggle(room, 'AVAILABLE')}
                                className="h-8 text-xs px-2.5 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                              >
                                Free Room
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleOpenPatientChart(room.patientId, room.mrn)}
                                className="h-8 text-xs px-3 gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-medium shrink-0"
                              >
                                <span>Open Chart</span>
                                <ArrowRight className="size-3" />
                              </Button>
                            </>
                          ) : isSanitizing ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickStatusToggle(room, 'AVAILABLE')}
                              className="w-full h-8 text-xs border-border text-foreground cursor-pointer gap-1.5 font-medium"
                            >
                              <CheckCircle2 className="size-3.5 text-emerald-600" />
                              <span>Mark Ready</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                setTargetAssignRoom(room.roomNumber);
                                setIsAssignModalOpen(true);
                              }}
                              className="w-full h-8 text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                            >
                              <UserPlus className="size-3.5" />
                              <span>+ Assign Patient</span>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Room Modal (Administrator) */}
      <AddRoomModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onRoomCreated={handleRoomCreated}
      />

      {/* Edit Room Modal (Administrator) */}
      <EditRoomModal
        room={selectedRoomForEdit}
        open={!!selectedRoomForEdit}
        onOpenChange={(open) => !open && setSelectedRoomForEdit(null)}
        onRoomUpdated={handleRoomUpdated}
        onRoomDeleted={handleRoomDeleted}
      />

      {/* Assign Room Modal (Receptionist / Front Desk) */}
      <AssignRoomModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        targetRoomNumber={targetAssignRoom}
        rooms={rooms as any}
        availableRooms={availableRoomsList}
        patients={patients}
        onAssign={handleAssignPatient}
      />

      {/* Patient Chart Modal */}
      <PatientChartModal
        patient={selectedChartPatient}
        onClose={() => setSelectedChartPatient(null)}
      />

      {/* Command Palette (⌘K) */}
      <CommandMenu open={isCommandOpen} onOpenChange={setIsCommandOpen} />
    </div>
  );
}
