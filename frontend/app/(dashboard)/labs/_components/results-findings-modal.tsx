'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Beaker,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertTriangle,
  Stethoscope,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { LabOrder } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export interface ResultsFindingsModalProps {
  order: LabOrder | null;
  onClose: () => void;
  onVerify?: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  onReview?: (orderId: string, notes: string) => Promise<{ success: boolean; error?: string }>;
}

export function ResultsFindingsModal({
  order,
  onClose,
  onVerify,
  onReview,
}: ResultsFindingsModalProps) {
  const [reviewNotes, setReviewNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!order) return null;

  const results = order.results || [];
  const hasAbnormal = results.some((r) => r.isAbnormal || r.isPanicValue);
  const isVerified = order.status === 'VERIFIED' || order.status === 'REVIEWED' || order.status === 'COMPLETED';
  const isReviewed = order.status === 'REVIEWED' || order.status === 'COMPLETED';

  const handleVerify = async () => {
    if (!onVerify) return;
    setIsVerifying(true);
    setFeedbackMessage(null);
    try {
      const res = await onVerify(order.id);
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: 'Laboratory findings verified and released.' });
      } else {
        setFeedbackMessage({ type: 'error', text: res.error || 'Failed to verify findings.' });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReview = async () => {
    if (!onReview) return;
    if (!reviewNotes.trim()) {
      setFeedbackMessage({ type: 'error', text: 'Physician review notes are required to sign off.' });
      return;
    }
    setIsReviewing(true);
    setFeedbackMessage(null);
    try {
      const res = await onReview(order.id, reviewNotes.trim());
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: 'Diagnostic review acknowledged by physician.' });
        setReviewNotes('');
      } else {
        setFeedbackMessage({ type: 'error', text: res.error || 'Failed to complete review.' });
      }
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-0 bg-card border-border shadow-2xl text-foreground">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                <Beaker className="size-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-base font-bold text-foreground">
                    {order.testName}
                  </DialogTitle>
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded border border-border text-foreground font-semibold">
                    {order.orderNumber}
                  </span>
                  {hasAbnormal && (
                    <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[10px]">
                      Abnormal Analytes Flagged
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {order.patientName} ({order.mrn}) • {order.testCategory}
                </DialogDescription>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-muted-foreground border border-border bg-background px-2 py-1 rounded">
                Priority: <strong className="text-foreground">{order.priority}</strong>
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-lg text-xs flex items-center gap-2 border ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <AlertCircle className="size-4 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        <div className="px-6 py-4 space-y-4 text-xs">
          {/* Clinical Encounter Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg border border-border bg-muted/20">
            <div>
              <div className="text-[10px] font-mono text-muted-foreground">Patient EHR</div>
              <div className="font-semibold text-foreground mt-0.5">{order.patientName}</div>
              <div className="font-mono text-[10px] text-muted-foreground">{order.mrn}</div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-muted-foreground">Ordering Clinician</div>
              <div className="font-semibold text-foreground mt-0.5">{order.requestedBy}</div>
              <div className="text-[10px] text-muted-foreground">General Practice</div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-muted-foreground">Requisition Date</div>
              <div className="font-semibold text-foreground mt-0.5">
                {new Date(order.requestedAt).toLocaleDateString()}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {new Date(order.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-muted-foreground">Clinical Status</div>
              <div className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                {isVerified ? (
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="size-3.5 text-amber-500" />
                )}
                <span>{order.status}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                {isVerified ? 'Quality Certified' : 'Pending Verification'}
              </div>
            </div>
          </div>

          {/* Clinical Indication If Available */}
          {order.clinicalIndication && (
            <div className="p-2.5 rounded-lg border border-border bg-muted/10">
              <span className="text-[11px] font-semibold text-muted-foreground">Clinical Indication:</span>{' '}
              <span className="text-foreground italic">{order.clinicalIndication}</span>
            </div>
          )}

          {/* Analyte Findings Table */}
          {results.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileCheck className="size-3.5 text-muted-foreground" />
                  <span>Quantitative Laboratory Findings</span>
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {results.length} Analytes Measured
                </span>
              </div>

              <div className="rounded-lg border border-border overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-2 px-3">Analyte Parameter</th>
                      <th className="py-2 px-3">Measured Value</th>
                      <th className="py-2 px-3">Standard Unit</th>
                      <th className="py-2 px-3">Reference Interval</th>
                      <th className="py-2 px-3 text-right">Clinical Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {results.map((r, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-muted/30 transition-colors ${
                          r.isPanicValue
                            ? 'bg-red-500/10 font-medium'
                            : r.isAbnormal
                            ? 'bg-amber-500/5'
                            : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-foreground">{r.parameter}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          <span
                            className={
                              r.isPanicValue
                                ? 'text-red-600 dark:text-red-400'
                                : r.isAbnormal
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-foreground'
                            }
                          >
                            {r.value}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">{r.unit}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">{r.referenceRange}</td>
                        <td className="py-2.5 px-3 text-right">
                          {r.isPanicValue ? (
                            <Badge variant="outline" className="border-red-500/50 bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-[10px] py-0 px-1.5 uppercase">
                              Critical Panic
                            </Badge>
                          ) : r.isAbnormal ? (
                            <Badge variant="outline" className="border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold text-[10px] py-0 px-1.5 uppercase">
                              Abnormal
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] py-0 px-1.5 uppercase">
                              Normal
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center border-2 border-dashed border-border rounded-xl">
              <Clock className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <div className="text-sm font-semibold text-foreground">Awaiting Laboratory Analysis</div>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Specimen has been barcoded and accessioned. Findings will be populated once the diagnostic analyzer run completes.
              </p>
            </div>
          )}

          {/* Narrative Summary */}
          {order.resultSummary && (
            <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-1">
              <div className="text-[11px] font-semibold text-foreground">Diagnostic Impression / Summary:</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{order.resultSummary}</p>
            </div>
          )}

          {/* Laboratory Quality Verification & Supervisor Sign-Off */}
          <div className="p-3 rounded-lg border border-border bg-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Laboratory Quality Assurance & Supervisor Sign-Off</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">CLIA / CAP Compliant</span>
            </div>

            {order.verifiedBy ? (
              <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border/50">
                <div>
                  <span className="text-foreground font-semibold">Certified by:</span> {order.verifiedBy}
                </div>
                {order.verifiedAt && (
                  <div className="font-mono text-[10px]">
                    Signed: {new Date(order.verifiedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ) : order.status === 'RESULTED' ? (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-2.5 rounded text-amber-800 dark:text-amber-300">
                <span className="text-xs">Results entered. Awaiting Senior Laboratory Specialist verification sign-off.</span>
                <Button
                  size="sm"
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  {isVerifying && <Loader2 className="size-3 animate-spin mr-1" />}
                  Verify & Sign Off
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Specimen undergoing analysis. Verification is enabled once values are entered.
              </p>
            )}
          </div>

          {/* Attending Physician Clinical Review & Close-the-Loop */}
          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Stethoscope className="size-4 text-primary" />
                <span>Attending Physician Clinical Review & Loop Closure</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">EHR Encounter</span>
            </div>

            {order.reviewedBy ? (
              <div className="space-y-1.5 bg-card p-2.5 rounded border border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Reviewed & Acknowledged by: {order.reviewedBy}</span>
                  {order.reviewedAt && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(order.reviewedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                {order.physicianReviewNotes && (
                  <p className="text-xs text-muted-foreground italic">&ldquo;{order.physicianReviewNotes}&rdquo;</p>
                )}
              </div>
            ) : isVerified ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Document clinical review notes and treatment plan adjustments:
                </p>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Findings reviewed. Elevated LDL noted; prescribe atorvastatin 20mg daily and book follow-up consult in 3 months..."
                  className="text-xs min-h-[60px] bg-background border-border text-foreground"
                />
                <div className="flex items-center justify-between pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="h-8 text-xs gap-1.5 border-border cursor-pointer"
                  >
                    <Link href={`/appointments?patientId=${order.patientId}`}>
                      <Calendar className="size-3.5 text-primary" />
                      <span>Schedule Follow-up Visit</span>
                      <ChevronRight className="size-3 text-muted-foreground" />
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleReview}
                    disabled={isReviewing}
                    className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs font-medium"
                  >
                    {isReviewing && <Loader2 className="size-3 animate-spin mr-1" />}
                    Acknowledge & Sign Review
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Physician review opens once findings are verified by the laboratory team.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3 border-t border-border bg-card flex items-center justify-between sm:justify-between">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
            CareSync HIPAA-Compliant Diagnostic Protocol
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8.5 text-xs cursor-pointer"
          >
            Close Findings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
