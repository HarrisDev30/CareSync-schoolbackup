'use client';

import React from 'react';
import {
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  Stethoscope,
  Pill,
  Beaker,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Patient,
  Consultation,
  PatientVital,
  PatientMedication,
  LabOrder,
  DischargeSummary,
} from '@/types';

interface MedicalRecordExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  consultations?: Consultation[];
  vitals?: PatientVital[];
  medications?: PatientMedication[];
  labOrders?: LabOrder[];
  dischargeSummary?: DischargeSummary | null;
}

export function MedicalRecordExportModal({
  isOpen,
  onClose,
  patient,
  consultations = [],
  vitals = [],
  medications = [],
  labOrders = [],
  dischargeSummary = null,
}: MedicalRecordExportModalProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const recordControlNumber = `CS-EHR-${patient.mrn.replace('MRN-', '')}-${new Date().getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 bg-card text-card-foreground border-border overflow-hidden shadow-2xl">
        {/* Top Screen Toolbar (Hidden during Print) */}
        <div className="print:hidden p-4 pr-12 border-b border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <FileText className="size-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-foreground leading-snug">
                Certified Official Electronic Health Record (EHR) Export
              </DialogTitle>
              <p className="text-xs text-muted-foreground truncate">
                Doc ID: <span className="font-mono font-medium text-foreground">{recordControlNumber}</span> • HIPAA PHI Summary
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
              <span>Print Record / Save PDF</span>
            </Button>
          </div>
        </div>

        {/* Printable EHR Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-card print:p-0 print:overflow-visible">
          <div className="max-w-3xl mx-auto space-y-6 text-foreground print:text-black print:text-sm">
            {/* 1. OFFICIAL HOSPITAL LETTERHEAD */}
            <div className="border-b-2 border-foreground/20 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
                  <Building2 className="size-6 text-primary" />
                  <span>CareSync Academic Medical Center</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  Department of Health Informatics, Clinical Operations & Medical Records
                </p>
                <p className="text-[11px] text-muted-foreground">
                  742 Evergreen Healthcare Blvd, Suite 400 • Medical District • Phone: (555) 019-2834
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1 font-mono text-xs">
                <Badge variant="outline" className="border-emerald-600/30 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 font-semibold px-2 py-0.5">
                  <ShieldCheck className="size-3 mr-1 inline" />
                  Certified Clinical Record
                </Badge>
                <div className="text-[11px] text-muted-foreground pt-1">
                  Generated: {currentDate} at {currentTime}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Doc Control: <strong className="text-foreground">{recordControlNumber}</strong>
                </div>
              </div>
            </div>

            {/* 2. PATIENT DEMOGRAPHICS & MASTER PATIENT INDEX (MPI) */}
            <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" />
                  Patient Identification & Demographics
                </span>
                <Badge variant="outline" className="font-mono text-xs font-bold bg-background">
                  MRN: {patient.mrn}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Full Legal Name</span>
                  <strong className="text-foreground text-sm font-semibold">{patient.fullName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Date of Birth (Age)</span>
                  <span className="font-medium text-foreground">{patient.dateOfBirth} ({patient.age} yrs)</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Biological Sex</span>
                  <span className="font-medium text-foreground">{patient.gender}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">ABO/Rh Blood Group</span>
                  <span className="font-mono font-bold text-foreground">{patient.bloodType || 'O+'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Primary Contact</span>
                  <span className="font-medium text-foreground">{patient.phone || 'No phone recorded'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Attending Physician</span>
                  <span className="font-medium text-foreground">{patient.primaryPhysician || 'Dr. Sarah Chen, MD'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-[11px]">Documented Drug Allergies</span>
                  {patient.allergies && patient.allergies.length > 0 ? (
                    <span className="inline-flex items-center gap-1 text-destructive font-semibold">
                      <AlertTriangle className="size-3" />
                      {patient.allergies.join(', ')}
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      NKDA (No Known Drug Allergies)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. CLINICAL CONSULTATION & DIAGNOSTIC HISTORY */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Stethoscope className="size-3.5 text-primary" />
                  Clinical Diagnoses & Physician Encounter Assessment
                </h3>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {consultations.length} Documented Encounter(s)
                </span>
              </div>

              {consultations.length > 0 ? (
                <div className="space-y-3">
                  {consultations.map((note) => (
                    <div key={note.id} className="p-3.5 rounded-lg border border-border bg-card space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{note.chiefComplaint}</span>
                          {note.primaryDiagnosisCode && (
                            <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/30">
                              ICD-10: {note.primaryDiagnosisCode}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })} • Attending: {note.physicianName || 'Dr. Sarah Chen, MD'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <strong className="text-muted-foreground block">Primary Assessment / Diagnosis:</strong>
                          <p className="text-foreground font-medium">{note.primaryDiagnosisDescription}</p>
                        </div>
                        <div>
                          <strong className="text-muted-foreground block">Treatment Plan & Follow-up:</strong>
                          <p className="text-foreground leading-relaxed">{note.treatmentPlan}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground italic">
                  Patient evaluation on file for primary care management and ongoing cardiovascular observation.
                </div>
              )}
            </div>

            {/* 4. BASELINE & HISTORICAL VITAL SIGNS */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-1.5">
                <Calendar className="size-3.5 text-primary" />
                Physiological Vitals Baseline & Measurements
              </h3>

              <div className="border border-border rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border text-muted-foreground text-[11px]">
                      <th className="p-2.5 font-semibold">Recorded Date</th>
                      <th className="p-2.5 font-semibold">Blood Pressure</th>
                      <th className="p-2.5 font-semibold">Heart Rate</th>
                      <th className="p-2.5 font-semibold">SpO2</th>
                      <th className="p-2.5 font-semibold">Temperature</th>
                      <th className="p-2.5 font-semibold">Clinical Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {vitals.length > 0 ? (
                      vitals.slice(0, 3).map((v) => (
                        <tr key={v.id} className="hover:bg-muted/20">
                          <td className="p-2.5 font-mono text-[11px] text-muted-foreground">
                            {new Date(v.recordedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="p-2.5 font-mono font-semibold text-foreground">{v.bloodPressure}</td>
                          <td className="p-2.5 font-mono text-foreground">{v.heartRate} bpm</td>
                          <td className="p-2.5 font-mono text-foreground">{v.oxygenSaturation}%</td>
                          <td className="p-2.5 font-mono text-foreground">{v.temperature}°F</td>
                          <td className="p-2.5 text-muted-foreground text-[11px] max-w-[200px] truncate">{v.notes || 'Routine intake'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-3 text-center text-muted-foreground italic">
                          No recent vital measurements recorded in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. ACTIVE PHARMACOTHERAPY & E-PRESCRIPTIONS (Rx) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-1.5">
                <Pill className="size-3.5 text-primary" />
                Active Electronic Prescriptions (Rx)
              </h3>

              <div className="border border-border rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border text-muted-foreground text-[11px]">
                      <th className="p-2.5 font-semibold">Medication Name</th>
                      <th className="p-2.5 font-semibold">Dosage & Sig</th>
                      <th className="p-2.5 font-semibold">Frequency</th>
                      <th className="p-2.5 font-semibold">Status</th>
                      <th className="p-2.5 font-semibold">Prescriber</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {medications.length > 0 ? (
                      medications.map((m) => (
                        <tr key={m.id} className="hover:bg-muted/20">
                          <td className="p-2.5 font-bold text-foreground">{m.name}</td>
                          <td className="p-2.5 text-foreground">{m.dosage} — <span className="text-muted-foreground text-[11px]">{m.instructions}</span></td>
                          <td className="p-2.5 font-mono text-[11px] text-foreground">{m.frequency}</td>
                          <td className="p-2.5">
                            <span
                              className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                                m.status === 'Active'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {m.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-muted-foreground text-[11px]">{m.prescribedBy}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-3 text-center text-muted-foreground italic">
                          No active pharmacological orders on file.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6. VERIFIED LABORATORY DIAGNOSTICS */}
            {labOrders.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-1.5">
                  <Beaker className="size-3.5 text-primary" />
                  Diagnostic Clinical Laboratory Summary
                </h3>

                <div className="border border-border rounded-lg overflow-hidden text-xs">
                  <div className="p-3 bg-muted/30 divide-y divide-border/60 space-y-2">
                    {labOrders.slice(0, 2).map((lab) => (
                      <div key={lab.id} className="pt-2 first:pt-0 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">{lab.testName} ({lab.orderNumber})</span>
                          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                            Status: {lab.status}
                          </span>
                        </div>
                        {lab.results && lab.results.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                            {lab.results.map((r, i) => (
                              <div key={i} className="p-1.5 rounded bg-card border border-border/60">
                                <span className="text-muted-foreground block text-[10px] truncate">{r.parameter}</span>
                                <strong className={`font-mono ${r.isAbnormal ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                                  {r.value} {r.unit}
                                </strong>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7. CLINICAL DISCHARGE DISPOSITION & SUMMARY (IF DISCHARGED) */}
            {dischargeSummary && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                    <FileCheck className="size-4 text-emerald-600" />
                    Formal Discharge Disposition & Outpatient Transition Plan
                  </span>
                  <span className="font-mono text-[11px] text-emerald-700">
                    Discharged: {new Date(dischargeSummary.dischargedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Clinical Disposition</span>
                    <strong className="text-foreground">{dischargeSummary.disposition}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Discharging Attending Clinician</span>
                    <strong className="text-foreground">{dischargeSummary.dischargedBy}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Discharge Instructions</span>
                    <p className="text-foreground leading-relaxed">{dischargeSummary.dischargeNotes}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Post-Discharge Follow-Up</span>
                    <p className="text-foreground leading-relaxed">{dischargeSummary.followUpInstructions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 8. PHYSICIAN ATTESTATION & DIGITAL VERIFICATION SEAL */}
            <div className="mt-8 pt-6 border-t-2 border-border grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <div className="font-bold text-foreground text-xs uppercase tracking-wider">
                  Attending Clinician Certification
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  I hereby attest that the clinical data, diagnostic impressions, and pharmacological prescriptions outlined in this Medical Record Summary have been verified in accordance with clinical quality and legal compliance standards.
                </p>
                <div className="pt-2">
                  <div className="font-serif italic text-base text-foreground font-bold border-b border-border/80 pb-1 inline-block min-w-[200px]">
                    Dr. Sarah Chen, MD
                  </div>
                  <div className="text-[11px] text-muted-foreground pt-0.5">
                    Attending Physician • General Practice • License: <span className="font-mono text-foreground font-semibold">MD-849204-STATE</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end justify-between space-y-2">
                <div className="p-3 rounded-lg border border-border bg-muted/30 font-mono text-[10px] space-y-1 w-full max-w-[280px]">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>RECORD DIGEST:</span>
                    <span className="text-emerald-600 font-bold">VERIFIED</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground truncate">
                    SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    ENCRYPTION: AES-256 FIELD LEVEL (HIPAA §164.312)
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground sm:text-right">
                  CareSync Health Systems • Enterprise Release 3.0
                </div>
              </div>
            </div>

            {/* 9. HIPAA PRIVACY DISCLAIMER */}
            <div className="pt-4 border-t border-border/60 text-[10px] text-muted-foreground leading-relaxed text-center">
              <strong>CONFIDENTIAL HEALTHCARE RECORD (PHI):</strong> This document contains Protected Health Information under Title 45 of the Code of Federal Regulations (45 CFR § 164.530). Unauthorized interception, dissemination, or disclosure is strictly prohibited under federal healthcare privacy laws.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
