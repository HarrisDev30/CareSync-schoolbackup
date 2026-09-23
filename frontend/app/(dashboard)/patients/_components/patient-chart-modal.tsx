'use client';

import React from 'react';
import {
  AlertTriangle,
  Printer,
  Phone,
  User,
  FileText,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { Patient } from '../../../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-card text-card-foreground border-border">
        <DialogHeader className="pb-4 border-b border-border flex flex-row items-center justify-between pr-8">
          <div className="flex items-center gap-3.5">
            <Avatar className="h-11 w-11 text-xs font-semibold text-muted-foreground bg-muted border border-border shrink-0">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-semibold text-foreground">
                  {patient.fullName}
                </DialogTitle>
                <Badge variant="outline" className="font-mono text-xs text-muted-foreground bg-muted/40 border-border">
                  {patient.mrn}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                <span>
                  {patient.gender} • {patient.age} yrs • DOB: {patient.dateOfBirth} • Blood: {patient.bloodType || 'Unknown'}
                </span>
                <span className="text-border">|</span>
                <span className="inline-flex items-center gap-1 font-mono text-foreground bg-muted px-2 py-0.5 rounded border border-border text-xs font-medium">
                  <Phone className="size-3 text-muted-foreground" />
                  <span>{patient.phone || 'No phone recorded'}</span>
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-9 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <Printer className="size-3.5" />
            <span>Print</span>
          </Button>
        </DialogHeader>

        {/* Multi-Tab Clinical Dossier */}
        <Tabs defaultValue="soap" className="w-full mt-2">
          <TabsList className="grid grid-cols-3 w-full h-10 bg-muted p-1 border border-border">
            <TabsTrigger value="soap" className="text-xs font-medium">
              Clinical Notes (SOAP)
            </TabsTrigger>
            <TabsTrigger value="demographics" className="text-xs font-medium">
              Demographics & Contacts
            </TabsTrigger>
            <TabsTrigger value="vitals" className="text-xs font-medium">
              Vitals & Alerts
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Clinical SOAP Encounter */}
          <TabsContent value="soap" className="space-y-3 pt-3 text-sm">
            <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Stethoscope className="size-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Attending Physician:</span>
                <span className="text-muted-foreground">{assignedDoctor}</span>
              </div>
              <Badge variant="outline" className="text-xs font-mono uppercase bg-background border-border">
                {patient.status}
              </Badge>
            </div>

            <div className="border border-border rounded-lg p-4 bg-card space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  Latest Consultation Note
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {patient.createdAt ? patient.createdAt.split('T')[0] : 'Today'}
                </span>
              </div>

              <div className="space-y-2.5 text-muted-foreground leading-relaxed pt-1 text-xs">
                <div>
                  <span className="font-semibold text-foreground">Chief Complaint: </span>
                  {encounter.chiefComplaint}
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border">
                  <strong className="text-foreground font-semibold block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    S — Subjective
                  </strong>
                  {encounter.subjective}
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border">
                  <strong className="text-foreground font-semibold block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    O — Objective
                  </strong>
                  {encounter.objective}
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border">
                  <strong className="text-foreground font-semibold block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    A — Assessment
                  </strong>
                  {encounter.assessment}
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border">
                  <strong className="text-foreground font-semibold block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    P — Plan
                  </strong>
                  {encounter.plan}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Demographics & Contacts */}
          <TabsContent value="demographics" className="space-y-3 pt-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-muted/40 rounded-lg border border-border space-y-2">
                <div className="font-medium text-foreground flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  <span>Contact Information</span>
                </div>
                <div className="text-muted-foreground space-y-1.5 pt-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">Primary Phone: </span>
                    <span className="font-mono text-foreground font-medium">{patient.phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Emergency Contact: </span>
                    <span className="text-foreground">{patient.emergencyContact || 'None on file'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-muted/40 rounded-lg border border-border space-y-2">
                <div className="font-medium text-foreground flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span>Demographic Profile</span>
                </div>
                <div className="text-muted-foreground space-y-1.5 pt-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">Sex at Birth: </span>
                    <span className="text-foreground">{patient.gender}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Age: </span>
                    <span className="text-foreground">{patient.age} years</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date of Birth: </span>
                    <span className="font-mono text-foreground">{patient.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Blood Group: </span>
                    <span className="font-mono font-semibold text-foreground">{patient.bloodType || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-lg border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span className="text-foreground">Hospital Master Patient Index Record</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                Enrolled: {patient.createdAt ? patient.createdAt.split('T')[0] : 'Active'}
              </span>
            </div>
          </TabsContent>

          {/* TAB 3: Vitals & Alerts */}
          <TabsContent value="vitals" className="space-y-3 pt-3 text-sm">
            {/* Allergies Alert */}
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold">Documented Allergies: </span>
                  {patient.allergies.join(', ')}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-muted/40 border border-border rounded-lg text-muted-foreground text-xs flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500"></span>
                <span>No known drug allergies (NKDA) documented.</span>
              </div>
            )}

            {/* Baseline Vitals Grid */}
            <div className="border border-border rounded-lg p-4 bg-card space-y-3.5 shadow-xs">
              <div className="font-semibold text-foreground flex items-center justify-between border-b border-border pb-2.5">
                <span>Baseline Clinical Vitals</span>
                <span className="text-xs text-muted-foreground font-normal">Triage Recorded</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/40 border border-border text-center">
                  <div className="text-xs text-muted-foreground font-medium uppercase">Blood Pressure</div>
                  <div className="text-base font-bold font-mono text-foreground mt-1">120/80</div>
                  <div className="text-xs text-muted-foreground">mmHg</div>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border text-center">
                  <div className="text-xs text-muted-foreground font-medium uppercase">Heart Rate</div>
                  <div className="text-base font-bold font-mono text-foreground mt-1">72</div>
                  <div className="text-xs text-muted-foreground">bpm</div>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border text-center">
                  <div className="text-xs text-muted-foreground font-medium uppercase">Oxygen (SpO2)</div>
                  <div className="text-base font-bold font-mono text-foreground mt-1">98%</div>
                  <div className="text-xs text-muted-foreground">Room air</div>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border text-center">
                  <div className="text-xs text-muted-foreground font-medium uppercase">Temperature</div>
                  <div className="text-base font-bold font-mono text-foreground mt-1">98.6°F</div>
                  <div className="text-xs text-muted-foreground">Oral</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-3.5 border-t border-border flex items-center justify-between sm:justify-between">
          <span className="text-xs text-muted-foreground font-mono">
            Record ID: {patient.id}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs cursor-pointer"
          >
            Close Chart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
