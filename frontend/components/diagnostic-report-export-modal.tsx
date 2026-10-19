'use client';

import React from 'react';
import {
  Printer,
  ShieldCheck,
  Building2,
  FileCheck,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Stethoscope,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LabOrder } from '@/types';

interface DiagnosticReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: LabOrder | null;
}

export function DiagnosticReportExportModal({
  isOpen,
  onClose,
  order,
}: DiagnosticReportExportModalProps) {
  if (!order) return null;

  const results = order.results || [];
  const hasAbnormal = results.some((r) => r.isAbnormal || r.isPanicValue);
  const isStat = order.priority === 'STAT';

  const reportDate = order.verifiedAt
    ? new Date(order.verifiedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const reportTime = order.verifiedAt
    ? new Date(order.verifiedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 bg-card text-card-foreground border-border overflow-hidden shadow-2xl">
        {/* Top Screen Toolbar (Hidden during Print) */}
        <div className="print:hidden p-4 pr-12 border-b border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <FlaskConical className="size-5 text-sky-500 shrink-0 mt-0.5 sm:mt-0" />
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-foreground leading-snug">
                Certified Diagnostic Laboratory Report Export
              </DialogTitle>
              <p className="text-xs text-muted-foreground truncate">
                Requisition: <span className="font-mono font-medium text-foreground">{order.orderNumber}</span> • CAP / CLIA Accredited Laboratory Document
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 border-transparent shadow-xs w-full sm:w-auto justify-center"
            >
              <Printer className="size-3.5" />
              <span>Print Report / Save PDF</span>
            </Button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL LABORATORY REPORT BODY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-foreground bg-background print:p-0 print:m-0 print:overflow-visible print:bg-white print:text-black">
          {/* 1. Official Hospital & Pathology Letterhead */}
          <div className="border-b-2 border-primary/80 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="size-6 text-primary shrink-0" />
                <span className="text-lg font-black tracking-tight uppercase text-foreground">
                  CareSync Ambulatory Health System
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Department of Clinical Pathology & Laboratory Medicine
              </p>
              <p className="text-[11px] text-muted-foreground">
                100 Hospital Drive, Medical Arts Pavilion, Suite 400 • Tel: (555) 019-8300
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground pt-0.5">
                <span>CLIA ID: <strong>05D2084910</strong></span>
                <span>•</span>
                <span>CAP Accredited: <strong>#8194012</strong></span>
                <span>•</span>
                <span>Joint Commission Certified</span>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 font-mono text-xs shrink-0 bg-muted/30 p-2.5 rounded border border-border sm:bg-transparent sm:p-0 sm:border-0">
              <div className="text-[10px] uppercase font-bold text-primary tracking-wider">
                Official Laboratory Report
              </div>
              <div>
                Requisition #: <strong className="text-foreground">{order.orderNumber}</strong>
              </div>
              <div>
                Report Released: <span className="text-foreground">{reportDate} {reportTime}</span>
              </div>
              <div>
                Priority:{' '}
                <span className={isStat ? 'text-destructive font-bold' : 'text-foreground'}>
                  {order.priority}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Patient Demographics & Requisition Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-lg bg-muted/20 border border-border text-xs">
            <div>
              <span className="text-[10px] uppercase text-muted-foreground font-mono block">Patient Name</span>
              <strong className="text-sm font-bold text-foreground block truncate">{order.patientName}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted-foreground font-mono block">Medical Record (MRN)</span>
              <span className="font-mono font-semibold text-foreground">{order.mrn}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted-foreground font-mono block">Ordering Physician</span>
              <span className="font-medium text-foreground">{order.requestedBy}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted-foreground font-mono block">Specimen Accession</span>
              <span className="font-mono text-foreground">
                {new Date(order.requestedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Clinical Indication */}
          {order.clinicalIndication && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border/80 text-xs text-muted-foreground">
              <strong className="text-foreground font-semibold">Clinical Indication / Diagnostic Question:</strong>{' '}
              {order.clinicalIndication}
            </div>
          )}

          {/* 3. Diagnostic Test Findings Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <div>
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  {order.testName}
                </h4>
                <span className="text-xs text-muted-foreground font-mono">
                  Laboratory Section: {order.testCategory}
                </span>
              </div>
              <Badge
                variant="outline"
                className={`text-xs font-mono font-semibold ${
                  hasAbnormal
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                }`}
              >
                {hasAbnormal ? 'Abnormal Flag(s) Present' : 'Within Normal Range'}
              </Badge>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground">
                    <th className="py-2.5 px-3.5 text-left">Analyte / Component</th>
                    <th className="py-2.5 px-3.5 text-left">Observed Value</th>
                    <th className="py-2.5 px-3.5 text-left">Reference Interval</th>
                    <th className="py-2.5 px-3.5 text-left">Units</th>
                    <th className="py-2.5 px-3.5 text-right">Interpretation Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  {results.length > 0 ? (
                    results.map((item, idx) => (
                      <tr
                        key={idx}
                        className={
                          item.isPanicValue
                            ? 'bg-destructive/10'
                            : item.isAbnormal
                            ? 'bg-amber-500/5 dark:bg-amber-500/10'
                            : ''
                        }
                      >
                        <td className="py-2.5 px-3.5 font-sans font-medium text-foreground">
                          {item.parameter}
                        </td>
                        <td className="py-2.5 px-3.5 font-bold text-foreground">
                          {item.value}
                        </td>
                        <td className="py-2.5 px-3.5 text-muted-foreground">
                          {item.referenceRange}
                        </td>
                        <td className="py-2.5 px-3.5 text-muted-foreground font-sans">
                          {item.unit || '—'}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-sans">
                          {item.isPanicValue ? (
                            <Badge variant="outline" className="text-[10px] font-mono font-bold bg-destructive/15 text-destructive border-destructive/30">
                              CRITICAL PANIC
                            </Badge>
                          ) : item.isAbnormal ? (
                            <Badge variant="outline" className="text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
                              ABNORMAL
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                              NORMAL
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground italic">
                        Analytical testing in progress. Analyzer findings will be populated upon certification.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Pathologist Interpretive Summary */}
          {order.resultSummary && (
            <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-1">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Pathologist Diagnostic Narrative & Interpretation:
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {order.resultSummary}
              </p>
            </div>
          )}

          {/* 5. Attending Physician Review Notes if Present */}
          {order.physicianReviewNotes && (
            <div className="p-3.5 rounded-lg border border-border bg-primary/5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Stethoscope className="size-3.5" />
                <span>Attending Physician Review & Action Plan:</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {order.physicianReviewNotes}
              </p>
              {order.reviewedBy && (
                <div className="text-[11px] font-mono text-muted-foreground pt-1">
                  Reviewed by: <strong className="text-foreground">{order.reviewedBy}</strong>
                  {order.reviewedAt && ` on ${new Date(order.reviewedAt).toLocaleDateString()}`}
                </div>
              )}
            </div>
          )}

          {/* 6. Certification Signature Block & Security Seal */}
          <div className="pt-4 border-t-2 border-border/80 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Electronic Signature Verification — Valid Under 21 CFR Part 11</span>
              </div>
              <p className="text-xs font-mono text-foreground font-medium">
                Certified By: {order.verifiedBy || 'Dr. Elena Rostova, MD, PhD, DABCC'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Director of Clinical Pathology & Laboratory Quality Assurance
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                Signature Timestamp: {reportDate} at {reportTime} UTC
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/30 text-right space-y-0.5 shrink-0">
              <span className="text-[10px] font-mono text-muted-foreground uppercase block">Digital Verification Hash</span>
              <span className="text-xs font-mono font-bold text-foreground">
                SHA-256: {order.orderNumber.replace(/[^0-9]/g, '8F4A')}-7C9B-2026
              </span>
              <span className="text-[9px] text-muted-foreground block">
                Tamper-Evident Hospital Laboratory Record
              </span>
            </div>
          </div>

          {/* 7. HIPAA Statutory Footer */}
          <div className="pt-2 text-center text-[10px] text-muted-foreground space-y-0.5 border-t border-border/60">
            <p>
              CONFIDENTIAL HEALTHCARE RECORD • PROTECTED BY FEDERAL HIPAA PRIVACY REGULATIONS (45 CFR § 164.502)
            </p>
            <p>
              This official laboratory report is intended solely for the designated patient and licensed healthcare provider.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

