'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  Search,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Users,
  Activity,
  Stethoscope,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { PatientTable } from './_components/patient-table';
import { PatientRegistrationModal } from './_components/patient-registration-modal';
import { PatientChartModal } from './_components/patient-chart-modal';
import { CommandMenu } from '@/components/command-menu';
import { fetchPatients, createPatient } from '@/lib/api';
import { Patient, CreatePatientInput } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'In Consult' | 'Discharged'>('ALL');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedChartPatient, setSelectedChartPatient] = useState<Patient | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadPatients = async (search?: string, bloodType?: string) => {
    const data = await fetchPatients(search, bloodType === 'ALL' ? undefined : bloodType);
    setPatients(data);
  };

  useEffect(() => {
    loadPatients(searchQuery, bloodTypeFilter);
  }, [searchQuery, bloodTypeFilter]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleRegisterPatient = async (input: CreatePatientInput) => {
    const res = await createPatient(input);
    if (res.success && res.data) {
      showToast(
        'success',
        `Walk-in patient ${res.data.fullName} registered into hospital database (${res.data.mrn}).`,
      );
      startTransition(() => {
        loadPatients(searchQuery, bloodTypeFilter);
      });
      return { success: true };
    } else {
      showToast('error', res.error || 'Failed to register patient in hospital registry.');
      return { success: false, error: res.error };
    }
  };

  // Metrics counts
  const activeCount = patients.filter((p) => p.status === 'Active').length;
  const inConsultCount = patients.filter((p) => p.status === 'In Consult').length;
  const dischargedCount = patients.filter((p) => p.status === 'Discharged').length;

  // Filtered patients
  const filteredPatients = patients.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    return true;
  });

  const hasActiveFilters = searchQuery.trim() !== '' || bloodTypeFilter !== 'ALL' || statusFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setBloodTypeFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Floating Toast Notification (Zero Layout Shift) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
          <div
            className={`p-3.5 rounded-xl border shadow-lg flex items-center justify-between bg-white ${
              toastMessage.type === 'success'
                ? 'border-emerald-200/90 text-slate-900'
                : 'border-red-200/90 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-xs font-medium text-slate-400 hover:text-slate-700 ml-3 cursor-pointer p-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 1. COMMAND HEADER (Exact match to Front Desk Overview) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Patient Admissions & Registry
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Master Patient Index
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Enterprise patient directory, clinical intake records, and demographic registry.
          </p>
        </div>

        {/* Global Action Group */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCommandOpen(true)}
            className="gap-2 text-xs text-slate-600 hover:text-slate-900 h-9 px-3 border-slate-200 shadow-2xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search records</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500">
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 text-xs gap-1.5 border-slate-200 shadow-2xs"
          >
            <Link href="/appointments">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Calendar</span>
            </Link>
          </Button>

          <Button
            onClick={() => setIsRegisterModalOpen(true)}
            size="sm"
            className="gap-1.5 shadow-xs bg-blue-600 hover:bg-blue-700 text-white h-9 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Walk-In</span>
          </Button>
        </div>
      </div>

      {/* 2. OPERATIONAL METRICS STRIP (Exact match to Front Desk Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Total Registered</div>
              <div className="text-xs text-slate-700 font-medium mt-0.5">
                Master Patient Index
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-slate-900">{patients.length}</span>
            <span className="block text-[10px] font-mono text-blue-700">Enrolled</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Active in Clinic</div>
              <div className="text-xs text-slate-700 font-medium mt-0.5">
                {activeCount === 0 ? 'No active intake' : `${activeCount} patients in triage`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-slate-900">{activeCount}</span>
            <span className="block text-[10px] font-mono text-emerald-700">In waiting</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 flex-shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">In Consultation</div>
              <div className="text-xs text-slate-700 font-medium mt-0.5">
                Active examination
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-slate-900">{inConsultCount}</span>
            <span className="block text-[10px] font-mono text-purple-700">With physician</span>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY PATIENT DIRECTORY WORKLIST CARD (Exact match to Admissions & Triage Queue) */}
      <Card className="shadow-2xs border-slate-200/80">
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Patient Directory</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {filteredPatients.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Master electronic medical records, demographic profiles, and clinical charts.
              </CardDescription>
            </div>

            {/* Linear-Style Segmented Tabs */}
            <Tabs
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as any)}
              className="w-auto"
            >
              <TabsList className="h-8 bg-slate-100/90 p-0.5 border border-slate-200/60">
                <TabsTrigger value="ALL" className="text-xs px-2.5 py-1">
                  All <span className="ml-1 text-[10px] font-mono text-slate-500">({patients.length})</span>
                </TabsTrigger>
                <TabsTrigger value="Active" className="text-xs px-2.5 py-1">
                  Active <span className="ml-1 text-[10px] font-mono text-emerald-700 font-semibold">({activeCount})</span>
                </TabsTrigger>
                <TabsTrigger value="In Consult" className="text-xs px-2.5 py-1">
                  In Consult <span className="ml-1 text-[10px] font-mono text-purple-700">({inConsultCount})</span>
                </TabsTrigger>
                <TabsTrigger value="Discharged" className="text-xs px-2.5 py-1">
                  Discharged <span className="ml-1 text-[10px] font-mono text-slate-600">({dischargedCount})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Integrated Search & Blood Type Filter Bar */}
          <div className="pt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter directory by patient name, MRN, clinician, or phone..."
                className="pl-9 pr-14 h-9 text-xs border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setIsCommandOpen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                title="Open Command Palette (⌘K)"
              >
                ⌘K
              </button>
            </div>

            <div className="w-full sm:w-44">
              <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                  <SelectValue placeholder="All Blood Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ALL" className="text-xs">All Blood Types</SelectItem>
                    <SelectItem value="A+" className="text-xs">Blood Group A+</SelectItem>
                    <SelectItem value="A-" className="text-xs">Blood Group A-</SelectItem>
                    <SelectItem value="B+" className="text-xs">Blood Group B+</SelectItem>
                    <SelectItem value="B-" className="text-xs">Blood Group B-</SelectItem>
                    <SelectItem value="AB+" className="text-xs">Blood Group AB+</SelectItem>
                    <SelectItem value="AB-" className="text-xs">Blood Group AB-</SelectItem>
                    <SelectItem value="O+" className="text-xs">Blood Group O+</SelectItem>
                    <SelectItem value="O-" className="text-xs">Blood Group O-</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 text-xs text-slate-500 hover:text-slate-800 gap-1 px-2.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </CardHeader>

        {/* WORKLIST TABLE: 100% NATIVE SHADCN TABLE (Zero Truncation, Full Data Visibility) */}
        <CardContent className="p-0">
          <PatientTable
            patients={filteredPatients}
            onViewChart={(patient) => setSelectedChartPatient(patient)}
          />
        </CardContent>
      </Card>

      {/* Command Palette */}
      <CommandMenu
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        onSelectPatient={(patient) => setSelectedChartPatient(patient)}
        onRegisterWalkIn={() => setIsRegisterModalOpen(true)}
      />

      {/* Registration Modal */}
      <PatientRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterPatient}
      />

      {/* Patient Chart Modal */}
      <PatientChartModal
        patient={selectedChartPatient}
        onClose={() => setSelectedChartPatient(null)}
      />
    </div>
  );
}
