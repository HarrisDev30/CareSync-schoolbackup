'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  ShieldAlert,
  DoorOpen,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Appointment, HospitalRoom, RecordVitalSignsInput } from '@/types';
import { completeTriageIntake, fetchHospitalRooms } from '@/lib/api';

interface TriageIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSuccess: () => void;
}

const TRIAGE_NOTE_PRESETS = [
  'Patient alert & oriented x4. Denies acute distress.',
  'Mild tension headache. Afebrile, well-perfused.',
  'Follow-up intake. Compliant with morning medications.',
  'Mild exertional dyspnea. Clear lung sounds upon auscultation.',
  'Elevated BP noted; patient advised to sit calmly for consult.',
];

export function TriageIntakeModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: TriageIntakeModalProps) {
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [heartRate, setHeartRate] = useState('72');
  const [oxygenSaturation, setOxygenSaturation] = useState('98');
  const [temperature, setTemperature] = useState('36.8');
  const [respiratoryRate, setRespiratoryRate] = useState('16');
  const [weightKg, setWeightKg] = useState('68');
  const [painScore, setPainScore] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState('Exam Suite 1A');
  const [nurseNotes, setNurseNotes] = useState('');
  const [availableRooms, setAvailableRooms] = useState<HospitalRoom[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && appointment) {
      setSystolic('120');
      setDiastolic('80');
      setHeartRate('74');
      setOxygenSaturation('98');
      setTemperature('36.7');
      setRespiratoryRate('16');
      setWeightKg('68.5');
      setPainScore(0);
      setNurseNotes(`Triage intake for ${appointment.reason || 'Routine Consultation'}. Patient ambulating without assistance.`);
      setErrorMsg(null);

      fetchHospitalRooms().then((rooms) => {
        setAvailableRooms(rooms);
        if (appointment.roomNumber) {
          setSelectedRoom(appointment.roomNumber);
        } else {
          const avail = rooms.find((r) => r.status === 'AVAILABLE');
          setSelectedRoom(avail ? avail.roomNumber : 'Exam Suite 1A');
        }
      });
    }
  }, [isOpen, appointment]);

  if (!appointment) return null;

  const numSystolic = parseInt(systolic, 10) || 120;
  const numDiastolic = parseInt(diastolic, 10) || 80;
  const numSpO2 = parseInt(oxygenSaturation, 10) || 98;
  const numTemp = parseFloat(temperature) || 36.8;

  // Real-time clinical evaluation indicators
  const isBPHigh = numSystolic >= 140 || numDiastolic >= 90;
  const isHypoxic = numSpO2 < 95;
  const isFebrile = numTemp >= 38.0;

  const getPainScoreColor = (score: number) => {
    if (score === 0) return 'text-muted-foreground border-border bg-muted/40';
    if (score <= 3) return 'text-emerald-700 dark:text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
    if (score <= 6) return 'text-amber-700 dark:text-amber-300 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-700 dark:text-rose-300 border-rose-500/40 bg-rose-500/10 font-bold';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const vitalsInput: RecordVitalSignsInput = {
      patientId: appointment.patientId,
      systolic: numSystolic,
      diastolic: numDiastolic,
      heartRate: parseInt(heartRate, 10) || 72,
      oxygenSaturation: numSpO2,
      temperature: numTemp,
      respiratoryRate: parseInt(respiratoryRate, 10) || 16,
      weightKg: parseFloat(weightKg) || undefined,
      painScore,
      notes: nurseNotes,
      recordedBy: 'Nurse Chloe Bennett, RN',
    };

    const res = await completeTriageIntake(
      appointment.patientId,
      appointment.id,
      vitalsInput,
      selectedRoom,
    );

    setIsSubmitting(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to complete triage intake.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Activity className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Clinical Triage & Vitals Intake Station
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Record baseline objective vital signs, NRS pain assessment, and route patient to suite.
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-1">
              Station A-1
            </Badge>
          </div>
        </DialogHeader>

        {/* Patient Identity Strip */}
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Patient:</span>{' '}
            <strong className="text-foreground text-sm font-bold">{appointment.patientName}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">MRN:</span>{' '}
            <span className="font-mono font-semibold">{appointment.mrn}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Attending MD:</span>{' '}
            <strong className="text-foreground">{appointment.physicianName}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">Chief Reason:</span>{' '}
            <span className="text-foreground">{appointment.reason}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* 1. VITAL SIGNS METRICS GRID */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <span>Objective Vital Parameters</span>
              <span className="text-primary font-normal">(Hospital Standard Intake)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {/* Blood Pressure */}
              <div className={`p-3 rounded-xl border space-y-1.5 ${isBPHigh ? 'border-amber-500/50 bg-amber-500/5' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1">
                    <Heart className="size-3.5 text-rose-500" /> BP (mmHg)
                  </span>
                  {isBPHigh && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold">
                      STAGE 1 HTN
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="h-8 text-xs font-mono font-bold"
                    placeholder="Sys"
                    required
                  />
                  <span className="text-muted-foreground font-mono">/</span>
                  <Input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="h-8 text-xs font-mono font-bold"
                    placeholder="Dia"
                    required
                  />
                </div>
              </div>

              {/* Heart Rate */}
              <div className="p-3 rounded-xl border border-border bg-card space-y-1.5">
                <span className="font-semibold text-muted-foreground flex items-center gap-1">
                  <Activity className="size-3.5 text-emerald-500" /> Pulse (BPM)
                </span>
                <Input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="h-8 text-xs font-mono font-bold"
                  placeholder="72"
                  required
                />
              </div>

              {/* Oxygen Saturation */}
              <div className={`p-3 rounded-xl border space-y-1.5 ${isHypoxic ? 'border-rose-500/50 bg-rose-500/5' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1">
                    <Wind className="size-3.5 text-sky-500" /> SpO₂ (%)
                  </span>
                  {isHypoxic && (
                    <Badge variant="destructive" className="text-[9px] px-1 py-0 font-bold">
                      HYPOXIC
                    </Badge>
                  )}
                </div>
                <Input
                  type="number"
                  value={oxygenSaturation}
                  onChange={(e) => setOxygenSaturation(e.target.value)}
                  className="h-8 text-xs font-mono font-bold"
                  placeholder="98"
                  required
                />
              </div>

              {/* Temperature */}
              <div className={`p-3 rounded-xl border space-y-1.5 ${isFebrile ? 'border-rose-500/50 bg-rose-500/5' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1">
                    <Thermometer className="size-3.5 text-amber-500" /> Temp (°C)
                  </span>
                  {isFebrile && (
                    <Badge variant="destructive" className="text-[9px] px-1 py-0 font-bold">
                      FEBRILE
                    </Badge>
                  )}
                </div>
                <Input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="h-8 text-xs font-mono font-bold"
                  placeholder="36.8"
                  required
                />
              </div>

              {/* Respiratory Rate */}
              <div className="p-3 rounded-xl border border-border bg-card space-y-1.5">
                <span className="font-semibold text-muted-foreground">Resp. Rate (bpm)</span>
                <Input
                  type="number"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value)}
                  className="h-8 text-xs font-mono font-bold"
                  placeholder="16"
                  required
                />
              </div>

              {/* Weight */}
              <div className="p-3 rounded-xl border border-border bg-card space-y-1.5">
                <span className="font-semibold text-muted-foreground flex items-center gap-1">
                  <Scale className="size-3.5 text-muted-foreground" /> Weight (kg)
                </span>
                <Input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="h-8 text-xs font-mono font-bold"
                  placeholder="68.0"
                />
              </div>
            </div>
          </div>

          {/* 2. PAIN SCORE SLIDER (NRS 0–10) */}
          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground">Numeric Pain Rating Scale (NRS 0–10)</span>
                <p className="text-[11px] text-muted-foreground">Patient-reported clinical discomfort level.</p>
              </div>
              <Badge variant="outline" className={`text-xs font-mono font-bold px-2 py-0.5 ${getPainScoreColor(painScore)}`}>
                Score: {painScore} / 10
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground w-12">No Pain</span>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={painScore}
                onChange={(e) => setPainScore(parseInt(e.target.value, 10))}
                className="flex-1 accent-primary cursor-pointer h-2 bg-muted rounded-lg"
              />
              <span className="text-xs font-medium text-muted-foreground w-14 text-right">Worst Pain</span>
            </div>
          </div>

          {/* 3. TRIAGE NOTES & PRESETS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Triage Observation & Acuity Notes</label>
              <span className="text-[10px] text-muted-foreground">Appended to Permanent EHR</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TRIAGE_NOTE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNurseNotes(preset)}
                  className="px-2 py-0.5 rounded text-[11px] bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer transition-colors"
                >
                  + {preset.slice(0, 32)}...
                </button>
              ))}
            </div>
            <Textarea
              value={nurseNotes}
              onChange={(e) => setNurseNotes(e.target.value)}
              placeholder="Document patient ambulatory status, distress levels, and acute symptoms..."
              className="h-18 text-xs resize-none"
            />
          </div>

          {/* 4. DESTINATION EXAMINATION SUITE ROUTING */}
          <div className="p-3.5 rounded-xl bg-muted/20 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <DoorOpen className="size-4 text-primary" />
                Assign Examination Suite for Physician Encounter
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {availableRooms.filter((r) => r.status === 'AVAILABLE').length} Suites Clean & Ready
              </Badge>
            </div>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue placeholder="Select examination room" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availableRooms.map((r) => (
                    <SelectItem key={r.id} value={r.roomNumber} className="text-xs">
                      {r.roomNumber} — {r.wing} ({r.status})
                    </SelectItem>
                  ))}
                  {!availableRooms.some((r) => r.roomNumber === selectedRoom) && (
                    <SelectItem value={selectedRoom} className="text-xs">
                      {selectedRoom} (Default)
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground font-mono">
              Observer: <strong>Nurse Chloe Bennett, RN</strong>
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-9 px-4 text-xs cursor-pointer w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 px-5 text-xs font-medium cursor-pointer gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Routing Patient...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Complete Triage & Call to Room</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

