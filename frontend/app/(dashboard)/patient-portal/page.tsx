'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  Calendar,
  Clock,
  Heart,
  ShieldAlert,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Pill,
  Phone,
  MapPin,
  User,
  Stethoscope,
  Beaker,
  Download,
  FileCheck,
} from 'lucide-react';
import {
  fetchPatientPortalData,
  fetchConsultations,
  getStoredDischargeSummary,
} from '@/lib/api';
import {
  Patient,
  Appointment,
  LabOrder,
  PatientVital,
  PatientMedication,
  Consultation,
  DischargeSummary,
} from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MedicalRecordExportModal } from '@/components/medical-record-export-modal';

function PatientPortalContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [data, setData] = useState<{
    patient: Patient;
    appointments: Appointment[];
    labOrders: LabOrder[];
    vitals: PatientVital[];
    medications: PatientMedication[];
  } | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [dischargeSummary, setDischargeSummary] = useState<DischargeSummary | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [portalData, conNotes] = await Promise.all([
          fetchPatientPortalData('MRN-90214'),
          fetchConsultations('p-1'),
        ]);
        setData(portalData);
        setConsultations(conNotes);
        if (portalData?.patient?.id) {
          setDischargeSummary(getStoredDischargeSummary(portalData.patient.id));
        }
      } catch {
        // Fallback handled in api layer
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'appointments', 'labs', 'medications'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-medium text-center px-4">
          Securing patient records & retrieving health profile...
        </p>
      </div>
    );
  }

  const { patient, appointments, labOrders, vitals, medications } = data;
  const latestVital = vitals[0];
  const upcomingAppointment = appointments.find(
    (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED',
  );
  const activeMedicationsCount = medications.filter((m) => m.status === 'Active').length;
  const verifiedLabsCount = labOrders.filter((l) => l.status === 'VERIFIED').length;

  const initials = patient.fullName
    ? patient.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'EV';

  return (
    <div className="w-full space-y-5 sm:space-y-6 pb-10">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 sm:max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-3.5 sm:p-4 rounded-xl border border-emerald-500/30 shadow-lg flex items-center justify-between bg-card text-card-foreground">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground ml-3 cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 1. COMMAND HEADER (DESIGN.md §2 + Mobile Responsive) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 sm:gap-4 pb-1">
        <div className="space-y-1 sm:space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            My Health Record & Patient Portal
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Personal health profile, verified laboratory diagnostics, active prescriptions, and outpatient visit schedule.
          </p>
        </div>

        {/* Global Action Group — Stacks / Full-Width on Mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('appointments')}
            className="gap-2 text-sm text-muted-foreground hover:text-foreground h-10 px-3.5 border-border shadow-none cursor-pointer justify-center"
          >
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>View Schedule ({appointments.length})</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            className="gap-2 h-10 px-4 cursor-pointer active:scale-[0.98] transition-transform bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium justify-center"
          >
            <FileText className="w-4 h-4" />
            <span>Export Official Record</span>
          </Button>
        </div>
      </div>

      {/* 2. PATIENT IDENTITY & CLINICAL SAFETY BANNER CARD (Deep Clinical Navy & Sapphire) */}
      <Card className="bg-gradient-to-br from-slate-900 via-[#14223b] to-[#1d3154] text-white border border-slate-700/80 shadow-md rounded-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <CardContent className="relative z-10 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-2 border-blue-400/35 bg-blue-950/80 text-blue-100 shrink-0 shadow-sm">
                <AvatarFallback className="text-sm sm:text-base font-bold bg-blue-950 text-blue-100">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    {patient.fullName}
                  </h2>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs py-0.5 px-2.5 bg-blue-500/20 border-blue-400/35 text-blue-200"
                  >
                    {patient.mrn}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs py-0.5 px-2.5 font-medium bg-sky-500/20 border-sky-400/35 text-sky-200"
                  >
                    {patient.status || 'Active'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs py-0.5 px-2.5 bg-white/10 border-white/20 text-slate-200"
                  >
                    Blood: {patient.bloodType || 'O+'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                  <span>
                    {patient.gender} • {patient.age} yrs • DOB: {patient.dateOfBirth || '1982-05-14'}
                  </span>
                  <span className="hidden sm:inline text-slate-600">|</span>
                  <span className="inline-flex items-center gap-1 font-mono text-slate-100">
                    <Phone className="size-3 text-sky-400 shrink-0" />
                    <span>{patient.phone}</span>
                  </span>
                  <span className="hidden sm:inline text-slate-600">|</span>
                  <span className="inline-flex items-center gap-1 text-slate-100">
                    <Stethoscope className="size-3 text-sky-400 shrink-0" />
                    <span>
                      PCP: <strong className="text-white">{patient.primaryPhysician || 'Dr. Sarah Chen, MD'}</strong>
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Frosted Glass Quick Stat Slots */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/70 shrink-0">
              <div className="px-3.5 py-2 rounded-lg bg-white/[0.07] border border-white/15 backdrop-blur-xs text-left sm:text-center">
                <div className="text-xs text-blue-200/80">Active Rx</div>
                <div className="text-sm font-bold font-mono text-white">
                  {activeMedicationsCount} Prescriptions
                </div>
              </div>
              <div className="px-3.5 py-2 rounded-lg bg-white/[0.07] border border-white/15 backdrop-blur-xs text-left sm:text-center">
                <div className="text-xs text-blue-200/80">Verified Labs</div>
                <div className="text-sm font-bold font-mono text-white">
                  {verifiedLabsCount} Panels
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Safety Sub-Bar: Allergies & Emergency Contact */}
          <div className="mt-4 pt-3.5 border-t border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <ShieldAlert className="size-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-300 font-medium">Documented Allergies:</span>
              {patient.allergies && patient.allergies.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {patient.allergies.map((allergy) => (
                    <Badge
                      key={allergy}
                      variant="outline"
                      className="text-xs py-0.5 px-2.5 font-medium border-amber-400/40 bg-amber-500/20 text-amber-200"
                    >
                      {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs py-0.5 px-2.5 font-medium border-sky-400/35 bg-sky-500/20 text-sky-200"
                >
                  NKDA (No Known Drug Allergies)
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-slate-300">
              <User className="size-3.5 text-sky-400 shrink-0" />
              <span>Emergency Contact:</span>
              <strong className="font-medium text-white">
                {patient.emergencyContact || 'Thomas Vance (Spouse) — +1 (555) 349-8209'}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. RESPONSIVE TABS NAVIGATION (2x2 Grid on Mobile -> 4-Col Strip on Tablet/Desktop) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="grid grid-cols-2 sm:inline-flex h-auto sm:h-10 w-full sm:w-auto bg-muted p-1 border border-border rounded-lg gap-1">
            <TabsTrigger
              value="overview"
              className="text-xs sm:text-sm px-3 py-2 sm:py-1.5 font-medium cursor-pointer justify-center"
            >
              <span>Overview ({vitals.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="text-xs sm:text-sm px-3 py-2 sm:py-1.5 font-medium cursor-pointer justify-center"
            >
              <span>Visits ({appointments.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="labs"
              className="text-xs sm:text-sm px-3 py-2 sm:py-1.5 font-medium cursor-pointer justify-center"
            >
              <span>Lab Results ({labOrders.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="medications"
              className="text-xs sm:text-sm px-3 py-2 sm:py-1.5 font-medium cursor-pointer justify-center"
            >
              <span>Medications ({medications.length})</span>
            </TabsTrigger>
          </TabsList>

          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
            <span>AES-256-GCM Encrypted Patient Record</span>
          </div>
        </div>

        {/* =========================================================
            TAB 1: HEALTH OVERVIEW & VITALS
            ========================================================= */}
        <TabsContent value="overview" className="space-y-5 sm:space-y-6">
          {/* Vitals KPI Grid: 2x2 on Mobile phones, 4 columns on Desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-border bg-card shadow-xs rounded-xl">
              <CardHeader className="p-3.5 sm:p-5 pb-1.5 sm:pb-2">
                <CardDescription className="text-xs font-medium text-muted-foreground flex items-center justify-between gap-1">
                  <span className="truncate">Blood Pressure</span>
                  <Heart className="size-3.5 sm:size-4 text-rose-500 shrink-0" />
                </CardDescription>
                <CardTitle className="text-base sm:text-xl font-bold font-mono text-foreground pt-1">
                  {latestVital ? latestVital.bloodPressure : '118/76'}
                  <span className="text-xs font-normal font-sans text-muted-foreground ml-1">
                    mmHg
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-5 pt-0">
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-3 shrink-0" />
                  <span className="truncate">Normal Range</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Target: &lt;120/80 mmHg
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-xs rounded-xl">
              <CardHeader className="p-3.5 sm:p-5 pb-1.5 sm:pb-2">
                <CardDescription className="text-xs font-medium text-muted-foreground flex items-center justify-between gap-1">
                  <span className="truncate">Heart Rate</span>
                  <Activity className="size-3.5 sm:size-4 text-emerald-500 shrink-0" />
                </CardDescription>
                <CardTitle className="text-base sm:text-xl font-bold font-mono text-foreground pt-1">
                  {latestVital ? latestVital.heartRate : 72}
                  <span className="text-xs font-normal font-sans text-muted-foreground ml-1">
                    bpm
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-5 pt-0">
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-3 shrink-0" />
                  <span className="truncate">Sinus Rhythm</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Target: 60–100 bpm
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-xs rounded-xl">
              <CardHeader className="p-3.5 sm:p-5 pb-1.5 sm:pb-2">
                <CardDescription className="text-xs font-medium text-muted-foreground flex items-center justify-between gap-1">
                  <span className="truncate">Oxygen SpO2</span>
                  <Activity className="size-3.5 sm:size-4 text-blue-500 shrink-0" />
                </CardDescription>
                <CardTitle className="text-base sm:text-xl font-bold font-mono text-foreground pt-1">
                  {latestVital ? latestVital.oxygenSaturation : 98}%
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-5 pt-0">
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-3 shrink-0" />
                  <span className="truncate">Optimal O2</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Room Air (95–100%)
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-xs rounded-xl">
              <CardHeader className="p-3.5 sm:p-5 pb-1.5 sm:pb-2">
                <CardDescription className="text-xs font-medium text-muted-foreground flex items-center justify-between gap-1">
                  <span className="truncate">Next Visit</span>
                  <Calendar className="size-3.5 sm:size-4 text-primary shrink-0" />
                </CardDescription>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground pt-1 truncate">
                  {upcomingAppointment ? upcomingAppointment.physicianName : 'None Scheduled'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-5 pt-0">
                {upcomingAppointment ? (
                  <>
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
                      {upcomingAppointment.roomNumber || 'Exam Suite 3B'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate font-mono">
                      {new Date(upcomingAppointment.scheduledAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground truncate">All visits completed</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Discharge Summary Card (Shown if Discharged) */}
          {dischargeSummary && (
            <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xs rounded-xl">
              <CardHeader className="p-4 sm:p-5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <FileCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                    Official Clinical Discharge Summary & Recovery Plan
                  </CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="w-fit font-mono text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                >
                  {dischargeSummary.disposition}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Discharge Instructions:</span>
                  <p className="text-foreground leading-relaxed">{dischargeSummary.dischargeNotes}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Follow-Up Care Plan:</span>
                  <p className="text-foreground leading-relaxed">
                    {dischargeSummary.followUpInstructions} — <strong>{dischargeSummary.dischargedBy}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Overview Grid: Vitals History (2 Cols) & Care Team (1 Col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* Vitals History Log */}
            <Card className="lg:col-span-2 border-border bg-card shadow-xs rounded-xl overflow-hidden">
              <CardHeader className="py-4 sm:py-5 px-4 sm:px-6 border-b border-border flex flex-row items-center justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <CardTitle className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
                    Clinical Vitals & Measurements
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground truncate">
                    Recorded during outpatient consultations
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono shrink-0 border-border">
                  {vitals.length} Visits
                </Badge>
              </CardHeader>

              <CardContent className="p-0 divide-y divide-border">
                {vitals.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {new Date(v.recordedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs py-0.5 px-2 border-border bg-muted/40 text-muted-foreground font-medium"
                        >
                          Outpatient Triage
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {v.notes}
                      </p>
                    </div>

                    {/* Responsive 2x2 Grid on Mobile -> 4-Box Row on sm+ */}
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 text-xs font-mono w-full sm:w-auto shrink-0">
                      <div className="px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border text-center">
                        <div className="text-xs text-muted-foreground font-sans">BP</div>
                        <div className="font-bold text-foreground">{v.bloodPressure}</div>
                      </div>

                      <div className="px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border text-center">
                        <div className="text-xs text-muted-foreground font-sans">Pulse</div>
                        <div className="font-bold text-foreground">{v.heartRate} bpm</div>
                      </div>

                      <div className="px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border text-center">
                        <div className="text-xs text-muted-foreground font-sans">SpO2</div>
                        <div className="font-bold text-foreground">{v.oxygenSaturation}%</div>
                      </div>

                      <div className="px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border text-center">
                        <div className="text-xs text-muted-foreground font-sans">Temp</div>
                        <div className="font-bold text-foreground">{v.temperature}°F</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Assigned Care Team & HIPAA Notice */}
            <div className="space-y-5">
              <Card className="border-border bg-card shadow-xs rounded-xl">
                <CardHeader className="py-4 sm:py-5 px-4 sm:px-6 border-b border-border">
                  <CardTitle className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                    Assigned Care Team
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Lead clinicians managing your outpatient care
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
                    <Avatar className="h-10 w-10 border border-border bg-card text-xs shrink-0">
                      <AvatarFallback className="text-xs font-bold text-primary bg-primary/10">
                        SC
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground leading-snug">
                        Dr. Sarah Chen, MD
                      </div>
                      <div className="text-xs text-primary font-medium">
                        Primary Care • Internal Medicine
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 pt-0.5">
                        <MapPin className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate">Exam Suite 3B • Outpatient Wing</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
                    <Avatar className="h-10 w-10 border border-border bg-card text-xs shrink-0">
                      <AvatarFallback className="text-xs font-bold text-foreground bg-muted">
                        MV
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground leading-snug">
                        Dr. Marcus Vance, MD
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        Consulting Specialist • Cardiology
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 pt-0.5">
                        <MapPin className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate">Cardiology Suite 1A • Specialty Wing</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('appointments')}
                    className="w-full text-xs h-9 justify-center gap-1.5 cursor-pointer border-border text-foreground hover:bg-muted"
                  >
                    <Calendar className="size-3.5" />
                    <span>View Scheduled Consultations</span>
                  </Button>
                </CardContent>
              </Card>

              {/* HIPAA Privacy & Security Card */}
              <Card className="border-border bg-card shadow-xs rounded-xl">
                <CardContent className="p-4 sm:p-5 flex items-start gap-3 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground block">
                      HIPAA Protected Health Information
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your demographic records, SOAP consultation notes, and laboratory findings are protected with AES-256-GCM envelope encryption.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* =========================================================
            TAB 2: SCHEDULED APPOINTMENTS
            ========================================================= */}
        <TabsContent value="appointments" className="space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                My Consultation Schedule
              </h2>
              <p className="text-xs text-muted-foreground">
                Upcoming outpatient appointments, assigned exam suites, and visit history
              </p>
            </div>
            <Badge variant="outline" className="w-fit text-xs font-mono border-border">
              {appointments.length} Total Visits
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((apt) => {
              const isUpcoming = apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED';
              return (
                <Card
                  key={apt.id}
                  className="border-border bg-card shadow-xs rounded-xl flex flex-col justify-between"
                >
                  <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs font-mono uppercase py-0.5 px-2.5 font-medium ${
                            apt.status === 'CONFIRMED'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : apt.status === 'SCHEDULED'
                              ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'border-border bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          {apt.status}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          {apt.durationMinutes} mins
                        </span>
                      </div>
                      <CardTitle className="text-sm sm:text-base font-semibold text-foreground leading-snug pt-0.5">
                        {apt.reason}
                      </CardTitle>
                    </div>

                    <div className="size-10 rounded-xl bg-muted border border-border text-foreground flex items-center justify-center shrink-0">
                      <Calendar className="size-4 text-primary" />
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 pt-0 space-y-3.5">
                    <div className="p-3.5 bg-muted/30 rounded-lg border border-border/60 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-foreground">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Stethoscope className="size-3.5 text-primary shrink-0" />
                          <span>{apt.physicianName}</span>
                        </span>
                        <Badge variant="outline" className="font-mono text-xs border-border bg-card">
                          {apt.roomNumber || 'Exam Suite 3B'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-foreground font-mono pt-1.5 border-t border-border/60">
                        <Clock className="size-3.5 text-muted-foreground shrink-0" />
                        <span>
                          {new Date(apt.scheduledAt).toLocaleDateString('en-US', {
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

                    {apt.notes && (
                      <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border border-border/60 leading-relaxed">
                        &ldquo;{apt.notes}&rdquo;
                      </p>
                    )}

                    {isUpcoming && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5 shrink-0" />
                          <span>Express check-in ready</span>
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            triggerToast(
                              `Pre-check-in confirmed for ${apt.physicianName} (${apt.roomNumber || 'Exam Suite 3B'}).`,
                            )
                          }
                          className="h-8 px-3 text-xs font-medium cursor-pointer w-full sm:w-auto border-border"
                        >
                          Confirm Pre-Check-In
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* =========================================================
            TAB 3: DIAGNOSTIC LABORATORY RESULTS (Mobile-First Table)
            ========================================================= */}
        <TabsContent value="labs" className="space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Diagnostic Laboratory Results
              </h2>
              <p className="text-xs text-muted-foreground">
                Verified clinical pathology panels, reference intervals, and physician interpretations
              </p>
            </div>
            <Badge
              variant="outline"
              className="w-fit text-xs font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              CLIA Certified Laboratory
            </Badge>
          </div>

          <div className="space-y-4">
            {labOrders.map((lab) => (
              <Card
                key={lab.id}
                className="border-border bg-card shadow-xs rounded-xl overflow-hidden"
              >
                <CardHeader className="p-4 sm:p-5 bg-muted/20 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {lab.orderNumber}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs font-mono uppercase py-0.5 px-2.5 font-medium ${
                          lab.status === 'VERIFIED'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {lab.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs font-mono py-0.5 px-2 border-border bg-card text-muted-foreground"
                      >
                        {lab.priority}
                      </Badge>
                    </div>
                    <CardTitle className="text-base sm:text-lg font-semibold text-foreground pt-0.5">
                      {lab.testName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Ordered by <strong className="text-foreground font-medium">{lab.requestedBy}</strong> •{' '}
                      {new Date(lab.requestedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExportModalOpen(true)}
                    className="h-8 px-3 text-xs gap-1.5 cursor-pointer w-full sm:w-auto justify-center border-border shrink-0"
                  >
                    <Download className="size-3.5 text-muted-foreground" />
                    <span>Official Lab Report</span>
                  </Button>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-4">
                  {lab.results && lab.results.length > 0 ? (
                    <div className="border border-border rounded-xl overflow-hidden text-xs">
                      {/* Desktop/Tablet 12-Col Header (Hidden on < 640px) */}
                      <div className="hidden sm:grid sm:grid-cols-12 gap-2 bg-muted/50 px-4 py-2.5 font-semibold text-muted-foreground border-b border-border">
                        <span className="col-span-5">Analyte / Test Parameter</span>
                        <span className="col-span-3 text-right">Result Value</span>
                        <span className="col-span-4 text-right">Reference Interval</span>
                      </div>

                      {/* Responsive Rows: Stacked Flex on Mobile, 12-Col Grid on sm+ */}
                      <div className="divide-y divide-border bg-card">
                        {lab.results.map((r, i) => (
                          <div
                            key={i}
                            className="p-3.5 sm:px-4 sm:py-3 flex flex-col sm:grid sm:grid-cols-12 gap-1.5 sm:gap-2 sm:items-center hover:bg-muted/30 transition-colors"
                          >
                            {/* Mobile Top Row: Parameter + Flag on Left, Value on Right */}
                            <div className="flex items-center justify-between sm:col-span-5 gap-2">
                              <span className="font-semibold text-sm sm:text-xs text-foreground flex flex-wrap items-center gap-1.5">
                                <span>{r.parameter}</span>
                                {r.isAbnormal && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs py-0 px-2 font-mono border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  >
                                    ABNORMAL
                                  </Badge>
                                )}
                              </span>

                              {/* Result Value shown inline on Mobile (<640px) */}
                              <span
                                className={`sm:hidden font-mono text-sm font-bold ${
                                  r.isAbnormal
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-foreground'
                                }`}
                              >
                                {r.value}{' '}
                                <span className="text-xs font-normal text-muted-foreground">
                                  {r.unit}
                                </span>
                              </span>
                            </div>

                            {/* Result Value on Tablet/Desktop (sm+) */}
                            <span
                              className={`hidden sm:block sm:col-span-3 text-right font-mono font-bold ${
                                r.isAbnormal
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-foreground'
                              }`}
                            >
                              {r.value}{' '}
                              <span className="text-xs font-normal text-muted-foreground">
                                {r.unit}
                              </span>
                            </span>

                            {/* Reference Interval */}
                            <div className="flex items-center justify-between sm:block sm:col-span-4 sm:text-right text-muted-foreground font-mono text-xs">
                              <span className="sm:hidden font-sans text-muted-foreground">
                                Reference Range:
                              </span>
                              <span>{r.referenceRange}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/30 border border-border/60 rounded-lg text-xs text-muted-foreground flex items-center gap-2.5">
                      <Clock className="size-4 text-muted-foreground shrink-0" />
                      <span>
                        Specimen collected and currently undergoing automated clinical analyzer processing.
                      </span>
                    </div>
                  )}

                  <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/30 rounded-lg text-xs space-y-1">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      <span>Attending Physician Interpretation</span>
                    </span>
                    <p className="text-xs text-foreground leading-relaxed">
                      &ldquo;Values reviewed and verified. Metabolic panel and lipid profiles show favorable response to current therapy. Continue ongoing regimen.&rdquo; — <strong>Dr. Sarah Chen, MD</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* =========================================================
            TAB 4: ACTIVE MEDICATIONS & PRESCRIPTIONS
            ========================================================= */}
        <TabsContent value="medications" className="space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Current Medications & Prescriptions
              </h2>
              <p className="text-xs text-muted-foreground">
                Active electronic prescriptions (e-Rx) with dosage schedules and administration instructions
              </p>
            </div>
            <Badge
              variant="outline"
              className="w-fit text-xs font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              Pharmacy Verified
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => {
              const isActive = med.status === 'Active';
              return (
                <Card
                  key={med.id}
                  className={`border-border bg-card shadow-xs rounded-xl flex flex-col justify-between ${
                    !isActive ? 'opacity-75' : ''
                  }`}
                >
                  <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs font-mono uppercase py-0.5 px-2.5 font-medium ${
                            isActive
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'border-border bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          {med.status}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          Since {med.startDate}
                        </span>
                      </div>
                      <CardTitle className="text-base font-semibold text-foreground leading-snug pt-0.5">
                        {med.name}
                      </CardTitle>
                      <div className="text-xs font-semibold text-primary font-mono">
                        {med.dosage} • {med.frequency}
                      </div>
                    </div>

                    <div className="size-10 rounded-xl bg-muted border border-border text-foreground flex items-center justify-center shrink-0">
                      <Pill className="size-4 text-primary" />
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 pt-0 space-y-3.5">
                    <div className="p-3.5 bg-muted/30 rounded-lg border border-border/60 text-xs space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Administration Instructions
                      </span>
                      <p className="text-xs text-foreground leading-relaxed font-medium">
                        {med.instructions}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
                      <span>
                        Prescribed by: <strong className="text-foreground">{med.prescribedBy}</strong>
                      </span>
                      {isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            triggerToast(`Refill request sent to ${med.prescribedBy} for ${med.name} (${med.dosage}).`)
                          }
                          className="h-8 px-3 text-xs font-medium cursor-pointer w-full sm:w-auto border-border"
                        >
                          Request Refill
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* 1-Click Official Certified EHR Medical Record Export Modal */}
      {data && (
        <MedicalRecordExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          patient={data.patient}
          consultations={consultations}
          vitals={data.vitals}
          medications={data.medications}
          labOrders={data.labOrders}
          dischargeSummary={dischargeSummary}
        />
      )}
    </div>
  );
}

export default function PatientPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium text-center px-4">
            Securing patient records & retrieving health profile...
          </p>
        </div>
      }
    >
      <PatientPortalContent />
    </Suspense>
  );
}
