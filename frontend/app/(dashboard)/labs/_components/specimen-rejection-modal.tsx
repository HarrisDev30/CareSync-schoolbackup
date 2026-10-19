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
  AlertTriangle,
  FlaskConical,
  XCircle,
  Loader2,
  Check,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { LabOrder } from '@/types';
import { rejectDiagnosticSpecimen } from '@/lib/api';

interface SpecimenRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: LabOrder | null;
  onOrderRejected: (rejectedOrder: LabOrder) => void;
}

const CLIA_REJECTION_PRESETS = [
  {
    code: 'HEMOLYSIS',
    label: 'Gross Hemolysis (Index > 300 mg/dL)',
    desc: 'Severe red blood cell lysis renders serum chemistry analytes (K+, AST, LDH) uninterpretable.',
  },
  {
    code: 'CLOTTED',
    label: 'Specimen Clotted in EDTA Tube',
    desc: 'Micro-clots in whole blood tube compromise automated hematology CBC and platelet enumeration.',
  },
  {
    code: 'QNS',
    label: 'Quantity Not Sufficient (QNS)',
    desc: 'Insufficient plasma/serum volume to complete diagnostic analyzer aspiration protocol.',
  },
  {
    code: 'MISLABELED',
    label: 'Unlabeled / Mislabeled Container',
    desc: 'Two-identifier verification failed. Specimen container tube missing verified patient barcode/name.',
  },
  {
    code: 'CONTAINER_MISMATCH',
    label: 'Improper Tube Type / Additive',
    desc: 'Draw collected in incorrect collection tube (e.g., Sodium Heparin instead of EDTA/SST).',
  },
  {
    code: 'TRANSIT_DELAY',
    label: 'Temperature / Transit Delay Excursion',
    desc: 'Specimen exceeded stability time/temperature window prior to laboratory accessioning.',
  },
];

export function SpecimenRejectionModal({
  isOpen,
  onClose,
  order,
  onOrderRejected,
}: SpecimenRejectionModalProps) {
  const [selectedReason, setSelectedReason] = useState(CLIA_REJECTION_PRESETS[0]?.label || '');
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!order) return null;

  const handleConfirmRejection = async () => {
    if (!selectedReason) {
      setErrorMessage('Please select a regulatory CLIA/CAP rejection rationale.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await rejectDiagnosticSpecimen(order.id, selectedReason, customNotes);
      if (res.success && res.data) {
        onOrderRejected(res.data);
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to reject laboratory specimen.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error recording specimen rejection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-xl flex flex-col p-0 bg-card text-card-foreground border-border overflow-hidden shadow-2xl">
        <DialogHeader className="p-5 border-b border-border bg-destructive/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Specimen Accession Rejection Protocol
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                CLIA / CAP mandatory specimen exception logging for order{' '}
                <strong className="font-mono text-foreground">{order.orderNumber}</strong> ({order.testName}).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="px-5 py-2.5 bg-destructive/10 border-b border-destructive/20 text-destructive text-xs flex items-center gap-2 font-medium shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-5 space-y-4 text-xs overflow-y-auto">
          {/* Order Summary Strip */}
          <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-foreground">{order.patientName}</span>
              <span className="font-mono text-muted-foreground ml-2">({order.mrn})</span>
            </div>
            <Badge variant="outline" className="font-mono text-[11px] uppercase">
              Priority: {order.priority}
            </Badge>
          </div>

          {/* Rejection Presets */}
          <div className="space-y-2">
            <label className="font-medium text-foreground flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-destructive" />
              Regulatory Rejection Reason <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {CLIA_REJECTION_PRESETS.map((preset) => {
                const isSelected = selectedReason === preset.label;
                return (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => setSelectedReason(preset.label)}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer flex flex-col gap-0.5 ${
                      isSelected
                        ? 'border-destructive bg-destructive/10 text-foreground'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-xs text-foreground">
                      <span>{preset.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-destructive" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Notes / Instructions for Recalling Attending */}
          <div className="space-y-1">
            <label className="font-medium text-foreground block">
              Recollection Instructions & Phlebotomy Notes
            </label>
            <Textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Please redraw 1 lavender top EDTA tube and send immediately on ice to Central Core Lab..."
              className="text-xs bg-background border-border resize-none"
            />
          </div>

          {/* Warning Banner */}
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-start gap-2.5 text-[11px]">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>CLIA QA Audit Trail Event:</strong> Rejecting this specimen flags the worklist, notifies
              attending clinician {order.requestedBy}, and initiates an automatic recollection work order.
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border bg-muted/20 shrink-0 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 text-xs px-4 cursor-pointer border-border"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleConfirmRejection}
            disabled={isSubmitting}
            className="h-10 text-xs px-5 cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Logging Rejection...</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Confirm Specimen Rejection</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
