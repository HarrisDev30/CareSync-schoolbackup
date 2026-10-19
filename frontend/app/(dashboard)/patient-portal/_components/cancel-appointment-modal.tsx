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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CalendarX,
  AlertTriangle,
  Stethoscope,
  Clock,
} from 'lucide-react';
import { Appointment } from '@/types';
import { cancelAppointment } from '@/lib/api';

interface CancelAppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCancelled: (updatedApt: Appointment) => void;
}

const CANCELLATION_REASONS = [
  'Schedule Conflict / Personal Matter',
  'Symptoms Resolved / Condition Improved',
  'Need to Reschedule to Later Date',
  'Transportation / Travel Issue',
  'Alternative Care Provider Consulted',
];

export function CancelAppointmentModal({
  appointment,
  isOpen,
  onClose,
  onAppointmentCancelled,
}: CancelAppointmentModalProps) {
  const [reason, setReason] = useState<string>('Schedule Conflict / Personal Matter');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullReason = customNotes.trim()
      ? `${reason} — ${customNotes.trim()}`
      : reason;

    setIsSubmitting(true);
    try {
      const res = await cancelAppointment(appointment.id, fullReason, 'PATIENT');
      if (res.success && res.data) {
        onAppointmentCancelled(res.data);
        handleClose();
      } else {
        setError(res.error || 'Failed to cancel appointment.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred while cancelling appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('Schedule Conflict / Personal Matter');
    setCustomNotes('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md bg-card text-card-foreground border-border overflow-hidden shadow-2xl p-0">
        <DialogHeader className="p-5 border-b border-border bg-destructive/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <CalendarX className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
                Cancel Outpatient Visit
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Release your reserved clinical slot and notify admissions staff.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              {error}
            </div>
          )}

          {/* Appointment Snapshot */}
          <div className="p-3 bg-muted/40 rounded-lg border border-border/70 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Stethoscope className="size-3.5 text-primary" />
                {appointment.physicianName}
              </span>
              <span className="font-mono text-muted-foreground">{appointment.roomNumber || 'Exam Suite'}</span>
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Reason: {appointment.reason}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/50">
              <Clock className="size-3" />
              <span>
                {new Date(appointment.scheduledAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Cancellation Reason Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Select Reason for Cancellation *
            </Label>
            <div className="space-y-1.5">
              {CANCELLATION_REASONS.map((r) => {
                const isSelected = reason === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-destructive bg-destructive/5 text-foreground font-medium'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                    }`}
                  >
                    <span>{r}</span>
                    {isSelected && <span className="size-1.5 rounded-full bg-destructive" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Additional Details (Optional)
            </Label>
            <Textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Provide any additional context for the care team..."
              className="min-h-[60px] text-xs bg-background border-border"
            />
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span className="text-[11px]">
              Cancelling releases this slot for other walk-in patients. You can request a new visit at any time.
            </span>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="h-8 text-xs cursor-pointer border-border"
            >
              Keep Appointment
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 px-3 text-xs font-medium cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

