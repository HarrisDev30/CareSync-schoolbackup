'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Patient } from '@/types';
import { PHYSICIAN_PRESETS } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  UserPlus,
  DoorOpen,
  Stethoscope,
  User,
  Search,
  ChevronsUpDown,
  Check,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  HeartPulse,
  Building2,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';

export interface RoomOption {
  id?: string;
  roomNumber: string;
  wing: string;
  status: 'IN_USE' | 'AVAILABLE' | 'SANITIZING' | 'STAT_EMERGENCY' | string;
  doctor?: string;
  patient?: string;
  patientId?: string;
  mrn?: string;
  reason?: string;
  elapsedMinutes?: number;
  expectedDurationMinutes?: number;
  bedType?: string;
}

interface AssignRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRoomNumber?: string;
  rooms?: RoomOption[];
  availableRooms?: string[];
  patients: Patient[];
  onAssign: (data: {
    roomNumber: string;
    patientId: string;
    patientName: string;
    patientMrn: string;
    doctorName: string;
    reason: string;
  }) => void;
}

const COMMON_REASONS = [
  'General Clinical Consultation',
  'Hypertension & Lisinopril Review',
  'Post-Catheterization Evaluation',
  'Glycemic Index & Diabetes Check',
  'Routine Physical Exam',
];

