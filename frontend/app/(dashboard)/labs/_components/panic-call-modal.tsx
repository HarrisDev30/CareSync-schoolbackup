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
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { LabOrder } from '@/types';
import { logPanicValueCall, PHYSICIAN_PRESETS } from '@/lib/api';

interface PanicCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: LabOrder | null;
  onSuccess?: () => void;
  onCallLogged?: (order: LabOrder) => void;
}

export function PanicCallModal({
  isOpen,
  onClose,
  order,
  onSuccess,
  onCallLogged,
}: PanicCallModalProps) {
  const [calledTo, setCalledTo] = useState('Dr. Sarah Chen, MD');
  const [readBackConfirmed, setReadBackConfirmed] = useState(true);
  const [notes, setNotes] = useState('Verbal telephone notification completed. Critical values read back and confirmed by attending physician.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!order) return null;

  const panicResults = order.results?.filter((r) => r.isPanicValue || r.isAbnormal) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readBackConfirmed) {
      setErrorMsg('CLIA/CAP regulations require verbal read-back confirmation of critical/panic values.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await logPanicValueCall(order.id, {
      calledTo,
      callerName: 'Elena Rostova (Lab Tech)',
      readBackConfirmed,
      notes,
    });

    setIsSubmitting(false);
    if (res.success && res.data) {
      if (onCallLogged) onCallLogged(res.data);
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to log panic value telephone call.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader className="border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <PhoneCall className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Document Critical / Panic Value Notification
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Mandatory CLIA/CAP laboratory regulation: Verbal telephone read-back with attending clinician.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Panic Values Highlight Strip */}
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
              <AlertTriangle className="size-3.5" />
              <span>Flagged Critical / Panic Laboratory Values:</span>
            </span>
            <Badge variant="destructive" className="font-mono text-[9px] uppercase font-bold">
              PANIC ALERT
            </Badge>
          </div>
          <div className="divide-y divide-rose-500/20">
            {panicResults.length > 0 ? (
              panicResults.map((r) => (
                <div key={r.parameter} className="py-1 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-foreground">{r.parameter}:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-300">
                    {r.value} {r.unit} (Ref: {r.referenceRange})
                  </span>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-[11px]">
                {order.testName} marked as critical clinical priority.
              </div>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
          {/* Attending Doctor */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground font-semibold">Attending Clinician Notified *</label>
            <Select value={calledTo} onValueChange={setCalledTo}>
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue placeholder="Select notified physician" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PHYSICIAN_PRESETS.map((doc) => (
                    <SelectItem key={doc.id} value={doc.name} className="text-xs">
                      {doc.name} ({doc.specialty})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Mandatory Verbal Read-Back Checkbox */}
          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
            <label className="inline-flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={readBackConfirmed}
                onChange={(e) => setReadBackConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-border size-4 text-primary focus:ring-1 cursor-pointer"
                required
              />
              <div className="space-y-0.5">
                <span className="font-bold text-foreground">
                  I certify verbal telephone read-back was completed and confirmed.
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Clinician verbally repeated back the patient legal name, MRN ({order.mrn}), analyte parameter, and critical value.
                </p>
              </div>
            </label>
          </div>

          {/* Call Documentation Notes */}
          <div className="space-y-1">
            <label className="text-muted-foreground font-semibold">Telephone Log & Read-Back Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Spoke directly with Dr. Chen at 16:12. Troponin 48.6 ng/L acknowledged. Immediate cardiology review ordered."
              className="h-16 text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-border flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground font-mono">
              Caller: <strong>Elena Rostova (Lab Tech)</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 px-3 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !readBackConfirmed}
                className="h-8 px-4 text-xs font-medium cursor-pointer gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Logging Call...</span>
                  </>
                ) : (
                  <>
                    <PhoneCall className="size-3.5" />
                    <span>Certify Verbal Read-Back</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

