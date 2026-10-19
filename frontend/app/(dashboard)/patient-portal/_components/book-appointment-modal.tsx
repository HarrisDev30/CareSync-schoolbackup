'use client';

import React, { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Calendar as CalendarIcon,
  Clock,
  Stethoscope,
  Building2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Appointment } from '@/types';
import { PHYSICIAN_PRESETS, createAppointment } from '@/lib/api';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  patientMrn: string;
  onAppointmentBooked: (apt: Appointment) => void;
}

const COMMON_REASONS = [
  'Hypertension Review & Medication Refill',
  'Routine Physical & Preventive Wellness',
  'Glycemic Control & Diabetes Check',
  'Cardiology Evaluation & Chest Discomfort',
  'Post-Procedure Follow-Up',
  'Diagnostic Lab Results Discussion',
];

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:30 AM',
  '01:30 PM',
  '02:30 PM',
  '03:45 PM',
  '04:30 PM',
];

export function BookAppointmentModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  patientMrn,
  onAppointmentBooked,
}: BookAppointmentModalProps) {
  const [selectedWing, setSelectedWing] = useState<string>('Outpatient Clinic');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    PHYSICIAN_PRESETS[0]?.id || 'u-1',
  );
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[1]);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter doctors by selected department wing
  const filteredDoctors = PHYSICIAN_PRESETS.filter((doc) => {
    if (selectedWing === 'Outpatient Clinic') return doc.department.includes('Outpatient');
    if (selectedWing === 'Cardiology & Specialty') return doc.department.includes('Cardiology') || doc.department.includes('Specialty');
    if (selectedWing === 'Diagnostic Laboratory') return doc.department.includes('Diagnostic');
    return true;
  });

  const activeDoctor =
    PHYSICIAN_PRESETS.find((d) => d.id === selectedDoctorId) || filteredDoctors[0] || PHYSICIAN_PRESETS[0];

  const handleWingChange = (wing: string) => {
    setSelectedWing(wing);
    const docsInWing = PHYSICIAN_PRESETS.filter((doc) => {
      if (wing === 'Outpatient Clinic') return doc.department.includes('Outpatient');
      if (wing === 'Cardiology & Specialty') return doc.department.includes('Cardiology') || doc.department.includes('Specialty');
      if (wing === 'Diagnostic Laboratory') return doc.department.includes('Diagnostic');
      return true;
    });
    if (docsInWing.length > 0) {
      setSelectedDoctorId(docsInWing[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError('Please specify the clinical reason or chief complaint for this appointment.');
      return;
    }

    if (!selectedDate) {
      setError('Please choose a preferred appointment date.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build ISO scheduledAt timestamp combining date and time
      const [timeStr, meridiem] = selectedTime.split(' ');
      const [hoursStr, minutesStr] = timeStr.split(':');
      let hours = parseInt(hoursStr, 10);
      if (meridiem === 'PM' && hours !== 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      const dateObj = new Date(selectedDate);
      dateObj.setHours(hours, parseInt(minutesStr, 10), 0, 0);

      const res = await createAppointment({
        patientId,
        physicianId: activeDoctor.id,
        scheduledAt: dateObj.toISOString(),
        durationMinutes,
        reason: reason.trim(),
        roomNumber: activeDoctor.defaultRoom,
        notes: notes.trim() ? `Patient Request: ${notes.trim()}` : `Self-scheduled via Patient Portal. Wing: ${selectedWing}`,
      });

      if (res.success && res.data) {
        onAppointmentBooked(res.data);
        handleClose();
      } else {
        setError(res.error || 'Failed to schedule appointment. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while booking appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setNotes('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-0 bg-card text-card-foreground border-border overflow-hidden shadow-2xl">
        <DialogHeader className="p-5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CalendarIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
                Request Outpatient Appointment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Schedule an in-person clinical consultation for <strong className="text-foreground">{patientName}</strong> ({patientMrn}).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Department Wing Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="size-3.5 text-muted-foreground" />
              <span>Department Wing *</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                'Outpatient Clinic',
                'Cardiology & Specialty',
                'Diagnostic Laboratory',
              ].map((wing) => {
                const isSelected = selectedWing === wing;
                return (
                  <button
                    key={wing}
                    type="button"
                    onClick={() => handleWingChange(wing)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    }`}
                  >
                    <span className="font-semibold text-xs text-foreground">{wing}</span>
                    <span className="text-[10px] text-muted-foreground">In-Person Wing</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attending Physician Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Stethoscope className="size-3.5 text-muted-foreground" />
              <span>Attending Physician *</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredDoctors.map((doc) => {
                const isSelected = selectedDoctorId === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">{doc.name}</span>
                      {isSelected && <CheckCircle2 className="size-3.5 text-primary" />}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{doc.specialty}</span>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-muted-foreground">
                      <span>Room: {doc.defaultRoom}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CalendarIcon className="size-3.5 text-muted-foreground" />
                <span>Preferred Date *</span>
              </Label>
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 text-xs bg-background border-border"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                <span>Estimated Duration</span>
              </Label>
              <div className="flex items-center gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`flex-1 h-10 rounded-md border text-xs font-mono font-medium transition-colors cursor-pointer ${
                      durationMinutes === mins
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Slot Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Preferred Time Slot *</Label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground font-semibold'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason for Visit / Chief Complaint */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Reason for Consultation / Chief Complaint *
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your current symptoms, follow-up purpose, or prescription refill requirements..."
              className="min-h-[70px] text-xs bg-background border-border"
              required
            />
            {/* Quick Preset Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                >
                  + {r}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Notes (Optional) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Additional Notes for Clinical Staff (Optional)
            </Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Wheelchair assistance required upon arrival, bringing past lab reports..."
              className="h-9 text-xs bg-background border-border"
            />
          </div>

          {/* Outpatient In-Person Clinical Notice */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs flex items-start gap-2.5">
            <Sparkles className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">CareSync In-Person Outpatient Standard</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                All consultations are physical in-clinic visits requiring arrival triage, AHA vital assessment, and specimen chain of custody. Telemedicine is intentionally omitted for medical accuracy.
              </p>
            </div>
          </div>
        </form>

        <DialogFooter className="p-4 border-t border-border bg-muted/20 shrink-0 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="h-9 text-xs cursor-pointer border-border"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting || !reason.trim()}
            onClick={handleSubmit}
            className="h-9 px-4 text-xs font-medium cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <div className="size-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Scheduling...</span>
              </span>
            ) : (
              <span>Confirm Appointment Request</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

