'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  DoorOpen,
  FileText,
  AlertCircle,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Search,
  ChevronsUpDown,
  X,
} from 'lucide-react';
import { Patient, Appointment, CreateAppointmentInput } from '@/types';
import { PHYSICIAN_PRESETS, fetchPatients } from '@/lib/api';
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  appointments?: Appointment[];
  onBook: (input: CreateAppointmentInput) => Promise<{ success: boolean; error?: string }>;
}

const MORNING_SLOTS = [
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
];

const AFTERNOON_SLOTS = [
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
];

const PRESET_INDICATIONS = [
  'General Consultation',
  'Hypertension Follow-up',
  'Routine Health Check',
  'Diagnostic Review',
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function BookingModal({
  isOpen,
  onClose,
  patients,
  appointments = [],
  onBook,
}: BookingModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedPhysicianId, setSelectedPhysicianId] = useState(PHYSICIAN_PRESETS[0]?.id || 'u-1');

  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewDate, setViewDate] = useState<Date>(() => new Date());

  const [selectedSlot, setSelectedSlot] = useState<string>('09:30 AM');
  const [examRoom, setExamRoom] = useState(PHYSICIAN_PRESETS[0]?.defaultRoom || 'Exam Suite 3B');
  const [reason, setReason] = useState('General Consultation');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Searchable combobox state for scalable EHR patient lookup
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isPatientComboboxOpen, setIsPatientComboboxOpen] = useState(false);
  const [remotePatients, setRemotePatients] = useState<Patient[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);

  // Merge locally provided patients with any patients retrieved from remote search
  const combinedPatients = useMemo(() => {
    const map = new Map<string, Patient>();
    for (const p of patients) {
      if (p && p.id) map.set(p.id, p);
    }
    for (const p of remotePatients) {
      if (p && p.id) map.set(p.id, p);
    }
    return Array.from(map.values());
  }, [patients, remotePatients]);

  const selectedPatient = useMemo(
    () => combinedPatients.find((p) => p.id === selectedPatientId) || combinedPatients[0],
    [combinedPatients, selectedPatientId],
  );

  // Sync initial patient selection if empty or when patients load
  useEffect(() => {
    if (!selectedPatientId && combinedPatients.length > 0) {
      setSelectedPatientId(combinedPatients[0].id);
    }
  }, [combinedPatients, selectedPatientId]);

  // Reset search query and combobox state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPatientSearchQuery('');
      setIsPatientComboboxOpen(false);
    }
  }, [isOpen]);

  // Debounced server-side query for enterprise scalability (millions of records)
  useEffect(() => {
    const trimmed = patientSearchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setIsSearchingRemote(false);
      return;
    }

    setIsSearchingRemote(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const results = await fetchPatients(trimmed);
        if (Array.isArray(results) && results.length > 0) {
          setRemotePatients((prev) => {
            const map = new Map<string, Patient>();
            for (const p of prev) map.set(p.id, p);
            for (const p of results) map.set(p.id, p);
            return Array.from(map.values());
          });
        }
      } catch {
        // Fall back gracefully to local filtering on network error
      } finally {
        setIsSearchingRemote(false);
      }
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [patientSearchQuery]);

  // High-performance multi-field filtering & ranking (windowed to top 25 matches for 60fps)
  const filteredPatients = useMemo(() => {
    const query = patientSearchQuery.trim().toLowerCase();
    if (!query) {
      return combinedPatients.slice(0, 20);
    }

    const cleanDigits = query.replace(/\D/g, '');

    const matches = combinedPatients.filter((p) => {
      const fullName = (p.fullName || '').toLowerCase();
      const mrn = (p.mrn || '').toLowerCase();
      const phone = (p.phone || '').toLowerCase();
      const dob = (p.dateOfBirth || '').toLowerCase();
      const blood = (p.bloodType || '').toLowerCase();

      if (fullName.includes(query)) return true;
      if (mrn.includes(query)) return true;
      if (dob.includes(query)) return true;
      if (blood === query) return true;
      if (phone.includes(query)) return true;
      if (cleanDigits.length >= 3 && phone.replace(/\D/g, '').includes(cleanDigits)) return true;

      return false;
    });

    // Score & sort: exact MRN or startsWith name gets priority
    matches.sort((a, b) => {
      const aName = (a.fullName || '').toLowerCase();
      const bName = (b.fullName || '').toLowerCase();
      const aMrn = (a.mrn || '').toLowerCase();
      const bMrn = (b.mrn || '').toLowerCase();

      if (aMrn === query && bMrn !== query) return -1;
      if (bMrn === query && aMrn !== query) return 1;
      if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
      if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
      return aName.localeCompare(bName);
    });

    return matches.slice(0, 25);
  }, [combinedPatients, patientSearchQuery]);

  const selectedPhysician = useMemo(
    () => PHYSICIAN_PRESETS.find((d) => d.id === selectedPhysicianId) || PHYSICIAN_PRESETS[0],
    [selectedPhysicianId],
  );

  // Convert 12-hr time string to 24-hr "HH:mm"
  const convertSlotTo24Hour = (slotStr: string) => {
    const [time, modifier] = slotStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const formattedDateStr = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  // Calendar Grid Generation (Zero External Bugs)
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isPast: boolean;
    }> = [];

    // Leading days
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isPast: true,
      });
    }

    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    // Days in current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const isToday =
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
      const isSelected =
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate();
      const isPast = d.getTime() < todayStart;

      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isPast,
      });
    }

    // Trailing days
    const totalSlots = days.length > 35 ? 42 : 35;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isPast: false,
      });
    }

    return days;
  }, [viewDate, selectedDate, today]);

  const monthLabel = useMemo(() => {
    return viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewDate]);

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDay = (d: Date) => {
    setSelectedDate(d);
    setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const handleQuickJump = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setSelectedDate(d);
    setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const handleClose = () => {
    setErrorMessage(null);
    setIsPatientComboboxOpen(false);
    setPatientSearchQuery('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedPatient) {
      setErrorMessage('Please select a registered patient record.');
      return;
    }

    if (!selectedPhysician) {
      setErrorMessage('Please assign an attending clinician.');
      return;
    }

    if (!reason.trim()) {
      setErrorMessage('Clinical indication / reason for visit is required.');
      return;
    }

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const time24 = convertSlotTo24Hour(selectedSlot);
    const scheduledAt = `${year}-${month}-${day}T${time24}:00Z`;

    setIsSubmitting(true);
    try {
      const res = await onBook({
        patientId: selectedPatient.id,
        physicianId: selectedPhysician.id,
        scheduledAt,
        roomNumber: examRoom,
        durationMinutes: 30,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        handleClose();
      } else {
        setErrorMessage(res.error || 'Failed to schedule appointment.');
      }
    } catch {
      setErrorMessage('Network error communicating with CareSync scheduling API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden flex flex-col border-border bg-card shadow-2xl">
        {/* Formal Clinical Header */}
        <DialogHeader className="px-6 py-3.5 border-b border-border bg-card shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8.5 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                <CalendarIcon className="size-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                  Schedule Outpatient Consultation
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Assign attending physician, designate examination suite, and confirm consultation time.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Validation Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-3 p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-xs text-destructive shrink-0">
            <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* 2-Pane Split Workbench (Zero Scroll: Everything Visible on Screen!) */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
            
            {/* LEFT PANE (5 cols): Clinician + Compact Calendar */}
            <div className="md:col-span-5 p-4.5 space-y-3.5 bg-muted/20 flex flex-col justify-between">
              <div className="space-y-3">
                {/* 1. Attending Clinician & Room */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Stethoscope className="size-3.5 text-muted-foreground" />
                      <span>Attending Physician</span>
                    </label>
                    <span className="text-[10px] font-mono text-muted-foreground">Provider</span>
                  </div>

                  <Select
                    value={selectedPhysicianId}
                    onValueChange={(docId) => {
                      setSelectedPhysicianId(docId);
                      const doc = PHYSICIAN_PRESETS.find((d) => d.id === docId);
                      if (doc) setExamRoom(doc.defaultRoom);
                    }}
                  >
                    <SelectTrigger className="w-full text-xs h-9 border-border bg-background shadow-none">
                      <SelectValue placeholder="Select physician..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover dark:bg-card border-border shadow-2xl z-50">
                      <SelectGroup>
                        {PHYSICIAN_PRESETS.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id} className="text-xs">
                            {doc.name} — {doc.specialty}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <div className="mt-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DoorOpen className="size-3 text-muted-foreground" />
                      <span className="text-[11px] font-medium">Designated Suite:</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {examRoom}
                    </span>
                  </div>
                </div>

                {/* 2. Compact Calendar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CalendarIcon className="size-3.5 text-muted-foreground" />
                      <span>Appointment Date</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickJump(0)}
                        className="text-[10px] font-medium px-2 py-0.5 rounded border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickJump(1)}
                        className="text-[10px] font-medium px-2 py-0.5 rounded border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
                      >
                        Tomorrow
                      </button>
                    </div>
                  </div>

                  {/* Calendar Widget Container (Compact & Clean) */}
                  <div className="rounded-lg border border-border bg-card p-2.5 shadow-xs">
                    {/* Month Navigator */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-foreground">
                        {monthLabel}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="size-6.5 rounded-md border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Previous Month"
                        >
                          <ChevronLeft className="size-3 text-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="size-6.5 rounded-md border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Next Month"
                        >
                          <ChevronRight className="size-3 text-foreground" />
                        </button>
                      </div>
                    </div>

                    {/* Weekday Headers - High Contrast & Legible */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-1.5 border-b border-border/60 pb-1">
                      {WEEKDAYS.map((w) => (
                        <div key={w} className="text-[11px] font-mono font-bold text-foreground/80 py-0.5">
                          {w}
                        </div>
                      ))}
                    </div>

                    {/* Day Grid - High Contrast Day Numbers */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((item, idx) => {
                        const isCurrentMonth = item.isCurrentMonth;
                        const isSelected = item.isSelected;
                        const isToday = item.isToday;
                        const isPast = item.isPast;

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={!isCurrentMonth || isPast}
                            onClick={() => handleSelectDay(item.date)}
                            className={`size-7 text-[11px] font-mono rounded-md flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-primary-foreground font-bold shadow-xs ring-1 ring-primary'
                                : isToday
                                ? 'border-2 border-primary text-primary font-bold bg-primary/10 hover:bg-primary/20'
                                : !isCurrentMonth
                                ? 'text-muted-foreground/30 cursor-not-allowed hover:bg-transparent'
                                : isPast
                                ? 'text-muted-foreground/60 line-through cursor-not-allowed hover:bg-transparent'
                                : 'text-foreground font-semibold hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            {item.dayNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Date Summary Tag */}
              <div className="text-center text-[11px] text-muted-foreground">
                Scheduled Date: <span className="font-semibold text-foreground">{formattedDateStr}</span>
              </div>
            </div>

            {/* RIGHT PANE (7 cols): Patient + Compact Slots + Indication + Notes (NO SCROLLING!) */}
            <div className="md:col-span-7 p-4.5 space-y-3.5 bg-card">
              {/* 1. Patient Record Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="size-3.5 text-muted-foreground" />
                    <span>Patient Medical Record</span>
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">EHR Index</span>
                </div>

                <Popover open={isPatientComboboxOpen} onOpenChange={setIsPatientComboboxOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      role="combobox"
                      aria-expanded={isPatientComboboxOpen}
                      aria-label="Select patient medical record"
                      className="w-full text-xs h-9 border border-border bg-background hover:bg-muted/40 focus:outline-none focus:ring-1 focus:ring-ring rounded-md px-2.5 flex items-center justify-between transition-colors shadow-none text-left cursor-pointer"
                    >
                      {selectedPatient ? (
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="font-semibold text-foreground truncate max-w-[170px]">
                            {selectedPatient.fullName}
                          </span>
                          <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/50 shrink-0">
                            {selectedPatient.mrn}
                          </span>
                          {selectedPatient.bloodType && (
                            <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline shrink-0">
                              • {selectedPatient.bloodType}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Search className="size-3.5" />
                          <span>Search patient by name, MRN, phone...</span>
                        </span>
                      )}
                      <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0 ml-1.5 opacity-60" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] min-w-[340px] sm:min-w-[420px] p-0 bg-popover dark:bg-card border-border shadow-2xl z-50 rounded-lg overflow-hidden"
                    align="start"
                    sideOffset={4}
                  >
                    {/* Search Input Bar */}
                    <div className="flex items-center border-b border-border px-3 py-2 bg-muted/20">
                      <Search className="size-3.5 text-muted-foreground shrink-0 mr-2" />
                      <input
                        type="text"
                        value={patientSearchQuery}
                        onChange={(e) => setPatientSearchQuery(e.target.value)}
                        placeholder="Search name, MRN, phone, or DOB..."
                        className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                        autoFocus
                      />
                      {isSearchingRemote && (
                        <Loader2 className="size-3.5 text-primary animate-spin shrink-0 ml-1 mr-1" />
                      )}
                      {patientSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setPatientSearchQuery('')}
                          className="text-muted-foreground hover:text-foreground shrink-0 ml-1 p-0.5 cursor-pointer"
                          title="Clear search"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Metadata & Stats Strip */}
                    <div className="flex items-center justify-between px-3 py-1 bg-muted/40 border-b border-border/40 text-[10px] text-muted-foreground font-mono">
                      <span>
                        {filteredPatients.length === 0
                          ? '0 records found'
                          : `Showing top ${filteredPatients.length} match${filteredPatients.length === 1 ? '' : 'es'}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block size-1.5 rounded-full bg-emerald-500"></span>
                        Enterprise EHR Search
                      </span>
                    </div>

                    {/* Scalable Results List (Windowed / Sliced) */}
                    <div className="max-h-56 overflow-y-auto p-1 divide-y divide-border/20">
                      {filteredPatients.length === 0 ? (
                        <div className="py-6 px-4 text-center">
                          <AlertCircle className="size-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-xs font-medium text-foreground">No patient record found</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {patientSearchQuery
                              ? `No matches for "${patientSearchQuery}". Try full name, MRN, or phone.`
                              : 'No patient records available.'}
                          </p>
                        </div>
                      ) : (
                        filteredPatients.map((p) => {
                          const isSelected = selectedPatient?.id === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPatientId(p.id);
                                setIsPatientComboboxOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-2 rounded-md transition-colors flex items-center justify-between group cursor-pointer ${
                                isSelected
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'hover:bg-muted text-foreground'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                {/* Line 1: Full name + MRN + Blood */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                                    {p.fullName}
                                  </span>
                                  <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/50 text-foreground">
                                    {p.mrn}
                                  </span>
                                  {p.bloodType && (
                                    <span className="font-mono text-[10px] px-1 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-semibold">
                                      {p.bloodType}
                                    </span>
                                  )}
                                </div>

                                {/* Line 2: Clinical demographics (DOB, Gender, Phone) */}
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                  {p.gender && <span>{p.gender}</span>}
                                  {p.dateOfBirth && (
                                    <>
                                      <span>•</span>
                                      <span>DOB: {p.dateOfBirth}</span>
                                    </>
                                  )}
                                  {p.phone && (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono">{p.phone}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {isSelected && (
                                <Check className="size-4 text-primary shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Footer Info for High Data Scale */}
                    <div className="px-3 py-1 bg-muted/30 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between font-mono">
                      <span>Indexed search across millions of records</span>
                      <span>Esc to close</span>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 2. Visual 30-Minute Consultation Time Slots (Ultra-Clear: Morning & Afternoon) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>Consultation Time Slot (30m)</span>
                  </label>
                  <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    Selected: {selectedSlot}
                  </span>
                </div>

                {/* Morning Slots */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    <Sun className="size-3.5" />
                    <span className="font-semibold">Morning</span>
                    <span className="text-[10px] text-muted-foreground font-normal">(AM)</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {MORNING_SLOTS.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-1.5 px-1 rounded-md text-xs font-mono font-medium transition-all text-center cursor-pointer border ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold ring-1 ring-primary'
                              : 'bg-background hover:bg-muted text-foreground border-border'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Afternoon Slots */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-sky-600 dark:text-sky-400">
                    <Sunset className="size-3.5" />
                    <span className="font-semibold">Afternoon</span>
                    <span className="text-[10px] text-muted-foreground font-normal">(PM)</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {AFTERNOON_SLOTS.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-1.5 px-1 rounded-md text-xs font-mono font-medium transition-all text-center cursor-pointer border ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold ring-1 ring-primary'
                              : 'bg-background hover:bg-muted text-foreground border-border'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Clinical Indication & Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-muted-foreground" />
                    <span>Clinical Indication</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground">Chief complaint</span>
                </div>

                <Input
                  type="text"
                  required
                  placeholder="Enter primary clinical reason for encounter..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-9 text-xs border-border bg-background"
                />

                {/* Compact Preset Chips */}
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  {PRESET_INDICATIONS.map((preset) => {
                    const isSelected = reason === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setReason(preset)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        {isSelected && <Check className="size-2.5" />}
                        <span>{preset}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Physician Intake / Referral Notes (Visible with Zero Scrolling!) */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Clinical Intake / Referral Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="Prior vitals, symptoms, or referral documentation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-9 text-xs border-border bg-background"
                />
              </div>
            </div>
          </div>

          {/* Footer with Formal Summary Ticket */}
          <DialogFooter className="px-6 py-3 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate max-w-md">
              <span className="size-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="truncate">
                <span className="font-semibold text-foreground">{formattedDateStr}</span> at{' '}
                <span className="font-semibold font-mono text-foreground">{selectedSlot}</span> •{' '}
                <span>{selectedPhysician.name}</span> ({examRoom})
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={handleClose}
                className="h-8.5 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-8.5 text-xs gap-1.5 cursor-pointer shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                <span>Confirm & Schedule</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
