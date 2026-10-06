'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Beaker,
  User,
  Stethoscope,
  Clock,
  AlertCircle,
  Loader2,
  Check,
  Search,
  ChevronsUpDown,
  X,
  FileText,
  Flame,
} from 'lucide-react';
import { Patient, DiagnosticPriority, CreateDiagnosticOrderInput } from '@/types';
import { PHYSICIAN_PRESETS, fetchPatients } from '@/lib/api';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface RequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSubmit: (input: CreateDiagnosticOrderInput) => Promise<{ success: boolean; error?: string }>;
}

export const DIAGNOSTIC_PANEL_PRESETS = [
  {
    name: 'Comprehensive Metabolic Panel (CMP)',
    category: 'General Chemistry',
    code: 'CPT-80053',
    description: 'Electrolytes, kidney function (eGFR, Creatinine), and liver enzymes.',
  },
  {
    name: 'Complete Blood Count (CBC) with Diff',
    category: 'Hematology',
    code: 'CPT-85025',
    description: 'WBC differential, hemoglobin, hematocrit, and platelet evaluation.',
  },
  {
    name: 'Lipid Profile & Atherogenic Risk Panel',
    category: 'Cardiovascular Chemistry',
    code: 'CPT-80061',
    description: 'Total cholesterol, HDL-C, direct LDL-C, and triglycerides.',
  },
  {
    name: 'Cardiac Troponin I (hs-cTnI High Sensitivity)',
    category: 'Cardiology Biomarkers',
    code: 'CPT-84484',
    description: 'Ultra-sensitive myocardial injury biomarker for acute chest pain evaluation.',
  },
  {
    name: 'Urinalysis with Microscopic Examination',
    category: 'Renal & Urology',
    code: 'CPT-81001',
    description: 'Specific gravity, protein, glucose, ketones, and microscopic sediment.',
  },
  {
    name: 'Serum Ferritin & Total Iron Binding Panel',
    category: 'Hematology / Metabolism',
    code: 'CPT-82728',
    description: 'Iron storage and transport indices for fatigue and anemia assessment.',
  },
  {
    name: 'Chest Radiography (PA & Lateral X-Ray)',
    category: 'Radiology / Imaging',
    code: 'CPT-71046',
    description: 'Dual-view thoracic imaging for pulmonary infiltrates and cardiomegaly.',
  },
];

