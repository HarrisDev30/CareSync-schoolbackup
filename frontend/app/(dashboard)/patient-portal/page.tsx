'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  Calendar,
  Clock,
  Heart,
  ShieldAlert,
  FileText,
  CheckCircle2,
  AlertCircle,
  Pill,
  Phone,
  Mail,
  MapPin,
  User,
  Stethoscope,
  Beaker,
  ChevronRight,
  Sparkles,
  Download,
  ArrowUpRight,
} from 'lucide-react';
import {
  fetchPatientPortalData,
  ELEANOR_VITALS,
  ELEANOR_MEDICATIONS,
} from '@/lib/api';
import { Patient, Appointment, LabOrder, PatientVital, PatientMedication } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const portalData = await fetchPatientPortalData('MRN-90214');
        setData(portalData);
      } catch {
        // Fallback
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="size-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Securing patient records & retrieving health profile...</p>
      </div>
    );
  }

  const { patient, appointments, labOrders, vitals, medications } = data;
  const latestVital = vitals[0];
  const upcomingAppointment = appointments.find((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Patient Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 rounded-2xl border-2 border-emerald-400/40 bg-emerald-800 text-white shadow-md">
              <AvatarFallback className="text-xl font-bold bg-emerald-800 text-emerald-100">
                EV
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white">{patient.fullName}</h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs px-2 py-0.5 font-mono">
                  {patient.mrn}
                </Badge>
                <Badge variant="outline" className="text-slate-300 border-slate-600/60 text-xs">
                  {patient.gender} • {patient.age} yrs
                </Badge>
                <Badge variant="outline" className="text-emerald-200 border-emerald-500/40 text-xs bg-emerald-950/40">
                  Blood: {patient.bloodType}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3 pt-0.5">
                <span className="flex items-center gap-1">
                  <Phone className="size-3 text-emerald-400" />
                  {patient.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Stethoscope className="size-3 text-teal-400" />
                  PCP: {patient.primaryPhysician || 'Dr. Sarah Chen, MD'}
                </span>
                <span>•</span>
                <span className="text-slate-400">DOB: May 14, 1982</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('appointments')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-9 cursor-pointer backdrop-blur-xs"
            >
              <Calendar className="size-3.5 mr-1.5 text-emerald-300" />
              <span>Schedule Visit</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveTab('labs')}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs h-9 cursor-pointer shadow-sm"
            >
              <FileText className="size-3.5 mr-1.5 text-slate-950" />
              <span>View Lab Reports</span>
            </Button>
          </div>
        </div>

        {/* Emergency Contact & Allergy Sub-bar */}
        <div className="mt-5 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldAlert className="size-4 text-amber-400 shrink-0" />
            <span className="text-slate-400 font-medium">Documented Allergies:</span>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex items-center gap-1.5">
                {patient.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-950/60 text-red-300 border border-red-800/60"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-emerald-300">No Known Drug Allergies (NKDA)</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <User className="size-3.5 text-teal-400 shrink-0" />
            <span className="text-slate-400">Emergency Contact:</span>
            <span className="font-medium text-slate-200">
              {patient.emergencyContact || 'Thomas Vance (Spouse) — +1 (555) 349-8209'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 border border-slate-200 rounded-xl h-11 grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-xs font-medium cursor-pointer"
          >
            <Activity className="size-3.5 mr-1.5 text-emerald-600" />
            Health Overview
          </TabsTrigger>
          <TabsTrigger
            value="appointments"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-xs font-medium cursor-pointer"
          >
            <Calendar className="size-3.5 mr-1.5 text-blue-600" />
            Appointments
            {upcomingAppointment && (
              <span className="size-2 rounded-full bg-blue-600 ml-1.5"></span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="labs"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-xs font-medium cursor-pointer"
          >
            <Beaker className="size-3.5 mr-1.5 text-purple-600" />
            Diagnostic Labs
            <span className="ml-1.5 text-[10px] px-1.5 py-0.2 bg-slate-200 rounded-full font-mono">
              {labOrders.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="medications"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-xs font-medium cursor-pointer"
          >
            <Pill className="size-3.5 mr-1.5 text-amber-600" />
            Medications
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & VITALS */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium text-slate-500 flex items-center justify-between">
                  <span>Blood Pressure</span>
                  <Heart className="size-4 text-rose-500" />
                </CardDescription>
                <CardTitle className="text-xl font-bold text-slate-900 pt-1">
                  {latestVital ? latestVital.bloodPressure : '118/76 mmHg'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="size-3.5" />
                  <span>Normal / Optimal Range</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Recorded: Sept 12, 2026</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium text-slate-500 flex items-center justify-between">
                  <span>Heart Rate</span>
                  <Activity className="size-4 text-emerald-500" />
                </CardDescription>
                <CardTitle className="text-xl font-bold text-slate-900 pt-1">
                  {latestVital ? latestVital.heartRate : 72} <span className="text-xs font-normal text-slate-500">bpm</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="size-3.5" />
                  <span>Resting Sinus Rhythm</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Target: 60-100 bpm</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium text-slate-500 flex items-center justify-between">
                  <span>Oxygen Saturation</span>
                  <Activity className="size-4 text-blue-500" />
                </CardDescription>
                <CardTitle className="text-xl font-bold text-slate-900 pt-1">
                  {latestVital ? latestVital.oxygenSaturation : 98}%
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="size-3.5" />
                  <span>Adequate Oxygenation</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Room Air SpO2</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium text-slate-500 flex items-center justify-between">
                  <span>Next Doctor Visit</span>
                  <Calendar className="size-4 text-indigo-500" />
                </CardDescription>
                <CardTitle className="text-base font-bold text-slate-900 pt-1 truncate">
                  {upcomingAppointment ? 'Upcoming Consultation' : 'No Visits Booked'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {upcomingAppointment ? (
                  <>
                    <div className="text-xs font-semibold text-indigo-700 truncate">
                      {upcomingAppointment.physicianName}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(upcomingAppointment.scheduledAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">Click to book consultation</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Overview Cards: Vitals History & Active Care Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vitals History Log */}
            <Card className="lg:col-span-2 border-slate-200 shadow-xs">
              <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="size-4 text-emerald-600" />
                    Clinical Vitals & Measurements History
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Recorded during hospital outpatient consultations
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs text-slate-600">
                  {vitals.length} Recorded Visits
                </Badge>
              </CardHeader>

              <CardContent className="p-0 divide-y divide-slate-100">
                {vitals.map((v) => (
                  <div key={v.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {new Date(v.recordedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <Badge variant="secondary" className="text-[10px] py-0 font-normal">
                          Routine Outpatient
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{v.notes}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-center px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80">
                        <div className="text-[10px] text-slate-400 uppercase font-sans">BP</div>
                        <div className="font-bold text-slate-800">{v.bloodPressure}</div>
                      </div>

                      <div className="text-center px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80">
                        <div className="text-[10px] text-slate-400 uppercase font-sans">Pulse</div>
                        <div className="font-bold text-slate-800">{v.heartRate} bpm</div>
                      </div>

                      <div className="text-center px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80">
                        <div className="text-[10px] text-slate-400 uppercase font-sans">SpO2</div>
                        <div className="font-bold text-slate-800">{v.oxygenSaturation}%</div>
                      </div>

                      <div className="text-center px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80">
                        <div className="text-[10px] text-slate-400 uppercase font-sans">Temp</div>
                        <div className="font-bold text-slate-800">{v.temperature}°F</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Assigned Care Team & Clinicians */}
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="p-5 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="size-4 text-blue-600" />
                    Assigned Primary Care Team
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Lead clinicians managing your outpatient care
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                    <Avatar className="size-11 border border-blue-200 bg-white">
                      <AvatarFallback className="text-xs font-bold text-blue-700 bg-blue-100">
                        SC
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900">Dr. Sarah Chen, MD</div>
                      <div className="text-[11px] text-blue-700 font-medium">Attending Physician • General Practice</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="size-3 text-slate-400" />
                        Exam Suite 3B (Main Clinic)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <Avatar className="size-11 border border-slate-200 bg-white">
                      <AvatarFallback className="text-xs font-bold text-slate-700 bg-slate-100">
                        MV
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900">Dr. Marcus Vance, MD</div>
                      <div className="text-[11px] text-slate-600 font-medium">Consulting Specialist • Cardiology</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="size-3 text-slate-400" />
                        Cardiology Suite 1A
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('appointments')}
                      className="w-full text-xs h-9 justify-center gap-1.5 cursor-pointer text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                    >
                      <Calendar className="size-3.5" />
                      <span>Book Follow-up Appointment</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Patient Safety & Privacy Card */}
              <Card className="border-slate-200 shadow-xs bg-slate-50/50">
                <CardContent className="p-4 flex items-start gap-3 text-xs text-slate-600">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-900">HIPAA Protected Health Information</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Your records, consultation notes, and laboratory results are protected with AES-256 field encryption in accordance with federal healthcare standards.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: APPOINTMENTS */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Consultation Schedule</h2>
              <p className="text-xs text-slate-500">Upcoming clinical appointments, preparation guidelines, and visit records</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {appointments.length} Total Consultations
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((apt) => {
              const isUpcoming = apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED';
              return (
                <Card
                  key={apt.id}
                  className={`border transition-all shadow-xs ${
                    isUpcoming ? 'border-blue-300 ring-1 ring-blue-100 bg-white' : 'border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 ${
                            apt.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : apt.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {apt.status}
                        </Badge>
                        <span className="text-xs text-slate-400">• {apt.durationMinutes} mins</span>
                      </div>
                      <CardTitle className="text-sm font-bold text-slate-900 pt-1">
                        {apt.reason}
                      </CardTitle>
                    </div>

                    <div className="size-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                      <Calendar className="size-5" />
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-1 space-y-4">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Stethoscope className="size-3.5 text-blue-600" />
                          {apt.physicianName}
                        </span>
                        <span className="text-[11px] text-slate-500">{apt.roomNumber || 'Exam Room 3B'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-900 font-semibold pt-1 border-t border-slate-200/50">
                        <Clock className="size-3.5 text-slate-400" />
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
                      <p className="text-xs text-slate-500 italic bg-white p-2.5 rounded-md border border-slate-100">
                        "{apt.notes}"
                      </p>
                    )}

                    {isUpcoming && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                        <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                          Pre-check-in available online
                        </span>
                        <Button variant="ghost" size="sm" className="text-xs h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          Visit Details & Directions
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 3: DIAGNOSTIC LABS */}
        <TabsContent value="labs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Diagnostic Laboratory Results</h2>
              <p className="text-xs text-slate-500">Verified lab panels, reference ranges, and attending physician interpretations</p>
            </div>
            <Badge variant="outline" className="text-xs text-purple-700 bg-purple-50 border-purple-200">
              CLIA Certified Testing
            </Badge>
          </div>

          <div className="space-y-4">
            {labOrders.map((lab) => (
              <Card key={lab.id} className="border-slate-200 shadow-xs overflow-hidden">
                <CardHeader className="p-5 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">{lab.orderNumber}</span>
                      <Badge
                        className={`text-[10px] font-mono uppercase ${
                          lab.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        {lab.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {lab.priority}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      {lab.testName}
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      Ordered by {lab.requestedBy} • {new Date(lab.requestedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 cursor-pointer">
                      <Download className="size-3.5 text-slate-500" />
                      <span>Download PDF</span>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {lab.results && lab.results.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <div className="bg-slate-100/70 px-4 py-2 font-semibold text-slate-700 grid grid-cols-12 gap-2 border-b border-slate-200">
                        <span className="col-span-5">Analyte / Test Parameter</span>
                        <span className="col-span-3 text-right">Result Value</span>
                        <span className="col-span-4 text-right">Reference Interval</span>
                      </div>
                      <div className="divide-y divide-slate-100 bg-white">
                        {lab.results.map((r, i) => (
                          <div key={i} className="px-4 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/50">
                            <span className="col-span-5 font-medium text-slate-900 flex items-center gap-1.5">
                              {r.parameter}
                              {r.isAbnormal && (
                                <Badge variant="destructive" className="text-[9px] py-0 px-1 font-mono">
                                  FLAGGED
                                </Badge>
                              )}
                            </span>
                            <span className={`col-span-3 text-right font-mono font-bold ${
                              r.isAbnormal ? 'text-amber-600' : 'text-slate-800'
                            }`}>
                              {r.value} <span className="text-[11px] font-normal text-slate-500">{r.unit}</span>
                            </span>
                            <span className="col-span-4 text-right text-slate-500 font-mono text-[11px]">
                              {r.referenceRange}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-500 flex items-center gap-2">
                      <Clock className="size-4 text-slate-400" />
                      <span>Specimen collected and currently being processed by clinical laboratory instrumentation.</span>
                    </div>
                  )}

                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-emerald-900 space-y-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      Attending Clinician Review Note
                    </span>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      "Values reviewed and verified. Metabolic panel and lipid profiles show favorable response to current therapy. Continue ongoing regimen." — Dr. Sarah Chen, MD
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 4: MEDICATIONS */}
        <TabsContent value="medications" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Current Medications & Prescriptions</h2>
              <p className="text-xs text-slate-500">Active medications prescribed by attending physicians with dosage instructions</p>
            </div>
            <Badge variant="outline" className="text-xs text-amber-700 bg-amber-50 border-amber-200">
              Pharmacy Verified
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => {
              const isActive = med.status === 'Active';
              return (
                <Card
                  key={med.id}
                  className={`border transition-all shadow-xs ${
                    isActive ? 'border-slate-200 bg-white' : 'border-slate-200/60 bg-slate-50/50 opacity-75'
                  }`}
                >
                  <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-200 text-slate-600 border-slate-300'
                          }`}
                        >
                          {med.status}
                        </Badge>
                        <span className="text-xs text-slate-400">Since {med.startDate}</span>
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900 pt-1">
                        {med.name}
                      </CardTitle>
                      <div className="text-xs font-semibold text-emerald-700 font-mono">
                        {med.dosage} • {med.frequency}
                      </div>
                    </div>

                    <div className="size-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-100">
                      <Pill className="size-5" />
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-2 space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs space-y-1">
                      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Usage Guidelines</span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {med.instructions}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <span>Prescribed by: <strong className="text-slate-700">{med.prescribedBy}</strong></span>
                      {isActive && (
                        <Button variant="ghost" size="sm" className="text-xs h-7 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2">
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
    </div>
  );
}

export default function PatientPortalPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="size-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Securing patient records & retrieving health profile...</p>
      </div>
    }>
      <PatientPortalContent />
    </Suspense>
  );
}
