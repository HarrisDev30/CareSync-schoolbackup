'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Printer,
  Phone,
  User,
  FileText,
  ShieldCheck,
  Stethoscope,
  Activity,
  CheckCircle2,
  Clock,
  Save,
  FileSignature,
  History,
  Heart,
  Thermometer,
  Wind,
  Scale,
  Sparkles,
  Plus,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  Patient,
  Consultation,
  VitalSigns,
  CreateConsultationInput,
} from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PHYSICIAN_PRESETS,
  ELEANOR_VITALS,
  fetchConsultations,
  createConsultation,
  finalizeConsultation,
} from '@/lib/api';

interface PatientChartModalProps {
  patient: Patient | null;
  onClose: () => void;
  onConsultationSaved?: () => void;
}

// ICD-10 High-Frequency Quick Presets
const ICD10_PRESETS = [
  { code: 'I10', label: 'Essential HTN', desc: 'Essential (Primary) Hypertension' },
  { code: 'E11.9', label: 'Type 2 Diabetes', desc: 'Type 2 Diabetes Mellitus without complications' },
  { code: 'J20.9', label: 'Acute Bronchitis', desc: 'Acute Bronchitis, unspecified' },
  { code: 'R07.9', label: 'Chest Pain', desc: 'Chest Pain, unspecified' },
  { code: 'M54.5', label: 'Low Back Pain', desc: 'Low Back Pain, unspecified' },
  { code: 'J06.9', label: 'Acute URI', desc: 'Acute Upper Respiratory Infection, unspecified' },
  { code: 'K21.9', label: 'GERD', desc: 'Gastro-esophageal Reflux Disease without esophagitis' },
];

// Clinical Evaluation Helpers
function evaluateBloodPressure(sys?: number, dia?: number) {
  if (!sys || !dia) {
    return {
      label: 'Pending Reading',
      category: 'unknown',
      badgeClass: 'bg-muted text-muted-foreground border-border',
      recommendation: 'Enter systolic and diastolic values to evaluate clinical tier.',
    };
  }
  if (sys > 180 || dia > 120) {
    return {
      label: 'Hypertensive Crisis Alert',
      category: 'crisis',
      badgeClass: 'bg-destructive/10 text-destructive border-destructive/30 animate-pulse',
      recommendation: 'Emergency protocol: Systolic > 180 or Diastolic > 120. Immediate intervention required.',
    };
  }
  if (sys >= 140 || dia >= 90) {
    return {
      label: 'Stage 2 Hypertension',
      category: 'stage2',
      badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      recommendation: 'AHA Stage 2: SBP ≥140 or DBP ≥90 mmHg. Reassess pharmacological therapy.',
    };
  }
  if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
    return {
      label: 'Stage 1 Hypertension',
      category: 'stage1',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      recommendation: 'AHA Stage 1: SBP 130-139 or DBP 80-89 mmHg. Recommend lifestyle modifications.',
    };
  }
  if (sys >= 120 && sys <= 129 && dia < 80) {
    return {
      label: 'Elevated BP',
      category: 'elevated',
      badgeClass: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
      recommendation: 'AHA Elevated: SBP 120-129 and DBP <80 mmHg. Schedule 3-month review.',
    };
  }
  if (sys < 90 || dia < 60) {
    return {
      label: 'Hypotension',
      category: 'hypotension',
      badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      recommendation: 'SBP < 90 or DBP < 60 mmHg. Check hydration, orthostatic signs, and medications.',
    };
  }
  return {
    label: 'Normal Blood Pressure',
    category: 'normal',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    recommendation: 'AHA Optimal: SBP <120 and DBP <80 mmHg. Within healthy cardiovascular parameters.',
  };
}

