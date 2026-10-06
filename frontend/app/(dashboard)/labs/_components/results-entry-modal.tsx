'use client';

import React, { useState, useEffect } from 'react';
import {
  Beaker,
  AlertCircle,
  Loader2,
  Check,
  Plus,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { LabOrder, LabResultItem } from '@/types';
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

export interface ResultsEntryModalProps {
  order: LabOrder | null;
  onClose: () => void;
  onSubmit: (orderId: string, findings: LabResultItem[], summary: string) => Promise<{ success: boolean; error?: string }>;
}

const DEFAULT_TEMPLATES: Record<string, LabResultItem[]> = {
  'Comprehensive Metabolic Panel (CMP)': [
    { parameter: 'Serum Glucose', value: '94', unit: 'mg/dL', referenceRange: '70 - 99', isAbnormal: false },
    { parameter: 'Blood Urea Nitrogen (BUN)', value: '16', unit: 'mg/dL', referenceRange: '7 - 20', isAbnormal: false },
    { parameter: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.6 - 1.2', isAbnormal: false },
    { parameter: 'eGFR', value: '92', unit: 'mL/min/1.73m²', referenceRange: '> 60', isAbnormal: false },
    { parameter: 'Serum Sodium (Na+)', value: '140', unit: 'mEq/L', referenceRange: '135 - 145', isAbnormal: false },
    { parameter: 'Serum Potassium (K+)', value: '4.1', unit: 'mEq/L', referenceRange: '3.5 - 5.0', isAbnormal: false },
    { parameter: 'Total Bilirubin', value: '0.8', unit: 'mg/dL', referenceRange: '0.2 - 1.2', isAbnormal: false },
  ],
  'Complete Blood Count (CBC) with Diff': [
    { parameter: 'White Blood Cell (WBC)', value: '6.8', unit: '10^3/uL', referenceRange: '4.5 - 11.0', isAbnormal: false },
    { parameter: 'Red Blood Cell (RBC)', value: '4.7', unit: '10^6/uL', referenceRange: '4.1 - 5.1', isAbnormal: false },
    { parameter: 'Hemoglobin (Hgb)', value: '14.2', unit: 'g/dL', referenceRange: '12.0 - 16.0', isAbnormal: false },
    { parameter: 'Hematocrit (Hct)', value: '42.5', unit: '%', referenceRange: '36.0 - 48.0', isAbnormal: false },
    { parameter: 'Platelet Count', value: '254', unit: '10^3/uL', referenceRange: '150 - 450', isAbnormal: false },
  ],
  'Lipid Profile & Atherogenic Risk Panel': [
    { parameter: 'Total Cholesterol', value: '192', unit: 'mg/dL', referenceRange: '< 200', isAbnormal: false },
    { parameter: 'HDL Cholesterol', value: '52', unit: 'mg/dL', referenceRange: '> 40', isAbnormal: false },
    { parameter: 'LDL-C Calculated', value: '112', unit: 'mg/dL', referenceRange: '< 100', isAbnormal: true },
    { parameter: 'Triglycerides', value: '138', unit: 'mg/dL', referenceRange: '< 150', isAbnormal: false },
  ],
  'Cardiac Troponin I (hs-cTnI High Sensitivity)': [
    { parameter: 'High-Sensitivity Troponin I', value: '8.4', unit: 'ng/L', referenceRange: '< 14.0', isAbnormal: false },
  ],
  'Urinalysis with Microscopic Examination': [
    { parameter: 'Specific Gravity', value: '1.018', unit: 'SG', referenceRange: '1.005 - 1.030', isAbnormal: false },
    { parameter: 'pH', value: '6.0', unit: 'pH', referenceRange: '5.0 - 8.0', isAbnormal: false },
    { parameter: 'Protein', value: 'Negative', unit: '', referenceRange: 'Negative', isAbnormal: false },
    { parameter: 'Glucose', value: 'Negative', unit: '', referenceRange: 'Negative', isAbnormal: false },
    { parameter: 'Leukocyte Esterase', value: 'Negative', unit: '', referenceRange: 'Negative', isAbnormal: false },
  ],
  'Serum Ferritin & Total Iron Binding Panel': [
    { parameter: 'Serum Ferritin', value: '45', unit: 'ng/mL', referenceRange: '30 - 300', isAbnormal: false },
    { parameter: 'Total Iron', value: '78', unit: 'mcg/dL', referenceRange: '60 - 170', isAbnormal: false },
    { parameter: 'Iron Saturation', value: '26', unit: '%', referenceRange: '20 - 50', isAbnormal: false },
  ],
};

export function ResultsEntryModal({
  order,
  onClose,
  onSubmit,
}: ResultsEntryModalProps) {
  const [analytes, setAnalytes] = useState<LabResultItem[]>([]);
  const [summary, setSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!order) return;

    if (order.results && order.results.length > 0) {
      setAnalytes(order.results);
      setSummary(order.resultSummary || 'Standard specimen analysis run completed.');
    } else {
      // Find matching template or default
      const matchedKey = Object.keys(DEFAULT_TEMPLATES).find((k) => order.testName.includes(k) || k.includes(order.testName));
      const template = matchedKey ? DEFAULT_TEMPLATES[matchedKey] : [
        { parameter: 'Primary Analyte Result', value: 'Normal', unit: 'Index', referenceRange: 'Normal', isAbnormal: false },
      ];
      setAnalytes(template);
      setSummary('Specimen verified within expected physiological parameters.');
    }
  }, [order]);

  if (!order) return null;

  const handleUpdateAnalyte = (index: number, field: keyof LabResultItem, val: any) => {
    setAnalytes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleToggleAbnormal = (index: number) => {
    setAnalytes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], isAbnormal: !next[index].isAbnormal };
      return next;
    });
  };

  const handleAddAnalyte = () => {
    setAnalytes((prev) => [
      ...prev,
      { parameter: 'Additional Analyte', value: '', unit: '', referenceRange: '', isAbnormal: false },
    ]);
  };

  const handleRemoveAnalyte = (index: number) => {
    setAnalytes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (analytes.length === 0) {
      setErrorMessage('At least one analyte finding must be recorded.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmit(order.id, analytes, summary.trim());
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to submit findings.');
      }
    } catch {
      setErrorMessage('A network error occurred while submitting findings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto p-0 bg-card border-border shadow-2xl text-foreground">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Beaker className="size-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Enter Laboratory Analyte Findings
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {order.orderNumber} • {order.testName} for <span className="font-semibold text-foreground">{order.patientName}</span> ({order.mrn})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 text-xs">
          {/* Analytes Form Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <FileCheck className="size-3.5 text-muted-foreground" />
                <span>Quantitative & Qualitative Analytes</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAnalyte}
                className="h-7 text-[11px] gap-1 px-2 border-border cursor-pointer"
              >
                <Plus className="size-3" />
                <span>Add Row</span>
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {analytes.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex items-center gap-2 transition-colors ${
                    item.isAbnormal
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Analyte Name"
                      value={item.parameter}
                      onChange={(e) => handleUpdateAnalyte(idx, 'parameter', e.target.value)}
                      className="h-8 text-xs font-medium"
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="text"
                      placeholder="Value"
                      value={item.value}
                      onChange={(e) => handleUpdateAnalyte(idx, 'value', e.target.value)}
                      className="h-8 text-xs font-mono font-semibold"
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="text"
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) => handleUpdateAnalyte(idx, 'unit', e.target.value)}
                      className="h-8 text-[11px] font-mono"
                    />
                  </div>
                  <div className="w-28">
                    <Input
                      type="text"
                      placeholder="Ref Range"
                      value={item.referenceRange}
                      onChange={(e) => handleUpdateAnalyte(idx, 'referenceRange', e.target.value)}
                      className="h-8 text-[11px] font-mono text-muted-foreground"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleAbnormal(idx)}
                    className={`h-8 px-2 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer border ${
                      item.isAbnormal
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40'
                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {item.isAbnormal ? 'Abnormal' : 'Normal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAnalyte(idx)}
                    className="text-muted-foreground hover:text-destructive p-1 transition-colors cursor-pointer"
                    title="Remove row"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Narrative Summary */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              Laboratory Narrative Summary & Technician Conclusion *
            </label>
            <Textarea
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Specimen analyzed on automated hematology track. Mild leukocytosis with normal differential..."
              className="text-xs min-h-[64px] bg-background border-border text-foreground"
            />
          </div>

          {/* Footer */}
          <DialogFooter className="px-0 pt-3 border-t border-border flex items-center justify-between sm:justify-between">
            <span className="text-[11px] font-mono text-muted-foreground">
              Technician Entry • Status will update to RESULTED
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8.5 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-8.5 text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-xs"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                <span>Record & Result Findings</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
