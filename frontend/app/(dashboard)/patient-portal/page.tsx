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
  Search,
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MedicalRecordExportModal } from '@/components/medical-record-export-modal';

function PatientPortalContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
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

  const q = searchQuery.toLowerCase().trim();
  const filteredVitals = vitals.filter(
    (v) =>
      !q ||
      v.bloodPressure.toLowerCase().includes(q) ||
      v.notes.toLowerCase().includes(q) ||
      v.recordedAt.toLowerCase().includes(q),
  );
  const filteredAppointments = appointments.filter(
    (a) =>
      !q ||
      a.physicianName.toLowerCase().includes(q) ||
      a.reason.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q) ||
      (a.roomNumber && a.roomNumber.toLowerCase().includes(q)),
  );
  const filteredLabs = labOrders.filter(
    (l) =>
      !q ||
      l.testName.toLowerCase().includes(q) ||
      l.orderNumber.toLowerCase().includes(q) ||
      l.requestedBy.toLowerCase().includes(q) ||
      l.status.toLowerCase().includes(q),
  );
  const filteredMedications = medications.filter(
    (m) =>
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.dosage.toLowerCase().includes(q) ||
      m.frequency.toLowerCase().includes(q) ||
      m.prescribedBy.toLowerCase().includes(q),
  );

  const initials = patient.fullName
    ? patient.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'EV';

  return (
    <div className="w-full space-y-6 text-foreground">
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

      {/* 1. COMMAND HEADER (Strict DESIGN.md §2 Standard — Identical to all CareSync pages) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            My Health Record & Patient Portal
          </h1>
          <p className="text-sm text-muted-foreground">
            Personal clinical chart, verified laboratory findings, active prescriptions, and outpatient consultation schedule.
          </p>
        </div>

        {/* Global Action Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('appointments')}
            className="gap-2 text-sm text-muted-foreground hover:text-foreground h-10 px-3.5 border-border shadow-none cursor-pointer justify-center"
          >
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>My Visits ({appointments.length})</span>
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

      {/* 2. TOP 4 KPI METRIC STRIP (Strict dashboard-01 section-cards Standard) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
        {/* KPI 1: Blood Pressure */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Blood Pressure
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {latestVital ? latestVital.bloodPressure : '118/76'}
              <span className="text-sm font-normal text-muted-foreground ml-1.5">mmHg</span>
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 rounded-lg text-xs font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="size-3" />
                <span>Optimal</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Normal Arterial Pressure</span>
              <Heart className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              AHA Target &lt;120/80 mmHg · Outpatient Triage
            </div>
          </CardFooter>
        </Card>

        {/* KPI 2: Resting Heart Rate */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Resting Heart Rate
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {latestVital ? latestVital.heartRate : 72}
              <span className="text-sm font-normal text-muted-foreground ml-1.5">bpm</span>
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 rounded-lg text-xs font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <Activity className="size-3" />
                <span>Normal</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Regular Sinus Rhythm</span>
              <Activity className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Physiological adult resting target 60–100 bpm
            </div>
          </CardFooter>
        </Card>

        {/* KPI 3: Oxygen Saturation */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Oxygen Saturation
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {latestVital ? latestVital.oxygenSaturation : 98}%
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <ShieldCheck className="size-3 text-muted-foreground" />
                <span>Room Air</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Adequate Oxygenation</span>
              <CheckCircle2 className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Peripheral SpO2 reference range 95%–100%
            </div>
          </CardFooter>
        </Card>

        {/* KPI 4: Active Clinical Care */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Active Clinical Care
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {activeMedicationsCount} Rx · {verifiedLabsCount} Labs
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 rounded-lg text-xs font-mono font-medium"
              >
                <span>{patient.mrn}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>{patient.primaryPhysician || 'Dr. Sarah Chen, MD'}</span>
              <Stethoscope className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              {upcomingAppointment
                ? `Next visit: ${new Date(upcomingAppointment.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : 'Outpatient care plan active'}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* 3. PRIMARY PATIENT CLINICAL WORKBENCH CARD (Matches Rooms, Labs, Patients & Appointments) */}
      <Card className="shadow-xs border-border bg-card">
        <CardHeader className="py-5 px-4 sm:px-6 border-b border-border/60">
          {/* Patient Identity & Allergy Strip inside the Main Card Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <Avatar className="h-11 w-11 rounded-xl border border-border bg-muted text-foreground shrink-0">
                <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                    {patient.fullName}
                  </CardTitle>
                  <Badge variant="outline" className="font-mono text-xs font-medium text-muted-foreground px-2 py-0.5">
                    {patient.mrn}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-xs py-0.5 px-2.5"
                  >
                    {patient.status || 'Active'}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs py-0.5 px-2 border-border bg-muted/40 text-foreground">
                    Blood: {patient.bloodType || 'O+'}
                  </Badge>
                </div>

                <CardDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span>
                    {patient.gender} · {patient.age} yrs · DOB: {patient.dateOfBirth || '1982-05-14'}
                  </span>
                  <span className="hidden sm:inline text-border">|</span>
                  <span className="inline-flex items-center gap-1 font-mono text-foreground">
                    <Phone className="size-3 text-muted-foreground" />
                    <span>{patient.phone}</span>
                  </span>
                </CardDescription>
              </div>
            </div>

            {/* Allergies & Emergency Contact Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {patient.allergies && patient.allergies.length > 0 ? (
                <Badge
                  variant="outline"
                  className="text-xs py-1 px-2.5 font-medium border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5"
                >
                  <ShieldAlert className="size-3.5 shrink-0" />
                  <span>Allergies: {patient.allergies.join(', ')}</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs py-1 px-2.5 font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5"
                >
                  <ShieldCheck className="size-3.5 shrink-0" />
                  <span>NKDA</span>
                </Badge>
              )}

              <Badge
                variant="outline"
                className="text-xs py-1 px-2.5 font-normal border-border bg-muted/40 text-muted-foreground gap-1.5"
              >
                <User className="size-3 text-muted-foreground shrink-0" />
                <span className="truncate max-w-[240px] sm:max-w-none">
                  Emergency: <strong className="text-foreground font-medium">{patient.emergencyContact || 'Thomas Vance (+1 555-349-8209)'}</strong>
                </span>
              </Badge>
            </div>
          </div>

          {/* Unified Command Toolbar (Strict DESIGN.md §4.5 — Search + Tabs with Counts) */}
          <div className="pt-3.5 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter vitals, scheduled visits, lab panels, or prescriptions..."
                className="pl-10 pr-4 h-10 text-sm border-border bg-background shadow-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full lg:w-auto shrink-0"
            >
              <TabsList className="grid grid-cols-2 sm:inline-flex h-auto sm:h-10 w-full sm:w-auto bg-muted p-1 border border-border gap-1 sm:gap-0">
                <TabsTrigger value="overview" className="text-xs sm:text-sm px-3.5 py-1.5 font-medium cursor-pointer">
                  Overview ({filteredVitals.length})
                </TabsTrigger>
                <TabsTrigger value="appointments" className="text-xs sm:text-sm px-3.5 py-1.5 font-medium cursor-pointer">
                  Visits ({filteredAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="labs" className="text-xs sm:text-sm px-3.5 py-1.5 font-medium cursor-pointer">
                  Labs ({filteredLabs.length})
                </TabsTrigger>
                <TabsTrigger value="medications" className="text-xs sm:text-sm px-3.5 py-1.5 font-medium cursor-pointer">
                  Medications ({filteredMedications.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* =========================================================
                TAB 1: CLINICAL OVERVIEW & VITALS HISTORY
                ========================================================= */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Active Discharge Summary Banner (If Discharged) */}
              {dischargeSummary && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-sm font-semibold text-foreground">
                        Official Clinical Discharge Summary & Recovery Plan
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="w-fit font-mono text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    >
                      {dischargeSummary.disposition}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Vitals History Rows */}
                <div className="lg:col-span-2 rounded-xl border border-border bg-background/50 overflow-hidden">
                  <div className="py-3.5 px-4 sm:px-5 border-b border-border bg-muted/30 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      Recorded Outpatient Vitals History
                    </span>
                    <Badge variant="outline" className="font-mono text-xs border-border">
                      {filteredVitals.length} entries
                    </Badge>
                  </div>

                  <div className="divide-y divide-border">
                    {filteredVitals.map((v) => (
                      <div
                        key={v.id}
                        className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:bg-muted/30 transition-colors"
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

                        {/* Responsive 2x2 Grid on Mobile -> 4-Box Strip on sm+ */}
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 text-xs font-mono w-full sm:w-auto shrink-0">
                          <div className="px-2.5 py-1.5 rounded-lg bg-card border border-border text-center">
                            <div className="text-xs text-muted-foreground font-sans">BP</div>
                            <div className="font-semibold text-foreground">{v.bloodPressure}</div>
                          </div>

                          <div className="px-2.5 py-1.5 rounded-lg bg-card border border-border text-center">
                            <div className="text-xs text-muted-foreground font-sans">Pulse</div>
                            <div className="font-semibold text-foreground">{v.heartRate} bpm</div>
                          </div>

                          <div className="px-2.5 py-1.5 rounded-lg bg-card border border-border text-center">
                            <div className="text-xs text-muted-foreground font-sans">SpO2</div>
                            <div className="font-semibold text-foreground">{v.oxygenSaturation}%</div>
                          </div>

                          <div className="px-2.5 py-1.5 rounded-lg bg-card border border-border text-center">
                            <div className="text-xs text-muted-foreground font-sans">Temp</div>
                            <div className="font-semibold text-foreground">{v.temperature}°F</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Assigned Care Team & HIPAA Encryption */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-background/50 p-4 sm:p-5 space-y-3.5">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Assigned Primary Care Team
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Attending clinicians managing your care
                      </p>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                      <Avatar className="h-10 w-10 border border-border bg-muted text-xs shrink-0">
                        <AvatarFallback className="text-xs font-bold text-foreground bg-muted">
                          SC
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="text-sm font-semibold text-foreground leading-snug">
                          Dr. Sarah Chen, MD
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          Primary Care · Internal Medicine
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 pt-0.5 font-mono">
                          <MapPin className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">Exam Suite 3B</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                      <Avatar className="h-10 w-10 border border-border bg-muted text-xs shrink-0">
                        <AvatarFallback className="text-xs font-bold text-foreground bg-muted">
                          MV
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="text-sm font-semibold text-foreground leading-snug">
                          Dr. Marcus Vance, MD
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          Specialist · Cardiology
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 pt-0.5 font-mono">
                          <MapPin className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">Cardiology Suite 1A</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-start gap-3 text-xs text-muted-foreground">
                    <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground block">
                        HIPAA Protected Health Information
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Protected at rest with AES-256-GCM envelope encryption and tamper-evident WORM audit logging.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* =========================================================
                TAB 2: SCHEDULED VISITS & CONSULTATIONS
                ========================================================= */}
            <TabsContent value="appointments" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAppointments.map((apt) => {
                  const isUpcoming = apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED';
                  return (
                    <div
                      key={apt.id}
                      className="p-5 rounded-xl border border-border bg-background/40 shadow-2xs flex flex-col justify-between min-h-[195px]"
                    >
                      <div>
                        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`size-2 rounded-full ${
                                isUpcoming ? 'bg-emerald-500' : 'bg-muted-foreground'
                              }`}
                            />
                            <span className="font-bold text-sm font-mono text-foreground">
                              {apt.roomNumber || 'Suite 3B'}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`font-mono text-xs uppercase px-2.5 py-0.5 ${
                              apt.status === 'CONFIRMED'
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : apt.status === 'SCHEDULED'
                                ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : 'border-border bg-muted/40 text-muted-foreground'
                            }`}
                          >
                            {apt.status}
                          </Badge>
                        </div>

                        <div className="my-3 space-y-1.5 text-xs">
                          <div className="font-semibold text-sm text-foreground leading-snug">
                            {apt.reason}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Stethoscope className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>{apt.physicianName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-mono text-foreground pt-0.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>
                              {new Date(apt.scheduledAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {apt.durationMinutes} mins
                        </span>
                        {isUpcoming ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              triggerToast(
                                `Pre-check-in confirmed for ${apt.physicianName} (${apt.roomNumber || 'Suite 3B'}).`,
                              )
                            }
                            className="h-8 text-xs px-3 font-medium cursor-pointer"
                          >
                            Confirm Check-In
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                            Visit Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* =========================================================
                TAB 3: DIAGNOSTIC LABORATORY RESULTS
                ========================================================= */}
            <TabsContent value="labs" className="mt-0 space-y-4">
              {filteredLabs.map((lab) => (
                <div
                  key={lab.id}
                  className="rounded-xl border border-border bg-background/40 overflow-hidden"
                >
                  <div className="p-4 sm:px-5 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                        <Badge variant="outline" className="text-xs font-mono py-0.5 px-2 border-border">
                          {lab.priority}
                        </Badge>
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-foreground">
                        {lab.testName}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ordered by <strong className="text-foreground font-medium">{lab.requestedBy}</strong> ·{' '}
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
                  </div>

                  <div className="p-4 sm:p-5 space-y-4">
                    {lab.results && lab.results.length > 0 ? (
                      <div className="border border-border rounded-lg overflow-hidden text-xs">
                        {/* Desktop/Tablet 12-Col Header (Hidden on < 640px) */}
                        <div className="hidden sm:grid sm:grid-cols-12 gap-2 bg-muted/50 px-4 py-2.5 font-medium text-muted-foreground border-b border-border">
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
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* =========================================================
                TAB 4: ACTIVE MEDICATIONS & PRESCRIPTIONS
                ========================================================= */}
            <TabsContent value="medications" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMedications.map((med) => {
                  const isActive = med.status === 'Active';
                  return (
                    <div
                      key={med.id}
                      className={`p-5 rounded-xl border border-border bg-background/40 shadow-2xs flex flex-col justify-between min-h-[195px] ${
                        !isActive ? 'opacity-75' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                          <div className="flex items-center gap-2">
                            <Pill className="size-3.5 text-primary shrink-0" />
                            <span className="font-bold text-sm text-foreground">
                              {med.name}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`font-mono text-xs uppercase px-2.5 py-0.5 ${
                              isActive
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'border-border bg-muted/40 text-muted-foreground'
                            }`}
                          >
                            {med.status}
                          </Badge>
                        </div>

                        <div className="my-3 space-y-1.5 text-xs">
                          <div className="font-mono font-semibold text-xs text-primary">
                            {med.dosage} · {med.frequency}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {med.instructions}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
                        <span className="text-muted-foreground truncate">
                          {med.prescribedBy}
                        </span>
                        {isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              triggerToast(
                                `Refill request sent to ${med.prescribedBy} for ${med.name} (${med.dosage}).`,
                              )
                            }
                            className="h-8 text-xs px-3 font-medium cursor-pointer shrink-0"
                          >
                            Request Refill
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