export function AssignRoomModal({
  isOpen,
  onClose,
  targetRoomNumber,
  rooms = [],
  availableRooms = [],
  patients,
  onAssign,
}: AssignRoomModalProps) {
  // Normalize room list
  const normalizedRooms = useMemo<RoomOption[]>(() => {
    if (rooms && rooms.length > 0) {
      return rooms;
    }
    if (availableRooms && availableRooms.length > 0) {
      return availableRooms.map((r) => ({
        id: r,
        roomNumber: r,
        wing: 'Outpatient Clinic',
        status: 'AVAILABLE',
        bedType: 'Standard Exam Bed',
      }));
    }
    return [];
  }, [rooms, availableRooms]);

  // Distinct Wings / Departments
  const distinctWings = useMemo(() => {
    const list = Array.from(new Set(normalizedRooms.map((r) => r.wing))).filter(Boolean);
    const standardWings = ['Outpatient Clinic', 'Cardiology & Specialty', 'Diagnostic Laboratory'];
    const ordered = standardWings.filter((w) => list.includes(w));
    list.forEach((w) => {
      if (!ordered.includes(w)) ordered.push(w);
    });
    return ordered.length > 0 ? ordered : standardWings;
  }, [normalizedRooms]);

  // All Available Rooms
  const allAvailableRooms = useMemo(() => {
    return normalizedRooms.filter((r) => r.status === 'AVAILABLE');
  }, [normalizedRooms]);

  // Department / Wing Availability Counts
  const wingCounts = useMemo(() => {
    const map: Record<string, { available: number; total: number }> = {};
    distinctWings.forEach((w) => {
      const total = normalizedRooms.filter((r) => r.wing === w).length;
      const available = normalizedRooms.filter((r) => r.wing === w && r.status === 'AVAILABLE').length;
      map[w] = { available, total };
    });
    return map;
  }, [normalizedRooms, distinctWings]);

  // Active Selections
  const [selectedWing, setSelectedWing] = useState<string>('ALL');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [roomSearchQuery, setRoomSearchQuery] = useState<string>('');

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>(PHYSICIAN_PRESETS[0]?.name || 'Dr. Sarah Chen, MD');
  const [reason, setReason] = useState<string>('General Clinical Consultation');

  // Search & Combobox States
  const [isPatientComboboxOpen, setIsPatientComboboxOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  const [isDoctorComboboxOpen, setIsDoctorComboboxOpen] = useState(false);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');

  // Synchronize initial selections when modal opens or props change
  useEffect(() => {
    if (!isOpen) return;

    if (targetRoomNumber) {
      setSelectedRoom(targetRoomNumber);
      const matched = normalizedRooms.find((r) => r.roomNumber === targetRoomNumber);
      if (matched) {
        setSelectedWing(matched.wing);
      }
    } else if (allAvailableRooms.length > 0) {
      // Pick first available room
      setSelectedWing('ALL');
      setSelectedRoom(allAvailableRooms[0].roomNumber);
    } else {
      setSelectedRoom('');
    }
  }, [isOpen, targetRoomNumber, normalizedRooms, allAvailableRooms]);

  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  // Selected Entities
  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  const selectedDoctor = useMemo(() => {
    return PHYSICIAN_PRESETS.find((d) => d.name === doctorName) || PHYSICIAN_PRESETS[0];
  }, [doctorName]);

  const selectedRoomDetails = useMemo(() => {
    return normalizedRooms.find((r) => r.roomNumber === selectedRoom);
  }, [normalizedRooms, selectedRoom]);

  // Filtered Available Rooms based on Wing and Search Query
  const filteredAvailableRooms = useMemo(() => {
    let list = selectedWing === 'ALL'
      ? allAvailableRooms
      : allAvailableRooms.filter((r) => r.wing === selectedWing);

    if (roomSearchQuery.trim()) {
      const q = roomSearchQuery.toLowerCase();
      list = list.filter((r) =>
        r.roomNumber.toLowerCase().includes(q) ||
        r.wing.toLowerCase().includes(q) ||
        (r.bedType && r.bedType.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allAvailableRooms, selectedWing, roomSearchQuery]);

  // Handle Wing Filter Change
  const handleSelectWing = (wing: string) => {
    setSelectedWing(wing);
    setRoomSearchQuery('');

    const matchingAvailable = wing === 'ALL'
      ? allAvailableRooms
      : allAvailableRooms.filter((r) => r.wing === wing);

    // If currently selected room is in matching list, keep it; otherwise select first available in this wing
    if (matchingAvailable.length > 0) {
      if (!matchingAvailable.some((r) => r.roomNumber === selectedRoom)) {
        setSelectedRoom(matchingAvailable[0].roomNumber);
      }
    } else {
      setSelectedRoom('');
    }
  };

  // Scalable Filtered Patient List
  const filteredPatients = useMemo(() => {
    const q = patientSearchQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) =>
      p.fullName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      (p.bloodType && p.bloodType.toLowerCase().includes(q)) ||
      (p.primaryPhysician && p.primaryPhysician.toLowerCase().includes(q))
    );
  }, [patients, patientSearchQuery]);

  // Scalable Filtered Doctor List
  const filteredDoctors = useMemo(() => {
    const q = doctorSearchQuery.trim().toLowerCase();
    if (!q) return PHYSICIAN_PRESETS;
    return PHYSICIAN_PRESETS.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.department.toLowerCase().includes(q) ||
      d.defaultRoom.toLowerCase().includes(q)
    );
  }, [doctorSearchQuery]);

  const handleClose = () => {
    setIsPatientComboboxOpen(false);
    setPatientSearchQuery('');
    setIsDoctorComboboxOpen(false);
    setDoctorSearchQuery('');
    setRoomSearchQuery('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedRoom) return;

    onAssign({
      roomNumber: selectedRoom,
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      patientMrn: selectedPatient.mrn,
      doctorName,
      reason: reason.trim() || 'Clinical Consultation',
    });

    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl bg-card border-border shadow-2xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4.5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <UserPlus className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Assign Patient to Room
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Select clinical department, designate available suite, and assign attending clinician.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm overflow-y-auto flex-1">
          {/* 1. Scalable Searchable Patient Combobox */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-4 text-muted-foreground" />
                <span>Patient Medical Record *</span>
              </label>
              <span className="text-xs font-mono text-muted-foreground">
                {patients.length} Registered Patients
              </span>
            </div>

            <Popover open={isPatientComboboxOpen} onOpenChange={setIsPatientComboboxOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={isPatientComboboxOpen}
                  className="w-full text-sm h-11 border border-border bg-background hover:bg-muted/40 focus:outline-none focus:ring-1 focus:ring-ring rounded-lg px-3.5 flex items-center justify-between transition-colors shadow-xs text-left cursor-pointer"
                >
                  {selectedPatient ? (
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="size-7 border border-border text-[11px] shrink-0">
                        <AvatarFallback className="text-[11px] font-semibold text-muted-foreground bg-muted">
                          {selectedPatient.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-foreground truncate max-w-[240px]">
                        {selectedPatient.fullName}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 bg-muted/60 text-muted-foreground shrink-0">
                        {selectedPatient.mrn}
                      </Badge>
                      <span className="text-xs text-muted-foreground hidden sm:inline shrink-0">
                        • {selectedPatient.age}y {selectedPatient.gender}
                        {selectedPatient.bloodType && ` • ${selectedPatient.bloodType}`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Search className="size-4" />
                      <span>Search patient by name, MRN, phone...</span>
                    </span>
                  )}
                  <ChevronsUpDown className="size-4 text-muted-foreground shrink-0 opacity-60 ml-2" />
                </button>
              </PopoverTrigger>

              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] min-w-[340px] sm:min-w-[580px] p-0 bg-popover dark:bg-card border-border shadow-2xl z-50 rounded-xl overflow-hidden"
                align="start"
                sideOffset={4}
              >
                {/* Search Input Bar */}
                <div className="flex items-center border-b border-border px-3.5 py-3 bg-muted/20">
                  <Search className="size-4 text-muted-foreground shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                    placeholder="Search patient by name, MRN, phone, blood group..."
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    autoFocus
                  />
                  {patientSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setPatientSearchQuery('')}
                      className="text-muted-foreground hover:text-foreground shrink-0 ml-1.5 p-1 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                {/* Filter Count & Metadata */}
                <div className="flex items-center justify-between px-3.5 py-1.5 bg-muted/40 border-b border-border/40 text-xs text-muted-foreground font-mono">
                  <span>
                    {filteredPatients.length} match{filteredPatients.length === 1 ? '' : 'es'} found
                  </span>
                  <span className="flex items-center gap-1.5">
                  </span>
                </div>

                {/* Smooth Mousewheel Scrollable Patient List */}
                <div
                  onWheel={(e) => e.stopPropagation()}
                  className="max-h-72 sm:max-h-80 overflow-y-auto overscroll-contain p-1.5 divide-y divide-border/20"
                >
                  {filteredPatients.length === 0 ? (
                    <div className="py-8 px-4 text-center">
                      <AlertCircle className="size-7 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium text-foreground">No patient record found</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        No matches for "{patientSearchQuery}". Try full name, MRN, or phone number.
                      </p>
                    </div>
                  ) : (
                    filteredPatients.map((p) => {
                      const isSelected = p.id === selectedPatient?.id;
                      const initials = p.fullName
                        ? p.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)
                        : 'PT';

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPatientId(p.id);
                            setIsPatientComboboxOpen(false);
                            setPatientSearchQuery('');
                          }}
                          className={`w-full p-3 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-primary/10 text-foreground font-semibold'
                              : 'hover:bg-muted/60 text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <Avatar className="size-9 border border-border text-xs shrink-0">
                              <AvatarFallback className="text-xs font-semibold text-muted-foreground bg-muted">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-foreground truncate">
                                {p.fullName}
                              </div>
                              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-0.5">
                                <span className="text-foreground font-medium">{p.mrn}</span>
                                <span>•</span>
                                <span>{p.age}y {p.gender}</span>
                                {p.bloodType && (
                                  <>
                                    <span>•</span>
                                    <span>Blood {p.bloodType}</span>
                                  </>
                                )}
                                {p.primaryPhysician && (
                                  <span className="hidden md:inline">
                                    • Attending: {p.primaryPhysician}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="size-4 text-primary shrink-0 ml-2" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* 2. Department & Available Rooms Selector (Scalable & Ergonomic) */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="size-4 text-muted-foreground" />
                <span>Department & Available Examination Suite *</span>
              </label>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {allAvailableRooms.length} Suites Available
                </span>
              </div>
            </div>

            {/* Department / Wing Navigation Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* All Wings Tab */}
              <button
                type="button"
                onClick={() => handleSelectWing('ALL')}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedWing === 'ALL'
                    ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                    : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border'
                }`}
              >
                <span>All Departments</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                    selectedWing === 'ALL'
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {allAvailableRooms.length}
                </span>
              </button>

              {/* Specific Department Tabs */}
              {distinctWings.map((w) => {
                const countInfo = wingCounts[w] || { available: 0, total: 0 };
                const isSelected = selectedWing === w;
                const hasFree = countInfo.available > 0;

                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleSelectWing(w)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                        : hasFree
                        ? 'bg-background hover:bg-muted text-foreground border-border'
                        : 'bg-background/60 hover:bg-muted text-muted-foreground border-border/60 opacity-75'
                    }`}
                  >
                    <span>{w}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                        isSelected
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : hasFree
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {countInfo.available} Free
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Room Search Bar (Optional filter for large scale) */}
            {allAvailableRooms.length > 4 && (
              <div className="relative">
                <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                  placeholder={`Search suites in ${selectedWing === 'ALL' ? 'all departments' : selectedWing}...`}
                  className="w-full pl-8 pr-8 py-1.5 text-xs bg-background border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {roomSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setRoomSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Available Rooms Grid / Card Selector */}
            <div className="space-y-2">
              {filteredAvailableRooms.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed border-border bg-background text-center">
                  <AlertCircle className="size-6 text-amber-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-foreground">
                    No examination suites currently available in {selectedWing}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    All rooms in this department are in active consultation or undergoing sanitization.
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectWing('ALL')}
                      className="h-8 text-xs cursor-pointer border-border font-medium gap-1"
                    >
                      <span>Show All Available Suites</span>
                      <ArrowRight className="size-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {filteredAvailableRooms.map((room) => {
                    const isSelected = room.roomNumber === selectedRoom;

                    return (
                      <button
                        key={room.roomNumber}
                        type="button"
                        onClick={() => setSelectedRoom(room.roomNumber)}
                        className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 border-primary ring-1 ring-primary shadow-xs'
                            : 'bg-background hover:bg-muted/50 border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="font-semibold text-xs text-foreground flex items-center gap-1.5 truncate">
                            <DoorOpen className={`size-3.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="truncate">{room.roomNumber}</span>
                          </div>
                          {isSelected && (
                            <Check className="size-3.5 text-primary shrink-0" />
                          )}
                        </div>

                        <div className="mt-2 space-y-0.5">
                          <div className="text-[11px] text-muted-foreground truncate font-medium">
                            {room.wing}
                          </div>
                          <div className="text-[11px] text-muted-foreground/80 font-mono truncate">
                            {room.bedType || 'Examination Suite'}
                          </div>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-border/40 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span className="size-1.5 rounded-full bg-emerald-500"></span>
                            Available
                          </span>
                          {isSelected && (
                            <span className="text-[10px] text-primary font-semibold font-mono">
                              Selected
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Suite Active Summary Bar */}
            {selectedRoomDetails && (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-foreground">
                    Assigning to <strong className="font-semibold text-emerald-700 dark:text-emerald-400">{selectedRoomDetails.roomNumber}</strong> ({selectedRoomDetails.wing} • {selectedRoomDetails.bedType || 'Exam Suite'})
                  </span>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] bg-background text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                  Ready for Intake
                </Badge>
              </div>
            )}
          </div>

          {/* 3. Attending Physician Searchable Combobox */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Stethoscope className="size-4 text-muted-foreground" />
                <span>Attending Physician / Clinician *</span>
              </label>
              <span className="text-xs font-mono text-muted-foreground">
                {PHYSICIAN_PRESETS.length} Active Clinicians
              </span>
            </div>

            <Popover open={isDoctorComboboxOpen} onOpenChange={setIsDoctorComboboxOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={isDoctorComboboxOpen}
                  className="w-full text-sm h-11 border border-border bg-background hover:bg-muted/40 focus:outline-none focus:ring-1 focus:ring-ring rounded-lg px-3.5 flex items-center justify-between transition-colors shadow-xs text-left cursor-pointer"
                >
                  {selectedDoctor ? (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Avatar className="size-7 border border-border text-[11px] shrink-0">
                        <AvatarFallback className="text-[11px] font-semibold text-muted-foreground bg-muted">
                          {selectedDoctor.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-foreground truncate max-w-[200px]">
                        {selectedDoctor.name}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 bg-muted/60 text-muted-foreground shrink-0">
                        {selectedDoctor.specialty}
                      </Badge>
                      <span className="text-xs text-muted-foreground hidden sm:inline truncate">
                        • {selectedDoctor.department}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Search className="size-4" />
                      <span>Search physician by name, specialty, or department...</span>
                    </span>
                  )}
                  <ChevronsUpDown className="size-4 text-muted-foreground shrink-0 opacity-60 ml-2" />
                </button>
              </PopoverTrigger>

              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] min-w-[340px] sm:min-w-[500px] p-0 bg-popover dark:bg-card border-border shadow-2xl z-50 rounded-xl overflow-hidden"
                align="start"
                sideOffset={4}
              >
                {/* Search Doctor Input */}
                <div className="flex items-center border-b border-border px-3.5 py-3 bg-muted/20">
                  <Search className="size-4 text-muted-foreground shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={doctorSearchQuery}
                    onChange={(e) => setDoctorSearchQuery(e.target.value)}
                    placeholder="Search physician by name, specialty, or department..."
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    autoFocus
                  />
                  {doctorSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setDoctorSearchQuery('')}
                      className="text-muted-foreground hover:text-foreground shrink-0 ml-1.5 p-1 cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                {/* Doctor List */}
                <div
                  onWheel={(e) => e.stopPropagation()}
                  className="max-h-64 overflow-y-auto overscroll-contain p-1.5 divide-y divide-border/20"
                >
                  {filteredDoctors.length === 0 ? (
                    <div className="py-6 px-4 text-center">
                      <AlertCircle className="size-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-medium text-foreground">No physician found</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        No matches for "{doctorSearchQuery}".
                      </p>
                    </div>
                  ) : (
                    filteredDoctors.map((doc) => {
                      const isSelected = doc.name === doctorName;

                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setDoctorName(doc.name);
                            setIsDoctorComboboxOpen(false);
                            setDoctorSearchQuery('');
                          }}
                          className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-primary/10 text-foreground font-semibold'
                              : 'hover:bg-muted/60 text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-8 rounded-full bg-muted flex items-center justify-center border border-border shrink-0">
                              <Stethoscope className="size-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-foreground truncate">
                                {doc.name}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span className="font-medium text-foreground">{doc.specialty}</span>
                                <span>•</span>
                                <span>{doc.department}</span>
                                <span>•</span>
                                <span>Suite: {doc.defaultRoom}</span>
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="size-4 text-primary shrink-0 ml-2" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* 4. Clinical Reason & Quick Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <HeartPulse className="size-4 text-muted-foreground" />
                <span>Clinical Reason / Chief Complaint *</span>
              </label>
            </div>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Acute hypertension follow-up, Lisinopril medication reconciliation"
              className="h-11 text-sm bg-background border-border shadow-xs rounded-lg px-3.5"
              required
            />
            {/* Quick Reason Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-xs text-muted-foreground">Quick presets:</span>
              {COMMON_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className="text-xs px-2.5 py-1 rounded-md border border-border bg-muted/40 hover:bg-muted hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Dialog Action Footer */}
          <DialogFooter className="border-t border-border pt-4 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="h-10 px-4 text-xs cursor-pointer border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedRoom || !selectedPatient}
              size="sm"
              className="h-10 px-5 text-sm font-semibold gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <UserPlus className="size-4" />
              <span>Confirm & Assign Room</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
