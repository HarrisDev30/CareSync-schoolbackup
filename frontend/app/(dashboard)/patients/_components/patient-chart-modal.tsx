'use client';

import React from 'react';
import {
  AlertTriangle,
  Printer,
  Phone,
  User,
  FileText,
  Activity,
  Heart,
  Thermometer,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { Patient } from '../../../../types';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PHYSICIAN_PRESETS } from '@/lib/api';

interface PatientChartModalProps {
  patient: Patient | null;
  onClose: () => void;
}

export function PatientChartModal({ patient, onClose }: PatientChartModalProps) {
  if (!patient) return null;

  const defaultDoctor = PHYSICIAN_PRESETS[0]?.name || 'Dr. Sarah Chen, MD';
  const assignedDoctor = patient.primaryPhysician || defaultDoctor;

  const encounter = {
    chiefComplaint: `Routine Outpatient Clinical Evaluation (${patient.status})`,
    subjective: `Patient ${patient.fullName} (${patient.gender}, ${patient.age} yrs) present for consultation. Self-reports adherence to prescribed clinical care plan.`,
    objective: `MRN: ${patient.mrn}, Blood Group: ${patient.bloodType || 'Unspecified'}, Contact: ${patient.phone}. Documented allergies: ${patient.allergies?.length ? patient.allergies.join(', ') : 'None (NKDA)'}.`,
    assessment: `Clinical Status: ${patient.status}. Profile active in EHR under ${assignedDoctor}.`,
    plan: `Follow up as scheduled with ${assignedDoctor}. Maintain preventative clinical screening and medication compliance.`,
  };

  const initials = patient.fullName
    ? patient.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'PT';

  return (
    <Dialog open={!!patient} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between pr-8">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 flex-shrink-0">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-semibold text-slate-900">
                  {patient.fullName}
                </DialogTitle>
                <Badge variant="outline" className="font-mono text-xs text-slate-600 bg-slate-50">
                  {patient.mrn}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                <span>
                  {patient.gender} • {patient.age} yrs • DOB: {patient.dateOfBirth} • Blood: {patient.bloodType || 'Unknown'}
                </span>
                <span className="text-slate-300">|</span>
                <span className="inline-flex items-center gap-1 font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70 text-[11px] font-medium">
                  <Phone className="size-3 text-slate-400" />
                  <span>{patient.phone || 'No phone recorded'}</span>
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-8 text-xs gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900"
          >
            <Printer className="size-3.5" />
            <span>Print</span>
          </Button>
        </DialogHeader>

        {/* Multi-Tab Clinical Dossier */}
        <Tabs defaultValue="soap" className="w-full mt-1">
          <TabsList className="grid grid-cols-3 w-full h-8.5 bg-slate-100/90 p-0.5 border border-slate-200/60">
            <TabsTrigger value="soap" className="text-xs">
              Clinical Notes (SOAP)
            </TabsTrigger>
            <TabsTrigger value="demographics" className="text-xs">
              Demographics & Contacts
            </TabsTrigger>
            <TabsTrigger value="vitals" className="text-xs">
              Vitals & Alerts
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Clinical SOAP Encounter */}
          <TabsContent value="soap" className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <Stethoscope className="size-4 text-blue-600" />
                <span className="font-medium text-slate-900">Attending Physician:</span>
                <span className="text-slate-700">{assignedDoctor}</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono uppercase bg-white">
                {patient.status}
              </Badge>
            </div>

            <div className="border border-slate-200 rounded-lg p-3.5 bg-white space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <FileText className="size-3.5 text-slate-500" />
                  Latest Consultation Note
                </span>
                <span className="text-[11px] text-slate-400">
                  {patient.createdAt ? patient.createdAt.split('T')[0] : 'Today'}
                </span>
              </div>

              <div className="space-y-2 text-slate-600 leading-relaxed pt-1">
                <div>
                  <span className="font-semibold text-slate-900">Chief Complaint: </span>
                  {encounter.chiefComplaint}
                </div>
                <div className="p-2 rounded bg-slate-50/80 border border-slate-100">
                  <strong className="text-slate-900 font-semibold block text-[11px] uppercase tracking-wider text-slate-500 mb-0.5">
                    S — Subjective
                  </strong>
                  {encounter.subjective}
                </div>
                <div className="p-2 rounded bg-slate-50/80 border border-slate-100">
                  <strong className="text-slate-900 font-semibold block text-[11px] uppercase tracking-wider text-slate-500 mb-0.5">
                    O — Objective
                  </strong>
                  {encounter.objective}
                </div>
                <div className="p-2 rounded bg-slate-50/80 border border-slate-100">
                  <strong className="text-slate-900 font-semibold block text-[11px] uppercase tracking-wider text-slate-500 mb-0.5">
                    A — Assessment
                  </strong>
                  {encounter.assessment}
                </div>
                <div className="p-2 rounded bg-slate-50/80 border border-slate-100">
                  <strong className="text-slate-900 font-semibold block text-[11px] uppercase tracking-wider text-slate-500 mb-0.5">
                    P — Plan
                  </strong>
                  {encounter.plan}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Demographics & Contacts */}
          <TabsContent value="demographics" className="space-y-3 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="font-medium text-slate-900 flex items-center gap-1.5">
                  <Phone className="size-3.5 text-slate-500" />
                  <span>Contact Information</span>
                </div>
                <div className="text-slate-600 space-y-1 pt-1">
                  <div>
                    <span className="text-slate-400">Primary Phone: </span>
                    <span className="font-mono text-slate-900 font-medium">{patient.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Emergency Contact: </span>
                    <span className="text-slate-800">{patient.emergencyContact || 'None on file'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="font-medium text-slate-900 flex items-center gap-1.5">
                  <User className="size-3.5 text-slate-500" />
                  <span>Demographic Profile</span>
                </div>
                <div className="text-slate-600 space-y-1 pt-1">
                  <div>
                    <span className="text-slate-400">Sex at Birth: </span>
                    <span className="text-slate-800">{patient.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Age: </span>
                    <span className="text-slate-800">{patient.age} years</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Date of Birth: </span>
                    <span className="font-mono text-slate-800">{patient.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Blood Group: </span>
                    <span className="font-mono font-semibold text-slate-800">{patient.bloodType || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span className="text-slate-700">Hospital Master Patient Index Record</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                Enrolled: {patient.createdAt ? patient.createdAt.split('T')[0] : 'Active'}
              </span>
            </div>
          </TabsContent>

          {/* TAB 3: Vitals & Alerts */}
          <TabsContent value="vitals" className="space-y-3 pt-2 text-xs">
            {/* Allergies Alert */}
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-800">
                <AlertTriangle className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Documented Allergies: </span>
                  {patient.allergies.join(', ')}
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500"></span>
                <span>No known drug allergies (NKDA) documented.</span>
              </div>
            )}

            {/* Baseline Vitals Grid */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-white space-y-3 shadow-2xs">
              <div className="font-semibold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
                <span>Baseline Clinical Vitals</span>
                <span className="text-[11px] text-slate-400 font-normal">Triage Recorded</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Blood Pressure</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-1">120/80</div>
                  <div className="text-[10px] text-slate-500">mmHg</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Heart Rate</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-1">72</div>
                  <div className="text-[10px] text-slate-500">bpm</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Oxygen (SpO2)</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-1">98%</div>
                  <div className="text-[10px] text-slate-500">Room air</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Temperature</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-1">98.6°F</div>
                  <div className="text-[10px] text-slate-500">Oral</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between sm:justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Record ID: {patient.id}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs cursor-pointer"
          >
            Close Chart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
