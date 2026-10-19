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
  Stethoscope,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MedicalRecordExportModal } from '@/components/medical-record-export-modal';

function PatientPortalContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

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

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-medium text-center px-4">
          Loading patient records...
        </p>
      </div>
    );
  }

  const { patient, appointments, labOrders, vitals, medications } = data;
  const latestVital = vitals[0];

  const initials = patient.fullName
    ? patient.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'EV';

  return (
    <div className="w-full space-y-6 text-foreground pb-8">
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

      {/* =====================================================================
          VIEW 1: MY HEALTH RECORD (Default / ?tab=overview)
          ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Command Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                My Health Record
              </h1>
              <p className="text-sm text-muted-foreground">
                Personal health profile, recorded vital signs, and assigned care team.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
              className="gap-2 h-10 px-4 cursor-pointer active:scale-[0.98] transition-transform bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium w-full sm:w-auto justify-center"
            >
              <FileText className="w-4 h-4" />
              <span>Export Official Record</span>
            </Button>
          </div>

          {/* Clean Patient Identity Strip */}
          <Card className="border-border bg-card shadow-xs rounded-xl">
            <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Avatar className="h-12 w-12 rounded-xl border border-border bg-muted text-foreground shrink-0">
                  <AvatarFallback className="text-sm font-bold bg-muted text-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-foreground">
                      {patient.fullName}
                    </span>
                    <Badge variant="outline" className="font-mono text-xs border-border">
                      {patient.mrn}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-xs border-border bg-muted/40">
                      Blood: {patient.bloodType || 'O+'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{patient.gender} · {patient.age} yrs</span>
                    <span className="hidden sm:inline text-border">|</span>
                    <span className="inline-flex items-center gap-1 font-mono text-foreground">
                      <Phone className="size-3 text-muted-foreground" />
                      {patient.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Allergies Pill */}
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
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
                    <span>No Known Allergies</span>
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Minimal 4-Box Vitals Strip (2x2 on Mobile, 4 Cols on Desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-border bg-card shadow-xs rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Blood Pressure</span>
                <Heart className="size-3.5 text-rose-500" />
              </div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-foreground mt-1.5">
                {latestVital ? latestVital.bloodPressure : '118/76'}
                <span className="text-xs font-sans font-normal text-muted-foreground ml-1">mmHg</span>
              </div>
            </Card>

            <Card className="border-border bg-card shadow-xs rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Heart Rate</span>
                <Activity className="size-3.5 text-emerald-500" />
              </div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-foreground mt-1.5">
                {latestVital ? latestVital.heartRate : 72}
                <span className="text-xs font-sans font-normal text-muted-foreground ml-1">bpm</span>
              </div>
            </Card>

            <Card className="border-border bg-card shadow-xs rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Oxygen SpO2</span>
                <Activity className="size-3.5 text-blue-500" />
              </div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-foreground mt-1.5">
                {latestVital ? latestVital.oxygenSaturation : 98}%
              </div>
            </Card>

            <Card className="border-border bg-card shadow-xs rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Temperature</span>
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              </div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-foreground mt-1.5">
                {latestVital ? latestVital.temperature : 98.4}°F
              </div>
            </Card>
          </div>

          {/* Discharge Summary (Only if Discharged) */}
          {dischargeSummary && (
            <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xs rounded-xl">
              <CardHeader className="p-4 sm:p-5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                    Discharge Summary & Care Instructions
                  </CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="w-fit font-mono text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                >
                  {dischargeSummary.disposition}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-2 text-xs text-foreground space-y-1.5">
                <p>{dischargeSummary.dischargeNotes}</p>
                <p className="text-muted-foreground">
                  Follow-up: {dischargeSummary.followUpInstructions} ({dischargeSummary.dischargedBy})
                </p>
              </CardContent>
            </Card>
          )}

          {/* Vitals History (Left) & Assigned Care Team (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border bg-card shadow-xs rounded-xl overflow-hidden">
              <CardHeader className="py-4 px-4 sm:px-6 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  Vitals History
                </CardTitle>
                <Badge variant="outline" className="text-xs font-mono border-border">
                  {vitals.length} Visits
                </Badge>
              </CardHeader>

              <CardContent className="p-0 divide-y divide-border">
                {vitals.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-foreground">
                        {new Date(v.recordedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">{v.notes}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 text-xs font-mono w-full sm:w-auto shrink-0">
                      <div className="px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border text-center">
                        <span className="text-muted-foreground font-sans mr-1">BP:</span>
                        <strong className="text-foreground">{v.bloodPressure}</strong>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border text-center">
                        <span className="text-muted-foreground font-sans mr-1">HR:</span>
                        <strong className="text-foreground">{v.heartRate}</strong>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border text-center">
                        <span className="text-muted-foreground font-sans mr-1">SpO2:</span>
                        <strong className="text-foreground">{v.oxygenSaturation}%</strong>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border text-center">
                        <span className="text-muted-foreground font-sans mr-1">Temp:</span>
                        <strong className="text-foreground">{v.temperature}°F</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-xs rounded-xl h-fit">
              <CardHeader className="py-4 px-4 sm:px-6 border-b border-border">
                <CardTitle className="text-base font-semibold text-foreground">
                  Assigned Care Team
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/60">
                  <Avatar className="h-9 w-9 border border-border bg-card text-xs shrink-0">
                    <AvatarFallback className="text-xs font-bold text-foreground">SC</AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-sm font-semibold text-foreground">Dr. Sarah Chen, MD</div>
                    <div className="text-xs text-muted-foreground">Primary Care · Exam Suite 3B</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/60">
                  <Avatar className="h-9 w-9 border border-border bg-card text-xs shrink-0">
                    <AvatarFallback className="text-xs font-bold text-foreground">MV</AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-sm font-semibold text-foreground">Dr. Marcus Vance, MD</div>
                    <div className="text-xs text-muted-foreground">Cardiology · Suite 1A</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: MY APPOINTMENTS (?tab=appointments)
          ===================================================================== */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                My Appointments
              </h1>
              <p className="text-sm text-muted-foreground">
                Scheduled doctor visits and past outpatient consultations.
              </p>
            </div>
            <Badge variant="outline" className="w-fit font-mono text-xs py-1 px-3 border-border">
              {appointments.length} Scheduled Visits
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((apt) => {
              const isUpcoming = apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED';
              return (
                <Card key={apt.id} className="border-border bg-card shadow-xs rounded-xl">
                  <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
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
                      <CardTitle className="text-base font-semibold text-foreground pt-1">
                        {apt.reason}
                      </CardTitle>
                    </div>
                    <Calendar className="size-4 text-muted-foreground shrink-0 mt-1" />
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/60 text-xs space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-foreground">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Stethoscope className="size-3.5 text-primary shrink-0" />
                          {apt.physicianName}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {apt.roomNumber || 'Exam Suite 3B'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-foreground font-mono pt-1 border-t border-border/60">
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

                    {isUpcoming && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Pre-check-in available
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            triggerToast(
                              `Pre-check-in confirmed for ${apt.physicianName} (${apt.roomNumber || 'Exam Suite 3B'}).`,
                            )
                          }
                          className="h-8 px-3 text-xs font-medium cursor-pointer border-border"
                        >
                          Confirm Check-In
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 3: DIAGNOSTIC RESULTS (?tab=labs)
          ===================================================================== */}
      {activeTab === 'labs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Diagnostic Results
              </h1>
              <p className="text-sm text-muted-foreground">
                Verified clinical laboratory panels and reference intervals.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
              className="gap-2 h-10 px-3.5 border-border text-sm cursor-pointer w-full sm:w-auto justify-center"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
              <span>Export Lab Report</span>
            </Button>
          </div>

          <div className="space-y-4">
            {labOrders.map((lab) => (
              <Card key={lab.id} className="border-border bg-card shadow-xs rounded-xl overflow-hidden">
                <CardHeader className="p-4 sm:p-5 bg-muted/20 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{lab.orderNumber}</span>
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
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      {lab.testName}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Ordered by {lab.requestedBy} ·{' '}
                      {new Date(lab.requestedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-4">
                  {lab.results && lab.results.length > 0 ? (
                    <div className="border border-border rounded-lg overflow-hidden text-xs">
                      <div className="hidden sm:grid sm:grid-cols-12 gap-2 bg-muted/50 px-4 py-2.5 font-medium text-muted-foreground border-b border-border">
                        <span className="col-span-5">Test Parameter</span>
                        <span className="col-span-3 text-right">Result</span>
                        <span className="col-span-4 text-right">Reference Range</span>
                      </div>

                      <div className="divide-y divide-border bg-card">
                        {lab.results.map((r, i) => (
                          <div
                            key={i}
                            className="p-3.5 sm:px-4 sm:py-3 flex flex-col sm:grid sm:grid-cols-12 gap-1.5 sm:gap-2 sm:items-center"
                          >
                            <div className="flex items-center justify-between sm:col-span-5 gap-2">
                              <span className="font-semibold text-sm sm:text-xs text-foreground flex items-center gap-1.5">
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
                                  r.isAbnormal ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
                                }`}
                              >
                                {r.value} <span className="text-xs font-normal text-muted-foreground">{r.unit}</span>
                              </span>
                            </div>

                            <span
                              className={`hidden sm:block sm:col-span-3 text-right font-mono font-bold ${
                                r.isAbnormal ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
                              }`}
                            >
                              {r.value} <span className="text-xs font-normal text-muted-foreground">{r.unit}</span>
                            </span>

                            <div className="flex items-center justify-between sm:block sm:col-span-4 sm:text-right text-muted-foreground font-mono text-xs">
                              <span className="sm:hidden font-sans">Ref Range:</span>
                              <span>{r.referenceRange}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/30 border border-border/60 rounded-lg text-xs text-muted-foreground">
                      Specimen collected and currently being processed by the laboratory.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 4: PRESCRIPTIONS & CARE (?tab=medications)
          ===================================================================== */}
      {activeTab === 'medications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Prescriptions & Care
              </h1>
              <p className="text-sm text-muted-foreground">
                Active medications, dosage schedules, and refill requests.
              </p>
            </div>
            <Badge variant="outline" className="w-fit font-mono text-xs py-1 px-3 border-border">
              {medications.length} Prescriptions
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => {
              const isActive = med.status === 'Active';
              return (
                <Card key={med.id} className="border-border bg-card shadow-xs rounded-xl">
                  <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
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
                      <CardTitle className="text-base font-semibold text-foreground pt-1">
                        {med.name}
                      </CardTitle>
                      <div className="text-xs font-mono font-semibold text-primary">
                        {med.dosage} · {med.frequency}
                      </div>
                    </div>
                    <Pill className="size-4 text-primary shrink-0 mt-1" />
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/60 text-xs text-foreground leading-relaxed">
                      {med.instructions}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>Prescribed by {med.prescribedBy}</span>
                      {isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            triggerToast(`Refill request sent to ${med.prescribedBy} for ${med.name}.`)
                          }
                          className="h-8 px-3 text-xs font-medium cursor-pointer border-border"
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
        </div>
      )}

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
            Loading patient records...
          </p>
        </div>
      }
    >
      <PatientPortalContent />
    </Suspense>
  );
}
