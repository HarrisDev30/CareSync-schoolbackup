'use client';

import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  RotateCcw,
} from 'lucide-react';
import { Appointment, RescheduleAppointmentInput } from '@/types';
import { rescheduleAppointment, PHYSICIAN_PRESETS } from '@/lib/api';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onRescheduled: (updated: Appointment) => void;
}

const ROOM_OPTIONS = [
  'Exam Suite 1A',
  'Exam Suite 2A',
  'Exam Suite 3B',
  'Exam Suite 4A',
  'Cardiology Suite 1A',
  'Triage Station A',
  'Triage Station B',
];

export function RescheduleModal({
  isOpen,
  onClose,
  appointment,
  onRescheduled,
}: RescheduleModalProps) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [physicianId, setPhysicianId] = useState(PHYSICIAN_PRESETS[0]?.id || 'u-1');
  const [roomNumber, setRoomNumber] = useState('Exam Suite 3B');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (appointment) {
      const aptDate = new Date(appointment.scheduledAt);
      const yyyy = aptDate.getFullYear();
      const mm = String(aptDate.getMonth() + 1).padStart(2, '0');
      const dd = String(aptDate.getDate()).padStart(2, '0');
      setScheduledDate(`${yyyy}-${mm}-${dd}`);

      const hh = String(aptDate.getHours()).padStart(2, '0');
      const min = String(aptDate.getMinutes()).padStart(2, '0');
      setScheduledTime(`${hh}:${min}`);

      setDurationMinutes(String(appointment.durationMinutes || 30));
      setPhysicianId(appointment.physicianId || PHYSICIAN_PRESETS[0]?.id || 'u-1');
      setRoomNumber(appointment.roomNumber || 'Exam Suite 3B');
      setReason(appointment.reason || '');
      setNotes(appointment.notes || '');
      setErrorMessage(null);
    }
  }, [appointment]);

  if (!appointment) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate || !scheduledTime) {
      setErrorMessage('New date and time are required for rescheduling.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const combinedIso = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      const selectedPhysician = PHYSICIAN_PRESETS.find((p) => p.id === physicianId);

      const input: RescheduleAppointmentInput = {
        scheduledAt: combinedIso,
        durationMinutes: parseInt(durationMinutes, 10) || 30,
        physicianId,
        physicianName: selectedPhysician?.name || appointment.physicianName,
        roomNumber,
        reason: reason.trim() || appointment.reason,
        notes: notes.trim() ? `[Rescheduled] ${notes.trim()}` : appointment.notes,
      };

      const res = await rescheduleAppointment(appointment.id, input);
      if (res.success && res.data) {
        onRescheduled(res.data);
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to reschedule appointment.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error processing reschedule request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-lg flex flex-col p-0 bg-card text-card-foreground border-border overflow-hidden shadow-2xl">
        <DialogHeader className="p-5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Reschedule Outpatient Consultation
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Update date/time, exam room suite, or attending clinician for{' '}
                <strong className="font-semibold text-foreground">{appointment.patientName}</strong> ({appointment.mrn}).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="px-5 py-2.5 bg-destructive/10 border-b border-destructive/20 text-destructive text-xs flex items-center gap-2 font-medium shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs overflow-y-auto">
          {/* Current Appointment Banner */}
          <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-foreground">{appointment.reason}</div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                Current: {new Date(appointment.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {appointment.status}
            </Badge>
          </div>

          {/* New Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-foreground flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                New Visit Date <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="h-10 text-xs font-mono bg-background border-border"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Time Slot <span className="text-destructive">*</span>
              </label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="h-10 text-xs font-mono bg-background border-border"
                required
              />
            </div>
          </div>

          {/* Duration & Room */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-foreground">Duration (Minutes)</label>
              <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                <SelectTrigger className="h-10 text-xs bg-background border-border w-full">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="15">15 mins (Brief check)</SelectItem>
                  <SelectItem value="30">30 mins (Standard consult)</SelectItem>
                  <SelectItem value="45">45 mins (Comprehensive)</SelectItem>
                  <SelectItem value="60">60 mins (Intake / Procedure)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5 text-muted-foreground" />
                Assigned Examination Suite
              </label>
              <Select value={roomNumber} onValueChange={setRoomNumber}>
                <SelectTrigger className="h-10 text-xs bg-background border-border w-full">
                  <SelectValue placeholder="Select suite" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {ROOM_OPTIONS.map((room) => (
                    <SelectItem key={room} value={room}>
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Attending Physician */}
          <div className="space-y-1">
            <label className="font-medium text-foreground flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-primary" />
              Attending Physician
            </label>
            <Select value={physicianId} onValueChange={setPhysicianId}>
              <SelectTrigger className="h-10 text-xs bg-background border-border w-full">
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {PHYSICIAN_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason & Reschedule Notes */}
          <div className="space-y-1">
            <label className="font-medium text-foreground">Visit Indication / Chief Complaint</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Hypertension Follow-up & Medication Titration"
              className="h-10 text-xs bg-background border-border"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Rescheduling Rationale & Clinical Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Patient requested morning slot due to work conflict. Transferred from Station 2A."
              className="text-xs bg-background border-border resize-none"
            />
          </div>
        </form>

        <DialogFooter className="p-4 border-t border-border bg-muted/20 shrink-0 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-10 text-xs px-4 cursor-pointer border-border"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="h-10 text-xs px-5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-medium gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Rescheduling...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Reschedule</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
