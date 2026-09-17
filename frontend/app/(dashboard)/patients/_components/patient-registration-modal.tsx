'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Loader2,
  UserPlus,
  User,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Check,
  Calendar,
  Stethoscope,
  Heart,
} from 'lucide-react';
import { CreatePatientInput, Gender, BloodType } from '../../../../types';
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
import { PHYSICIAN_PRESETS } from '@/lib/api';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreatePatientInput) => Promise<{ success: boolean; error?: string }>;
}

const COMMON_ALLERGY_PRESETS = [
  'NKDA',
  'Penicillin',
  'Sulfa Drugs',
  'Latex',
  'Aspirin / NSAIDs',
  'Codeine',
];

export function PatientRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
}: PatientRegistrationModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender>('Female');
  const [bloodType, setBloodType] = useState<BloodType>('O+');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [physician, setPhysician] = useState(PHYSICIAN_PRESETS[0]?.name || 'Dr. Sarah Chen, MD');
  const [allergies, setAllergies] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setDateOfBirth('');
    setGender('Female');
    setBloodType('O+');
    setPhoneNumber('');
    setNationalId('');
    setPhysician(PHYSICIAN_PRESETS[0]?.name || 'Dr. Sarah Chen, MD');
    setAllergies('');
    setEmergencyContact('');
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleAllergyPreset = (preset: string) => {
    if (preset === 'NKDA') {
      setAllergies((prev) => (prev.includes('NKDA') ? '' : 'NKDA'));
      return;
    }

    const currentList = allergies
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s !== 'NKDA');

    if (currentList.includes(preset)) {
      const next = currentList.filter((s) => s !== preset);
      setAllergies(next.join(', '));
    } else {
      const next = [...currentList, preset];
      setAllergies(next.join(', '));
    }
  };

  const isAllergySelected = (preset: string) => {
    if (preset === 'NKDA') {
      return allergies.trim().toLowerCase() === 'nkda';
    }
    return allergies
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .includes(preset.toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim() || !dateOfBirth) {
      setErrorMessage('Legal First Name, Last Name, and Date of Birth are required.');
      return;
    }

    setLoading(true);
    try {
      const result = await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        gender,
        bloodType,
        nationalId: nationalId.trim() || undefined,
        phoneNumber: phoneNumber.trim() || '(555) 000-0000',
        primaryPhysician: physician,
        knownAllergies: allergies.trim()
          ? allergies
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        emergencyContactName: emergencyContact.trim() || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to register patient in hospital registry.');
      } else {
        handleClose();
      }
    } catch {
      setErrorMessage('Network error communicating with CareSync API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto p-6">
        {/* Header with Icon and Clinical Badge */}
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs flex-shrink-0">
              <UserPlus className="size-4.5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-semibold text-slate-900">
                  Register Walk-In Patient
                </DialogTitle>
                <Badge variant="outline" className="text-[10px] font-mono text-blue-700 bg-blue-50/60 border-blue-200">
                  MPI Intake
                </Badge>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Record demographic profile and assign attending physician for outpatient admission.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Validation Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="size-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Form Body with Grouped Panels */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-1">
          {/* Group 1: Demographic Profile */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <User className="size-3.5 text-slate-500" />
                <span>Demographic & Identity</span>
              </div>
              <span className="text-[11px] text-slate-400">Legal records</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Eleanor"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Vance"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sex at Birth <span className="text-rose-500">*</span>
                </label>
                <Select value={gender} onValueChange={(val) => setGender(val as Gender)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Other / Intersex">Other / Intersex</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Blood Group
                </label>
                <Select value={bloodType} onValueChange={(val) => setBloodType(val as BloodType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="O+">O Positive (O+)</SelectItem>
                      <SelectItem value="A+">A Positive (A+)</SelectItem>
                      <SelectItem value="B+">B Positive (B+)</SelectItem>
                      <SelectItem value="AB+">AB Positive (AB+)</SelectItem>
                      <SelectItem value="O-">O Negative (O-)</SelectItem>
                      <SelectItem value="A-">A Negative (A-)</SelectItem>
                      <SelectItem value="B-">B Negative (B-)</SelectItem>
                      <SelectItem value="AB-">AB Negative (AB-)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Attending Clinician
                </label>
                <Select value={physician} onValueChange={setPhysician}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select physician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PHYSICIAN_PRESETS.map((doc) => (
                        <SelectItem key={doc.id} value={doc.name}>
                          {doc.name} ({doc.specialty})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Group 2: Contact & Verification */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <Phone className="size-3.5 text-slate-500" />
                <span>Contact & Verification</span>
              </div>
              <span className="text-[11px] text-slate-400">Emergency dispatch</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Phone
                </label>
                <Input
                  type="tel"
                  placeholder="(555) 349-8201"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  National ID / SSN
                </label>
                <Input
                  type="text"
                  placeholder="999-00-1234"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Emergency Contact & Relation
              </label>
              <Input
                type="text"
                placeholder="e.g. Thomas Vance (Spouse) — (555) 349-8209"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
            </div>
          </div>

          {/* Group 3: Clinical Alerts & Known Allergies */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <AlertTriangle className="size-3.5 text-amber-500" />
                <span>Clinical Alerts & Known Allergies</span>
              </div>
              <span className="text-[11px] text-slate-400">Triage safety</span>
            </div>

            {/* Quick 1-Click Allergy Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] text-slate-400 mr-1">Quick Select:</span>
              {COMMON_ALLERGY_PRESETS.map((preset) => {
                const selected = isAllergySelected(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => toggleAllergyPreset(preset)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                      selected
                        ? preset === 'NKDA'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {selected && <Check className="size-3" />}
                    <span>{preset}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <Input
                type="text"
                placeholder="Enter or customize allergies (e.g. Penicillin, Sulfa)..."
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Select from quick presets or type specific allergens separated by commas.
              </span>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between sm:justify-between">
            <span className="text-[11px] text-slate-400">
              Fields with <span className="text-rose-500 font-bold">*</span> are required for EHR index
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={handleClose}
                className="h-8.5 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="h-8.5 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
              >
                {loading && <Loader2 className="size-3.5 animate-spin" />}
                <span>Register Patient</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