function evaluateHeartRate(hr?: number) {
  if (!hr) return { label: 'Unrecorded', badgeClass: 'bg-muted text-muted-foreground border-border' };
  if (hr < 60) return { label: 'Bradycardia (<60 bpm)', badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' };
  if (hr > 100) return { label: 'Tachycardia (>100 bpm)', badgeClass: 'bg-rose-500/10 text-rose-600 border-rose-500/30' };
  return { label: 'Normal (60–100 bpm)', badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' };
}

function evaluateSpO2(spo2?: number) {
  if (!spo2) return { label: 'Unrecorded', badgeClass: 'bg-muted text-muted-foreground border-border' };
  if (spo2 < 90) return { label: 'Severe Hypoxemia (≤90%)', badgeClass: 'bg-destructive/10 text-destructive border-destructive/30 animate-pulse' };
  if (spo2 < 95) return { label: 'Mild Hypoxia (91–94%)', badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' };
  return { label: 'Optimal Saturation (≥95%)', badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' };
}

function evaluateTemperature(celsius?: number) {
  if (!celsius) return { label: 'Unrecorded', badgeClass: 'bg-muted text-muted-foreground border-border' };
  if (celsius >= 38.0) return { label: 'Pyrexia / Fever (≥38.0°C)', badgeClass: 'bg-rose-500/10 text-rose-600 border-rose-500/30' };
  if (celsius >= 37.3) return { label: 'Low-Grade Temp (37.3–37.9°C)', badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' };
  if (celsius < 35.5) return { label: 'Hypothermia (<35.5°C)', badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' };
  return { label: 'Normothermic (36.0–37.2°C)', badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' };
}

export function PatientChartModal({
  patient,
  onClose,
  onConsultationSaved,
}: PatientChartModalProps) {
  // Tabs & Navigation
  const [activeTab, setActiveTab] = useState<'history' | 'soap' | 'vitals' | 'demographics'>('history');

  // Consultations State
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New SOAP Encounter Form State
  const [attendingPhysician, setAttendingPhysician] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [hpi, setHpi] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [primaryDiagnosisDescription, setPrimaryDiagnosisDescription] = useState('');
  const [primaryDiagnosisCode, setPrimaryDiagnosisCode] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');

  // Live Vitals Intake State
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [heartRate, setHeartRate] = useState('72');
  const [oxygenSaturation, setOxygenSaturation] = useState('98');
  const [temperature, setTemperature] = useState('36.8');
  const [respiratoryRate, setRespiratoryRate] = useState('16');
  const [weightKg, setWeightKg] = useState('68.5');

  // Load consultations when patient opens
  useEffect(() => {
    if (!patient) return;

    setAttendingPhysician(patient.primaryPhysician || PHYSICIAN_PRESETS[0]?.name || 'Dr. Sarah Chen, MD');

    setIsLoadingNotes(true);
    fetchConsultations(patient.id)
      .then((notes) => {
        // Match by patient ID, MRN, or known Eleanor presets
        const filtered = notes.filter(
          (n) =>
            n.patientId === patient.id ||
            n.patientId === patient.mrn ||
            (patient.fullName.includes('Eleanor') && (n.patientId === 'p-1' || n.patientId === 'MRN-90214')),
        );
        setConsultations(filtered);
      })
      .catch(() => {
        // Fallback to empty
      })
      .finally(() => {
        setIsLoadingNotes(false);
      });
  }, [patient]);

  if (!patient) return null;

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => {
      setNotice(null);
    }, 4500);
  };

  const currentVitalSigns: VitalSigns = {
    bloodPressureSystolic: systolic ? parseInt(systolic, 10) : undefined,
    bloodPressureDiastolic: diastolic ? parseInt(diastolic, 10) : undefined,
    heartRate: heartRate ? parseInt(heartRate, 10) : undefined,
    oxygenSaturation: oxygenSaturation ? parseInt(oxygenSaturation, 10) : undefined,
    temperatureCelsius: temperature ? parseFloat(temperature) : undefined,
    respiratoryRate: respiratoryRate ? parseInt(respiratoryRate, 10) : undefined,
    weightKg: weightKg ? parseFloat(weightKg) : undefined,
    recordedAt: new Date().toISOString(),
  };

  const bpEval = evaluateBloodPressure(
    currentVitalSigns.bloodPressureSystolic,
    currentVitalSigns.bloodPressureDiastolic,
  );
  const hrEval = evaluateHeartRate(currentVitalSigns.heartRate);
  const spo2Eval = evaluateSpO2(currentVitalSigns.oxygenSaturation);
  const tempEval = evaluateTemperature(currentVitalSigns.temperatureCelsius);

  // Submit or Draft New SOAP Note
  const handleSaveConsultation = async (targetStatus: 'DRAFT' | 'FINALIZED') => {
    if (!chiefComplaint.trim()) {
      showNotice('error', 'Chief Complaint (Subjective) is required.');
      return;
    }
    if (!primaryDiagnosisDescription.trim()) {
      showNotice('error', 'Primary Diagnosis (Assessment) is required.');
      return;
    }
    if (!treatmentPlan.trim()) {
      showNotice('error', 'Treatment Plan & Prescriptions (Plan) are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const combinedExam = [
        physicalExam.trim(),
        hpi.trim() ? `History of Present Illness (HPI): ${hpi.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const input: CreateConsultationInput = {
        patientId: patient.id,
        physicianName: attendingPhysician,
        chiefComplaint: chiefComplaint.trim(),
        physicalExamination: combinedExam || 'Normal outpatient physical examination.',
        primaryDiagnosisDescription: primaryDiagnosisDescription.trim(),
        primaryDiagnosisCode: primaryDiagnosisCode.trim() || undefined,
        treatmentPlan: treatmentPlan.trim(),
        vitalSigns: currentVitalSigns,
        status: targetStatus,
      };

      const res = await createConsultation(input);
      if (res.success && res.data) {
        let savedNote = res.data;
        if (targetStatus === 'FINALIZED' && savedNote.status !== 'FINALIZED') {
          const finalRes = await finalizeConsultation(savedNote.id);
          if (finalRes.data) {
            savedNote = finalRes.data;
          }
        }

        setConsultations((prev) => [savedNote, ...prev.filter((c) => c.id !== savedNote.id)]);
        showNotice(
          'success',
          targetStatus === 'FINALIZED'
            ? `Consultation note signed & finalized into EHR with timestamp verification.`
            : `Consultation note saved as unsigned draft.`,
        );

        // Reset form
        setChiefComplaint('');
        setHpi('');
        setPhysicalExam('');
        setPrimaryDiagnosisDescription('');
        setPrimaryDiagnosisCode('');
        setTreatmentPlan('');

        onConsultationSaved?.();
        setActiveTab('history');
      } else {
        showNotice('error', res.error || 'Failed to persist consultation encounter.');
      }
    } catch (err: any) {
      showNotice('error', err?.message || 'Encounter submission error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Finalize an existing draft note
  const handleFinalizeExistingNote = async (noteId: string) => {
    setIsSubmitting(true);
    try {
      const res = await finalizeConsultation(noteId);
      if (res.success && res.data) {
        setConsultations((prev) =>
          prev.map((c) => (c.id === noteId ? res.data! : c)),
        );
        showNotice('success', `Draft consultation note successfully signed & finalized.`);
        onConsultationSaved?.();
      } else {
        showNotice('error', 'Could not finalize consultation record.');
      }
    } catch (err: any) {
      showNotice('error', err?.message || 'Error finalizing record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPreset = (preset: (typeof ICD10_PRESETS)[0]) => {
    setPrimaryDiagnosisCode(preset.code);
    setPrimaryDiagnosisDescription(preset.desc);
  };

  const initials = patient.fullName
    ? patient.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'PT';

  const historyVitals = patient.fullName.includes('Eleanor') ? ELEANOR_VITALS : [];

  return (
    <Dialog open={!!patient} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 bg-card text-card-foreground border-border overflow-hidden shadow-2xl">
        {/* 1. COMPREHENSIVE PATIENT BANNER HEADER */}
        <div className="p-5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar className="h-12 w-12 text-sm font-semibold text-muted-foreground bg-muted border border-border shrink-0 shadow-xs">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
                    {patient.fullName}
                  </DialogTitle>
                  <Badge variant="outline" className="font-mono text-xs text-muted-foreground bg-background border-border">
                    {patient.mrn}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs font-mono font-medium ${
                      patient.status === 'In Consult'
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : patient.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {patient.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span>
                    {patient.gender} • {patient.age} yrs • DOB: {patient.dateOfBirth} • Blood Group: <strong className="font-mono text-foreground">{patient.bloodType || 'Unspecified'}</strong>
                  </span>
                  <span className="text-border">|</span>
                  <span className="inline-flex items-center gap-1 font-mono text-foreground">
                    <Phone className="size-3 text-muted-foreground" />
                    <span>{patient.phone || 'No phone recorded'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="h-8 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground border-border"
                title="Print EHR Clinical Summary"
              >
                <Printer className="size-3.5" />
                <span className="hidden sm:inline">Print Record</span>
              </Button>
            </div>
          </div>

          {/* Clinical Banner Sub-Strip */}
          <div className="mt-3.5 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Stethoscope className="size-3.5 text-primary" />
              <span>Attending:</span>
              <strong className="text-foreground font-medium">{patient.primaryPhysician || attendingPhysician}</strong>
            </div>

            {/* Allergies Pill */}
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-medium">
                <AlertTriangle className="size-3 shrink-0" />
                <span>Allergies: {patient.allergies.join(', ')}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="size-3 shrink-0" />
                <span>NKDA (No Known Drug Allergies)</span>
              </div>
            )}
          </div>
        </div>

        {/* Global Feedback Banner */}
        {notice && (
          <div
            className={`px-5 py-2.5 border-b text-xs font-medium flex items-center justify-between transition-all shrink-0 ${
              notice.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}
          >
            <div className="flex items-center gap-2">
              {notice.type === 'success' ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <AlertTriangle className="size-4 shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-muted-foreground hover:text-foreground text-xs p-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2. TABBED CLINICAL WORKSTATION */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-5 pt-3 pb-2 border-b border-border bg-card shrink-0">
            <TabsList className="grid grid-cols-4 w-full h-10 bg-muted p-1 border border-border">
              <TabsTrigger value="history" className="text-xs font-medium gap-1.5 cursor-pointer">
                <History className="size-3.5" />
                <span className="hidden sm:inline">Clinical Notes</span>
                <span className="sm:hidden">Notes</span>
                {consultations.length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-mono ml-0.5">
                    {consultations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="soap" className="text-xs font-medium gap-1.5 cursor-pointer">
                <FileSignature className="size-3.5" />
                <span className="hidden sm:inline">New SOAP Encounter</span>
                <span className="sm:hidden">New SOAP</span>
              </TabsTrigger>
              <TabsTrigger value="vitals" className="text-xs font-medium gap-1.5 cursor-pointer">
                <Activity className="size-3.5 text-primary" />
                <span className="hidden sm:inline">Live Vitals Intake</span>
                <span className="sm:hidden">Vitals</span>
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              </TabsTrigger>
              <TabsTrigger value="demographics" className="text-xs font-medium gap-1.5 cursor-pointer">
                <User className="size-3.5" />
                <span className="hidden sm:inline">Demographics & MPI</span>
                <span className="sm:hidden">MPI</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {/* ======================================================== */}
            {/* TAB 1: CLINICAL HISTORY & SIGNED SOAP NOTES */}
            {/* ======================================================== */}
            <TabsContent value="history" className="mt-0 space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Historical Consultation Records
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Legally signed clinical progress notes, diagnoses, and medical treatment plans.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setActiveTab('soap')}
                  className="h-8 text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="size-3.5" />
                  <span>Start New SOAP Note</span>
                </Button>
              </div>

              {isLoadingNotes ? (
                <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">
                  Loading chronological clinical notes...
                </div>
              ) : consultations.length === 0 ? (
                <div className="p-10 border border-dashed border-border rounded-xl text-center space-y-3 bg-muted/20">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <FileText className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      No clinical notes recorded yet
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      There are no signed or draft clinical encounters on file for {patient.fullName}.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('soap')}
                    className="h-8 text-xs gap-1.5 cursor-pointer"
                  >
                    <FileSignature className="size-3.5" />
                    <span>Create Initial SOAP Note</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations.map((note) => {
                    const isFinalized = note.status === 'FINALIZED';
                    const noteDate = note.createdAt
                      ? new Date(note.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Clinical Record';

                    return (
                      <div
                        key={note.id}
                        className="border border-border rounded-xl p-4 bg-card shadow-xs space-y-3.5 transition-all hover:border-border/80"
                      >
                        {/* Note Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">
                                {note.chiefComplaint}
                              </span>
                              {note.primaryDiagnosisCode && (
                                <Badge variant="outline" className="font-mono text-xs bg-muted text-foreground border-border">
                                  {note.primaryDiagnosisCode}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Stethoscope className="size-3 text-muted-foreground" />
                              <span>{note.physicianName || 'Dr. Sarah Chen, MD'}</span>
                              <span>•</span>
                              <Clock className="size-3 text-muted-foreground" />
                              <span className="font-mono">{noteDate}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isFinalized ? (
                              <Badge
                                variant="outline"
                                className="gap-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              >
                                <ShieldCheck className="size-3.5" />
                                <span>Signed & Finalized</span>
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="gap-1.5 text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                >
                                  <Clock className="size-3.5" />
                                  <span>Draft (Unsigned)</span>
                                </Badge>
                                <Button
                                  size="sm"
                                  disabled={isSubmitting}
                                  onClick={() => handleFinalizeExistingNote(note.id)}
                                  className="h-7 px-2.5 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                >
                                  <ShieldCheck className="size-3" />
                                  <span>Finalize</span>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* SOAP Body */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* S: Subjective */}
                          <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                            <span className="font-semibold text-foreground tracking-wider uppercase text-[11px] flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-primary" />
                              S — Subjective
                            </span>
                            <p className="text-muted-foreground leading-relaxed">
                              {note.chiefComplaint}
                            </p>
                          </div>

                          {/* O: Objective */}
                          <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
                            <span className="font-semibold text-foreground tracking-wider uppercase text-[11px] flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-primary" />
                              O — Objective & Vitals
                            </span>
                            <p className="text-muted-foreground leading-relaxed">
                              {note.physicalExamination || 'Normal physical findings on examination.'}
                            </p>
                            {note.vitalSigns && (
                              <div className="pt-2 border-t border-border flex flex-wrap gap-2 text-[11px] font-mono">
                                {note.vitalSigns.bloodPressureSystolic && (
                                  <span className="px-1.5 py-0.5 rounded bg-background border border-border text-foreground">
                                    BP: {note.vitalSigns.bloodPressureSystolic}/{note.vitalSigns.bloodPressureDiastolic} mmHg
                                  </span>
                                )}
                                {note.vitalSigns.heartRate && (
                                  <span className="px-1.5 py-0.5 rounded bg-background border border-border text-foreground">
                                    HR: {note.vitalSigns.heartRate} bpm
                                  </span>
                                )}
                                {note.vitalSigns.oxygenSaturation && (
                                  <span className="px-1.5 py-0.5 rounded bg-background border border-border text-foreground">
                                    SpO2: {note.vitalSigns.oxygenSaturation}%
                                  </span>
                                )}
                                {note.vitalSigns.temperatureCelsius && (
                                  <span className="px-1.5 py-0.5 rounded bg-background border border-border text-foreground">
                                    Temp: {note.vitalSigns.temperatureCelsius}°C
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* A: Assessment */}
                          <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                            <span className="font-semibold text-foreground tracking-wider uppercase text-[11px] flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-primary" />
                              A — Clinical Assessment
                            </span>
                            <p className="text-foreground font-medium leading-relaxed">
                              {note.primaryDiagnosisDescription}
                              {note.primaryDiagnosisCode && (
                                <span className="text-muted-foreground font-mono ml-1.5">
                                  ({note.primaryDiagnosisCode})
                                </span>
                              )}
                            </p>
                          </div>

                          {/* P: Plan */}
                          <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                            <span className="font-semibold text-foreground tracking-wider uppercase text-[11px] flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-primary" />
                              P — Treatment Plan & Rx
                            </span>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {note.treatmentPlan}
                            </p>
                          </div>
                        </div>

                        {/* Note Metadata Footer */}
                        <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50">
                          <span className="font-mono">Record ID: {note.id}</span>
                          {note.finalizedAt && (
                            <span className="font-mono">
                              Signed: {new Date(note.finalizedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ======================================================== */}
            {/* TAB 2: NEW CLINICAL SOAP ENCOUNTER (ENTRY FORM) */}
            {/* ======================================================== */}
            <TabsContent value="soap" className="mt-0 space-y-4">
              {/* Physician & Setting Selector */}
              <div className="p-3.5 bg-muted/30 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Stethoscope className="size-4" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground block">Attending Physician of Record:</span>
                    <span className="text-muted-foreground">Legal digital signature credential for SOAP encounter</span>
                  </div>
                </div>

                <div className="w-full sm:w-60 shrink-0">
                  <Select
                    value={attendingPhysician}
                    onValueChange={setAttendingPhysician}
                  >
                    <SelectTrigger className="h-8 text-xs border-border bg-background">
                      <SelectValue placeholder="Select Physician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PHYSICIAN_PRESETS.map((p) => (
                          <SelectItem key={p.id} value={p.name} className="text-xs">
                            {p.name} ({p.department})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* S: SUBJECTIVE */}
              <div className="border border-border rounded-xl p-4 bg-card space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" />
                    <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                      S — Subjective
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Chief Complaint & Patient Narrative</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      Chief Complaint <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder="e.g. Follow-up for essential hypertension and episodic dizziness after exertion"
                      className="h-9 text-xs bg-background border-border"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      History of Present Illness (HPI) & Symptoms
                    </label>
                    <Textarea
                      value={hpi}
                      onChange={(e) => setHpi(e.target.value)}
                      rows={2}
                      placeholder="Patient reports onset 2 weeks ago, mild exertional dyspnea, compliant with morning medication..."
                      className="text-xs bg-background border-border resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* O: OBJECTIVE */}
              <div className="border border-border rounded-xl p-4 bg-card space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" />
                    <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                      O — Objective & Physical Exam
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('vitals')}
                    className="h-6 text-[11px] gap-1 text-primary hover:text-primary cursor-pointer p-0"
                  >
                    <span>Manage Vitals Intake</span>
                    <ChevronRight className="size-3" />
                  </Button>
                </div>

                {/* Vitals Snapshot Strip */}
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-foreground">Current Vitals:</span>
                    <span className="font-mono text-muted-foreground">
                      BP <strong className="text-foreground">{systolic}/{diastolic}</strong> mmHg
                    </span>
                    <span className="font-mono text-muted-foreground">
                      HR <strong className="text-foreground">{heartRate}</strong> bpm
                    </span>
                    <span className="font-mono text-muted-foreground">
                      SpO2 <strong className="text-foreground">{oxygenSaturation}</strong>%
                    </span>
                    <span className="font-mono text-muted-foreground">
                      Temp <strong className="text-foreground">{temperature}</strong>°C
                    </span>
                  </div>
                  <Badge variant="outline" className={`text-[11px] ${bpEval.badgeClass}`}>
                    {bpEval.label}
                  </Badge>
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1 text-xs">
                    Physical Examination Findings
                  </label>
                  <Textarea
                    value={physicalExam}
                    onChange={(e) => setPhysicalExam(e.target.value)}
                    rows={2}
                    placeholder="Alert, oriented x3. Cardiac exam: regular rate and rhythm without murmurs. Lungs clear to auscultation bilaterally. No peripheral edema."
                    className="text-xs bg-background border-border resize-none"
                  />
                </div>
              </div>

              {/* A: ASSESSMENT */}
              <div className="border border-border rounded-xl p-4 bg-card space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" />
                    <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                      A — Clinical Assessment & ICD-10
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Primary Diagnosis</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="font-medium text-foreground block mb-1">
                      Primary Diagnosis Description <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={primaryDiagnosisDescription}
                      onChange={(e) => setPrimaryDiagnosisDescription(e.target.value)}
                      placeholder="e.g. Essential (Primary) Hypertension"
                      className="h-9 text-xs bg-background border-border"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      ICD-10 Code
                    </label>
                    <Input
                      value={primaryDiagnosisCode}
                      onChange={(e) => setPrimaryDiagnosisCode(e.target.value)}
                      placeholder="e.g. I10"
                      className="h-9 text-xs font-mono bg-background border-border uppercase"
                    />
                  </div>
                </div>

                {/* Quick Select ICD-10 Chips */}
                <div className="pt-1 space-y-1.5">
                  <span className="text-[11px] text-muted-foreground block">
                    Quick-Select Clinical Diagnostics:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ICD10_PRESETS.map((preset) => (
                      <button
                        key={preset.code}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                          primaryDiagnosisCode === preset.code
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 hover:bg-muted text-foreground border-border'
                        }`}
                      >
                        <span className="font-mono font-bold">{preset.code}</span>
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* P: PLAN */}
              <div className="border border-border rounded-xl p-4 bg-card space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" />
                    <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                      P — Treatment Plan & Prescriptions
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Medications & Next Evaluation</span>
                </div>

                <div className="text-xs space-y-2">
                  <Textarea
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    rows={3}
                    placeholder="1. Continue Lisinopril 10mg daily in morning.&#10;2. Low-sodium DASH diet counseling provided.&#10;3. Follow-up appointment in 3 months with repeat BP check."
                    className="text-xs bg-background border-border resize-none"
                  />
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                  <span>Finalized notes are permanently locked in compliance with hospital audit policy.</span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleSaveConsultation('DRAFT')}
                    className="h-9 text-xs gap-1.5 cursor-pointer border-border"
                  >
                    <Save className="size-3.5" />
                    <span>Save Draft</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleSaveConsultation('FINALIZED')}
                    className="h-9 px-4 text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                  >
                    <ShieldCheck className="size-3.5" />
                    <span>Sign & Finalize Note</span>
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* ======================================================== */}
            {/* TAB 3: LIVE VITALS INTAKE & TRAJECTORY */}
            {/* ======================================================== */}
            <TabsContent value="vitals" className="mt-0 space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Live Vitals Intake & Clinical Evaluation
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real-time physiological parameters with instant clinical threshold alerting.
                  </p>
                </div>
                <Badge variant="outline" className={`text-xs font-medium ${bpEval.badgeClass}`}>
                  {bpEval.label}
                </Badge>
              </div>

              {/* Real-Time AHA Clinical Evaluation Banner */}
              <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-primary" />
                    <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                      Cardiovascular & Hemodynamic Evaluation
                    </span>
                  </div>
                  <Badge variant="outline" className={`text-xs font-mono font-medium ${bpEval.badgeClass}`}>
                    {bpEval.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {bpEval.recommendation}
                </p>
              </div>

              {/* Vitals Input Grid */}
              <div className="border border-border rounded-xl p-4 bg-card shadow-xs space-y-4">
                <div className="font-semibold text-xs text-foreground border-b border-border pb-2 flex items-center justify-between">
                  <span>Triage Measurement Intake</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Standard Outpatient Protocol</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                  {/* Systolic BP */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground flex items-center gap-1 font-medium">
                      <Heart className="size-3 text-rose-500" />
                      Systolic BP (mmHg)
                    </label>
                    <Input
                      type="number"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      className="h-9 font-mono text-sm bg-background border-border"
                      placeholder="120"
                    />
                  </div>

                  {/* Diastolic BP */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground flex items-center gap-1 font-medium">
                      <Heart className="size-3 text-rose-500" />
                      Diastolic BP (mmHg)
                    </label>
                    <Input
                      type="number"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      className="h-9 font-mono text-sm bg-background border-border"
                      placeholder="80"
                    />
                  </div>

                  {/* Heart Rate */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground flex items-center justify-between font-medium">
                      <span className="flex items-center gap-1">
                        <Activity className="size-3 text-primary" />
                        Heart Rate (bpm)
                      </span>
                    </label>
                    <Input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="h-9 font-mono text-sm bg-background border-border"
                      placeholder="72"
                    />
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {hrEval.label}
                    </div>
                  </div>

                  {/* SpO2 */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground flex items-center justify-between font-medium">
                      <span className="flex items-center gap-1">
                        <Wind className="size-3 text-blue-500" />
                        SpO2 Saturation (%)
                      </span>
                    </label>
                    <Input
                      type="number"
                      value={oxygenSaturation}
                      onChange={(e) => setOxygenSaturation(e.target.value)}
                      className="h-9 font-mono text-sm bg-background border-border"
                      placeholder="98"
                    />
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {spo2Eval.label}
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground flex items-center justify-between font-medium">
                      <span className="flex items-center gap-1">
                        <Thermometer className="size-3 text-amber-500" />
                        Temperature (°C)
                      </span>
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="h-9 font-mono text-sm bg-background border-border"
                      placeholder="36.8"
                    />
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {tempEval.label}
                    </div>
                  </div>

                  {/* Respiratory Rate */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground flex items-center gap-1 font-medium">
                      <Wind className="size-3 text-cyan-500" />
                      Resp Rate (/min)
                    </label>
                    <Input
                      type="number"
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(e.target.value)}
                      className="h-9 font-mono text-sm bg-background border-border"
                      placeholder="16"
                    />
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      Normal (12–20 /min)
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground flex items-center gap-1 font-medium">
                      <Scale className="size-3 text-muted-foreground" />
                      Weight (kg)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="h-9 font-mono text-sm bg-background border-border"
                      placeholder="68.5"
                    />
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      Adult scale
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      showNotice('success', 'Vitals synced. These values are attached to your current SOAP note.');
                      setActiveTab('soap');
                    }}
                    className="h-8 text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Sparkles className="size-3.5" />
                    <span>Apply Vitals to SOAP Note</span>
                  </Button>
                </div>
              </div>

              {/* Baseline & Historic Trajectory */}
              {historyVitals.length > 0 && (
                <div className="border border-border rounded-xl p-4 bg-card shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="font-semibold text-xs text-foreground">
                      Prior Longitudinal Vitals Trajectory
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {historyVitals.length} historical readings
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {historyVitals.map((vit) => (
                      <div
                        key={vit.id}
                        className="p-3 rounded-lg bg-muted/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-foreground">
                              {vit.bloodPressure}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-mono text-muted-foreground">
                              {vit.heartRate} bpm
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-mono text-muted-foreground">
                              {vit.oxygenSaturation}% SpO2
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-mono text-muted-foreground">
                              {vit.temperature}°F
                            </span>
                          </div>
                          {vit.notes && (
                            <p className="text-[11px] text-muted-foreground">
                              {vit.notes}
                            </p>
                          )}
                        </div>

                        <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                          {new Date(vit.recordedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ======================================================== */}
            {/* TAB 4: DEMOGRAPHICS, ALLERGIES & EMERGENCY CONTACTS */}
            {/* ======================================================== */}
            <TabsContent value="demographics" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Information */}
                <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-3">
                  <div className="font-semibold text-xs text-foreground flex items-center gap-2 border-b border-border pb-2">
                    <Phone className="size-3.5 text-primary" />
                    <span>Contact Information</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Primary Phone</span>
                      <span className="font-mono font-medium text-foreground">{patient.phone || 'None recorded'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Emergency Contact</span>
                      <span className="text-foreground font-medium">{patient.emergencyContact || 'None on file'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Primary Physician</span>
                      <span className="text-foreground">{patient.primaryPhysician || attendingPhysician}</span>
                    </div>
                  </div>
                </div>

                {/* Demographic Profile */}
                <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-3">
                  <div className="font-semibold text-xs text-foreground flex items-center gap-2 border-b border-border pb-2">
                    <User className="size-3.5 text-primary" />
                    <span>Demographic Profile</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Legal Sex</span>
                      <span className="text-foreground font-medium">{patient.gender}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Age</span>
                      <span className="text-foreground font-medium">{patient.age} years</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Date of Birth</span>
                      <span className="font-mono text-foreground font-medium">{patient.dateOfBirth}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Blood Type</span>
                      <span className="font-mono font-bold text-foreground">{patient.bloodType || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Master Patient Index Banner */}
              <div className="p-4 bg-muted/20 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">
                      Enterprise Master Patient Index (EMPI)
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      Verified record status with cryptographically signed medical identity.
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                    Record ID: {patient.id}
                  </Badge>
                  <div className="text-[10px] font-mono text-muted-foreground mt-1">
                    Enrolled: {patient.createdAt ? patient.createdAt.split('T')[0] : 'Active'}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* 3. MODAL FOOTER */}
        <DialogFooter className="p-3.5 border-t border-border bg-muted/20 flex items-center justify-between sm:justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>MRN: {patient.mrn}</span>
            <span>•</span>
            <span>{consultations.length} Consultations on file</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 px-4 text-xs cursor-pointer border-border"
          >
            Close Chart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
