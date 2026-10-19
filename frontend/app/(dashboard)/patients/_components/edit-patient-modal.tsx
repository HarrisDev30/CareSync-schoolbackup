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
  User,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Loader2,
  Check,
  Calendar,
  Stethoscope,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Patient, UpdatePatientInput, Gender, BloodType, PatientStatus } from '@/types';
import { updatePatient, PHYSICIAN_PRESETS } from '@/lib/api';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onPatientUpdated: (updated: Patient) => void;
}

const COMMON_ALLERGY_PRESETS = [
  'NKDA',
  'Penicillin',
  'Sulfa Drugs',
  'Latex',
  'Aspirin / NSAIDs',
  'Codeine',
  'ACE Inhibitors',
  'Beta-Blockers',
];

export function EditPatientModal({
  isOpen,
  onClose,
  patient,
  onPatientUpdated,
}: EditPatientModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender>('Female');
  const [bloodType, setBloodType] = useState<BloodType>('O+');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [primaryPhysician, setPrimaryPhysician] = useState(PHYSICIAN_PRESETS[0]?.name || 'Dr. Sarah Chen, MD');
  const [status, setStatus] = useState<PatientStatus>('Active');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [allergiesList, setAllergiesList] = useState<string[]>([]);
  const [customAllergyInput, setCustomAllergyInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (patient) {
      setFirstName(patient.firstName || patient.fullName.split(' ')[0] || '');
      setLastName(patient.lastName || patient.fullName.split(' ').slice(1).join(' ') || '');
      setDateOfBirth(patient.dateOfBirth || '1985-06-15');
      setGender(patient.gender || 'Female');
      setBloodType(patient.bloodType || 'O+');
      setPhoneNumber(patient.phone || '');
      setPrimaryPhysician(patient.primaryPhysician || PHYSICIAN_PRESETS[0]?.name || 'Dr. Sarah Chen, MD');
      setStatus(patient.status || 'Active');
      setEmergencyContact(patient.emergencyContact || '');
      setAllergiesList(patient.allergies || []);
      setErrorMessage(null);
    }
  }, [patient]);

  const toggleAllergyPreset = (preset: string) => {
    if (preset === 'NKDA') {
      if (allergiesList.includes('NKDA')) {
        setAllergiesList([]);
      } else {
        setAllergiesList(['NKDA']);
      }
      return;
    }

    setAllergiesList((prev) => {
      const filtered = prev.filter((a) => a !== 'NKDA');
      if (filtered.includes(preset)) {
        return filtered.filter((a) => a !== preset);
      } else {
        return [...filtered, preset];
      }
    });
  };

  const handleAddCustomAllergy = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customAllergyInput.trim()) {
      e.preventDefault();
      const val = customAllergyInput.trim();
      if (!allergiesList.includes(val)) {
        setAllergiesList((prev) => [...prev.filter((a) => a !== 'NKDA'), val]);
      }
      setCustomAllergyInput('');
    }
  };

  const removeAllergy = (tag: string) => {
    setAllergiesList((prev) => prev.filter((a) => a !== tag));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Legal First Name and Last Name are required.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const input: UpdatePatientInput = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        gender,
        bloodType,
        phone: phoneNumber.trim(),
        primaryPhysician,
        status,
        emergencyContact: emergencyContact.trim(),
        allergies: allergiesList,
      };

      const res = await updatePatient(patient.id, input);
      if (res.success && res.data) {
        onPatientUpdated(res.data);
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to update patient demographic record.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error saving patient updates.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-0 bg-card text-card-foreground border-border overflow-hidden shadow-2xl">
        <DialogHeader className="p-5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Edit Patient Demographics & Profile
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Update clinical contact info, attending physician, and known drug allergies for{' '}
                <strong className="font-mono text-foreground">{patient?.mrn}</strong>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="px-5 py-2.5 bg-destructive/10 border-b border-destructive/20 text-destructive text-xs flex items-center gap-2 font-medium shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Identity & Legal Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-medium text-foreground flex items-center gap-1.5">
                Legal First Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="h-10 text-xs bg-background border-border"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground flex items-center gap-1.5">
                Legal Last Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="h-10 text-xs bg-background border-border"
                required
              />
            </div>
          </div>

          {/* Demographics Strip: DOB, Gender, Blood Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="font-medium text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Date of Birth
              </label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="h-10 text-xs font-mono bg-background border-border"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground flex items-center gap-1.5">
                Gender Identity
              </label>
              <Select value={gender} onValueChange={(val: Gender) => setGender(val)}>
                <SelectTrigger className="h-10 text-xs bg-background border-border w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Other / Intersex">Other / Intersex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                Blood Group
              </label>
              <Select value={bloodType} onValueChange={(val: BloodType) => setBloodType(val)}>
                <SelectTrigger className="h-10 text-xs font-mono bg-background border-border w-full">
                  <SelectValue placeholder="Blood group" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border font-mono">
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodType[]).map((bt) => (
                    <SelectItem key={bt} value={bt}>
                      {bt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact & Primary Physician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-medium text-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                Primary Phone Number
              </label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(555) 000-0000"
                className="h-10 text-xs font-mono bg-background border-border"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-primary" />
                Primary Attending Physician
              </label>
              <Select value={primaryPhysician} onValueChange={setPrimaryPhysician}>
                <SelectTrigger className="h-10 text-xs bg-background border-border w-full">
                  <SelectValue placeholder="Select physician" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {PHYSICIAN_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name} ({p.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Emergency Contact & Patient Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-medium text-foreground flex items-center gap-1.5">
                Emergency Contact (Name & Phone)
              </label>
              <Input
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. Rachel Vance (Sister) — +1 (555) 349-8202"
                className="h-10 text-xs bg-background border-border"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground flex items-center gap-1.5">
                Admission / Clinical Status
              </label>
              <Select value={status} onValueChange={(val: PatientStatus) => setStatus(val)}>
                <SelectTrigger className="h-10 text-xs bg-background border-border w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Active">Active (Outpatient Roster)</SelectItem>
                  <SelectItem value="In Consult">In Consult (Exam Room)</SelectItem>
                  <SelectItem value="Discharged">Discharged (Archive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Known Drug Allergies (Critical for CDS Engine) */}
          <div className="space-y-2 p-3.5 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Known Drug Allergies & Hypersensitivities
              </label>
              <span className="text-[11px] text-muted-foreground">
                Drives real-time CDS contraindication blocks
              </span>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ALLERGY_PRESETS.map((preset) => {
                const isSelected = allergiesList.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => toggleAllergyPreset(preset)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? preset === 'NKDA'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                        : 'bg-background text-muted-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{preset}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected custom tags & input */}
            <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
              {allergiesList.map((alg) => (
                <Badge
                  key={alg}
                  variant="outline"
                  className="gap-1 py-1 px-2 text-xs border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                >
                  <span>{alg}</span>
                  <button
                    type="button"
                    onClick={() => removeAllergy(alg)}
                    className="hover:text-destructive cursor-pointer ml-1 text-xs"
                    title="Remove allergy"
                  >
                    ✕
                  </button>
                </Badge>
              ))}

              <Input
                value={customAllergyInput}
                onChange={(e) => setCustomAllergyInput(e.target.value)}
                onKeyDown={handleAddCustomAllergy}
                placeholder="Type other allergy and press Enter..."
                className="h-8 text-xs bg-background border-border max-w-[240px]"
              />
            </div>
          </div>
        </form>

        <DialogFooter className="p-4 border-t border-border bg-muted/20 shrink-0 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-10 text-xs px-4 cursor-pointer border-border"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="h-10 text-xs px-5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-medium gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Patient Changes</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