export function RequisitionModal({
  isOpen,
  onClose,
  patients,
  onSubmit,
}: RequisitionModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedPhysicianId, setSelectedPhysicianId] = useState(PHYSICIAN_PRESETS[0]?.id || 'u-1');
  const [selectedPanel, setSelectedPanel] = useState(DIAGNOSTIC_PANEL_PRESETS[0].name);
  const [priority, setPriority] = useState<DiagnosticPriority>('ROUTINE');
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Scalable patient combobox state
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isPatientComboboxOpen, setIsPatientComboboxOpen] = useState(false);
  const [remotePatients, setRemotePatients] = useState<Patient[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);

  // Combine prop patients with remote search results
  const combinedPatients = useMemo(() => {
    const map = new Map<string, Patient>();
    for (const p of patients) {
      if (p && p.id) map.set(p.id, p);
    }
    for (const p of remotePatients) {
      if (p && p.id) map.set(p.id, p);
    }
    return Array.from(map.values());
  }, [patients, remotePatients]);

  const selectedPatient = useMemo(
    () => combinedPatients.find((p) => p.id === selectedPatientId) || combinedPatients[0],
    [combinedPatients, selectedPatientId],
  );

  const selectedPhysician = useMemo(
    () => PHYSICIAN_PRESETS.find((d) => d.id === selectedPhysicianId) || PHYSICIAN_PRESETS[0],
    [selectedPhysicianId],
  );

  const selectedPanelDetails = useMemo(
    () => DIAGNOSTIC_PANEL_PRESETS.find((p) => p.name === selectedPanel) || DIAGNOSTIC_PANEL_PRESETS[0],
    [selectedPanel],
  );

  // Initial selection sync
  useEffect(() => {
    if (!selectedPatientId && combinedPatients.length > 0) {
      setSelectedPatientId(combinedPatients[0].id);
    }
  }, [combinedPatients, selectedPatientId]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setPatientSearchQuery('');
      setIsPatientComboboxOpen(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Debounced server search across millions of records
  useEffect(() => {
    const trimmed = patientSearchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setIsSearchingRemote(false);
      return;
    }

    setIsSearchingRemote(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const results = await fetchPatients(trimmed);
        if (Array.isArray(results) && results.length > 0) {
          setRemotePatients((prev) => {
            const map = new Map<string, Patient>();
            for (const p of prev) map.set(p.id, p);
            for (const p of results) map.set(p.id, p);
            return Array.from(map.values());
          });
        }
      } catch {
        // Fall back gracefully to local filter
      } finally {
        setIsSearchingRemote(false);
      }
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [patientSearchQuery]);

  // High-performance search filtering (windowed to top 25 matches)
  const filteredPatients = useMemo(() => {
    const query = patientSearchQuery.trim().toLowerCase();
    if (!query) {
      return combinedPatients.slice(0, 20);
    }

    const cleanDigits = query.replace(/\D/g, '');

    const matches = combinedPatients.filter((p) => {
      const fullName = (p.fullName || '').toLowerCase();
      const mrn = (p.mrn || '').toLowerCase();
      const phone = (p.phone || '').toLowerCase();
      const dob = (p.dateOfBirth || '').toLowerCase();
      const blood = (p.bloodType || '').toLowerCase();

      if (fullName.includes(query)) return true;
      if (mrn.includes(query)) return true;
      if (dob.includes(query)) return true;
      if (blood === query) return true;
      if (phone.includes(query)) return true;
      if (cleanDigits.length >= 3 && phone.replace(/\D/g, '').includes(cleanDigits)) return true;

      return false;
    });

    matches.sort((a, b) => {
      const aName = (a.fullName || '').toLowerCase();
      const bName = (b.fullName || '').toLowerCase();
      const aMrn = (a.mrn || '').toLowerCase();
      const bMrn = (b.mrn || '').toLowerCase();

      if (aMrn === query && bMrn !== query) return -1;
      if (bMrn === query && aMrn !== query) return 1;
      if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
      if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
      return aName.localeCompare(bName);
    });

    return matches.slice(0, 25);
  }, [combinedPatients, patientSearchQuery]);

  const handleClose = () => {
    setErrorMessage(null);
    setIsPatientComboboxOpen(false);
    setPatientSearchQuery('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedPatient) {
      setErrorMessage('Please select a registered patient record.');
      return;
    }

    if (!clinicalIndication.trim()) {
      setErrorMessage('Clinical indication / diagnostic justification is required for test requisition.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmit({
        patientId: selectedPatient.id,
        testName: selectedPanel,
        testCategory: selectedPanelDetails.category,
        priority,
        clinicalIndication: clinicalIndication.trim(),
        physicianId: selectedPhysician.id,
        physicianName: selectedPhysician.name,
      });

      if (res.success) {
        handleClose();
      } else {
        setErrorMessage(res.error || 'Failed to dispatch diagnostic order.');
      }
    } catch {
      setErrorMessage('A network error occurred while dispatching the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto p-0 bg-card border-border shadow-2xl text-foreground">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Beaker className="size-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                New Diagnostic Test Requisition
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Issue a hospital laboratory or imaging order with priority triage and EHR linking.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Section 1: Patient & Ordering Clinician (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Scalable Patient Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  <span>Target Patient *</span>
                </label>
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                  EHR Live
                </span>
              </div>

              <Popover open={isPatientComboboxOpen} onOpenChange={setIsPatientComboboxOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    role="combobox"
                    aria-expanded={isPatientComboboxOpen}
                    aria-label="Select target patient"
                    className="w-full text-xs h-9 border border-border bg-background hover:bg-muted/40 focus:outline-none focus:ring-1 focus:ring-ring rounded-md px-2.5 flex items-center justify-between transition-colors shadow-none text-left cursor-pointer"
                  >
                    {selectedPatient ? (
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-semibold text-foreground truncate max-w-[140px]">
                          {selectedPatient.fullName}
                        </span>
                        <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/50 shrink-0">
                          {selectedPatient.mrn}
                        </span>
                        {selectedPatient.bloodType && (
                          <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline shrink-0">
                            • {selectedPatient.bloodType}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Search className="size-3.5" />
                        <span>Search patient by name, MRN, phone...</span>
                      </span>
                    )}
                    <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0 ml-1.5 opacity-60" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] min-w-[340px] sm:min-w-[400px] p-0 bg-popover dark:bg-card border-border shadow-2xl z-50 rounded-lg overflow-hidden"
                  align="start"
                  sideOffset={4}
                >
                  {/* Search Input Bar */}
                  <div className="flex items-center border-b border-border px-3 py-2 bg-muted/20">
                    <Search className="size-3.5 text-muted-foreground shrink-0 mr-2" />
                    <input
                      type="text"
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      placeholder="Search name, MRN, phone, or DOB..."
                      className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                      autoFocus
                    />
                    {isSearchingRemote && (
                      <Loader2 className="size-3.5 text-primary animate-spin shrink-0 ml-1 mr-1" />
                    )}
                    {patientSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setPatientSearchQuery('')}
                        className="text-muted-foreground hover:text-foreground shrink-0 ml-1 p-0.5 cursor-pointer"
                        title="Clear search"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Top Stats */}
                  <div className="flex items-center justify-between px-3 py-1 bg-muted/40 border-b border-border/40 text-[10px] text-muted-foreground font-mono">
                    <span>
                      {filteredPatients.length === 0
                        ? '0 records found'
                        : `Showing top ${filteredPatients.length} match${filteredPatients.length === 1 ? '' : 'es'}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                      Indexed EHR
                    </span>
                  </div>

                  {/* Results list */}
                  <div className="max-h-56 overflow-y-auto p-1 divide-y divide-border/20">
                    {filteredPatients.length === 0 ? (
                      <div className="py-6 px-4 text-center">
                        <AlertCircle className="size-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-medium text-foreground">No patient record found</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {patientSearchQuery
                            ? `No matches for "${patientSearchQuery}". Try full name or MRN.`
                            : 'No patient records available.'}
                        </p>
                      </div>
                    ) : (
                      filteredPatients.map((p) => {
                        const isSelected = selectedPatient?.id === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPatientId(p.id);
                              setIsPatientComboboxOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-md transition-colors flex items-center justify-between group cursor-pointer ${
                              isSelected
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'hover:bg-muted text-foreground'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                                  {p.fullName}
                                </span>
                                <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/50 text-foreground">
                                  {p.mrn}
                                </span>
                                {p.bloodType && (
                                  <span className="font-mono text-[10px] px-1 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-semibold">
                                    {p.bloodType}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                {p.gender && <span>{p.gender}</span>}
                                {p.dateOfBirth && (
                                  <>
                                    <span>•</span>
                                    <span>DOB: {p.dateOfBirth}</span>
                                  </>
                                )}
                                {p.phone && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono">{p.phone}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {isSelected && <Check className="size-4 text-primary shrink-0 ml-2" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Ordering Clinician */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Stethoscope className="size-3.5 text-muted-foreground" />
                  <span>Ordering Clinician *</span>
                </label>
                <span className="text-[10px] font-mono text-muted-foreground">Provider</span>
              </div>
              <Select value={selectedPhysicianId} onValueChange={setSelectedPhysicianId}>
                <SelectTrigger className="w-full text-xs h-9 border-border bg-background shadow-none">
                  <SelectValue placeholder="Select physician..." />
                </SelectTrigger>
                <SelectContent className="bg-popover dark:bg-card border-border shadow-2xl z-50">
                  <SelectGroup>
                    {PHYSICIAN_PRESETS.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id} className="text-xs">
                        {doc.name} — {doc.specialty}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section 2: Clinical Diagnostic Panel Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Beaker className="size-3.5 text-muted-foreground" />
                <span>Diagnostic Test Panel *</span>
              </label>
              <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                {selectedPanelDetails.code}
              </span>
            </div>

            <Select value={selectedPanel} onValueChange={setSelectedPanel}>
              <SelectTrigger className="w-full text-xs h-9 border-border bg-background shadow-none font-medium">
                <SelectValue placeholder="Select diagnostic panel..." />
              </SelectTrigger>
              <SelectContent className="bg-popover dark:bg-card border-border shadow-2xl z-50">
                <SelectGroup>
                  {DIAGNOSTIC_PANEL_PRESETS.map((panel) => (
                    <SelectItem key={panel.name} value={panel.name} className="text-xs">
                      {panel.name} ({panel.category})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Quick Panel Chips */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
              {DIAGNOSTIC_PANEL_PRESETS.map((panel) => {
                const isSelected = selectedPanel === panel.name;
                const shortLabel = panel.name.split('(')[0].trim();
                return (
                  <button
                    key={panel.name}
                    type="button"
                    onClick={() => setSelectedPanel(panel.name)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary font-semibold'
                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {isSelected && <Check className="size-2.5" />}
                    <span>{shortLabel}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground italic pt-0.5">
              {selectedPanelDetails.description}
            </p>
          </div>

          {/* Section 3: Clinical Priority Triaging (Segmented Controls) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                <span>Clinical Priority & Urgency *</span>
              </label>
              <span className="text-[10px] text-muted-foreground">Triage level</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('ROUTINE')}
                className={`py-2 px-3 rounded-lg border text-left cursor-pointer transition-all ${
                  priority === 'ROUTINE'
                    ? 'border-border bg-muted text-foreground ring-1 ring-border font-semibold shadow-xs'
                    : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/30'
                }`}
              >
                <div className="text-xs font-semibold text-foreground">Routine</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Standard turnaround (24-48 hrs)</div>
              </button>

              <button
                type="button"
                onClick={() => setPriority('URGENT')}
                className={`py-2 px-3 rounded-lg border text-left cursor-pointer transition-all ${
                  priority === 'URGENT'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500 font-semibold shadow-xs'
                    : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/30'
                }`}
              >
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">Urgent</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Same-day turnaround (4 hrs)</div>
              </button>

              <button
                type="button"
                onClick={() => setPriority('STAT')}
                className={`py-2 px-3 rounded-lg border text-left cursor-pointer transition-all ${
                  priority === 'STAT'
                    ? 'border-red-500/60 bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500 font-semibold shadow-xs'
                    : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/30'
                }`}
              >
                <div className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <Flame className="size-3 text-red-500" />
                  <span>STAT Critical</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Immediate run (&lt; 45 mins)</div>
              </button>
            </div>
          </div>

          {/* Section 4: Clinical Indication / Diagnostic Justification */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-muted-foreground" />
                <span>Clinical Indication / Reason for Requisition *</span>
              </label>
              <span className="text-[10px] text-muted-foreground">Chief complaint</span>
            </div>
            <Input
              type="text"
              required
              value={clinicalIndication}
              onChange={(e) => setClinicalIndication(e.target.value)}
              placeholder="e.g. Recurrent fatigue, suspected microcytic anemia, acute chest pain evaluation..."
              className="h-9 text-xs border-border bg-background text-foreground"
            />
          </div>

          {/* Footer */}
          <DialogFooter className="px-0 pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate max-w-sm">
              <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">
                Requisition for <span className="font-semibold text-foreground">{selectedPatient?.fullName}</span> •{' '}
                <span className="font-mono">{priority}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={handleClose}
                className="h-8.5 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-8.5 text-xs gap-1.5 cursor-pointer shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                <span>Dispatch Diagnostic Order</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
