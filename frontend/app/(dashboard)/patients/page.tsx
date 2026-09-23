'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  Search,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { PatientTable } from './_components/patient-table';
import { PatientKpiGrid } from './_components/patient-kpi-grid';
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
  const [, startTransition] = useTransition();

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
    <div className="w-full space-y-6">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
          <div
            className={`p-4 rounded-xl border shadow-lg flex items-center justify-between bg-card text-card-foreground ${
              toastMessage.type === 'success'
                ? 'border-emerald-500/30'
                : 'border-destructive/30'
            }`}
          >
            <div className="flex items-center gap-3 text-sm font-medium">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              )}
              <span>{toastMessage.text}</span>
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

      {/* 1. COMMAND HEADER & ACTION STRIP */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Patient Admissions & Registry
          </h1>
          <p className="text-sm text-muted-foreground">
            Enterprise patient directory, clinical intake records, and demographic registry.
          </p>
        </div>

        {/* Global Action Group */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCommandOpen(true)}
            className="gap-2 text-sm text-muted-foreground hover:text-foreground h-10 px-3.5 border-border shadow-none cursor-pointer"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline">Search records</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-10 text-sm gap-2 px-3.5 border-border shadow-none text-muted-foreground hover:text-foreground"
          >
            <Link href="/appointments">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Calendar</span>
            </Link>
          </Button>

          <Button
            onClick={() => setIsRegisterModalOpen(true)}
            size="sm"
            className="gap-2 h-10 px-4 cursor-pointer active:scale-[0.98] transition-transform bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Walk-In</span>
          </Button>
        </div>
      </div>

      {/* 2. TIER 1: HERO OPERATIONAL METRICS STRIP (SHADCN DASHBOARD-01 SECTION-CARDS 1:1) */}
      <PatientKpiGrid
        totalPatients={patients.length}
        activeCount={activeCount}
        inConsultCount={inConsultCount}
        dischargedCount={dischargedCount}
      />

      {/* 3. TIER 2: PRIMARY PATIENT DIRECTORY WORKLIST CARD */}
      <Card className="shadow-xs border-border">
        <CardHeader className="py-5 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <span>Patient Directory</span>
                <Badge variant="outline" className="font-mono text-xs font-medium text-muted-foreground px-2 py-0.5">
                  {filteredPatients.length} records
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Master electronic medical records, demographic profiles, and clinical charts.
              </CardDescription>
            </div>
          </div>

          {/* Unified Command Toolbar: Search Bar + Status Tabs + Blood Group Filter */}
          <div className="pt-3.5 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter directory by patient name, MRN, clinician, or phone..."
                className="pl-10 pr-16 h-10 text-sm border-border bg-background shadow-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => setIsCommandOpen(true)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 rounded border border-border bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Open Command Palette (⌘K)"
              >
                ⌘K
              </button>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
              <Tabs
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val as any)}
                className="w-auto shrink-0"
              >
                <TabsList className="h-10 bg-muted p-1 border border-border">
                  <TabsTrigger value="ALL" className="text-sm px-3.5 py-1.5 font-medium">
                    All ({patients.length})
                  </TabsTrigger>
                  <TabsTrigger value="Active" className="text-sm px-3.5 py-1.5 font-medium">
                    Active ({activeCount})
                  </TabsTrigger>
                  <TabsTrigger value="In Consult" className="text-sm px-3.5 py-1.5 font-medium">
                    In Consult ({inConsultCount})
                  </TabsTrigger>
                  <TabsTrigger value="Discharged" className="text-sm px-3.5 py-1.5 font-medium">
                    Discharged ({dischargedCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="w-full sm:w-44 shrink-0">
                <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                  <SelectTrigger className="h-10 text-sm border-border bg-background shadow-none">
                    <SelectValue placeholder="All Blood Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ALL" className="text-sm">All Blood Types</SelectItem>
                      <SelectItem value="A+" className="text-sm">Blood Group A+</SelectItem>
                      <SelectItem value="A-" className="text-sm">Blood Group A-</SelectItem>
                      <SelectItem value="B+" className="text-sm">Blood Group B+</SelectItem>
                      <SelectItem value="B-" className="text-sm">Blood Group B-</SelectItem>
                      <SelectItem value="AB+" className="text-sm">Blood Group AB+</SelectItem>
                      <SelectItem value="AB-" className="text-sm">Blood Group AB-</SelectItem>
                      <SelectItem value="O+" className="text-sm">Blood Group O+</SelectItem>
                      <SelectItem value="O-" className="text-sm">Blood Group O-</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-10 text-xs text-muted-foreground hover:text-foreground gap-1.5 px-3 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* WORKLIST TABLE: 100% NATIVE SHADCN DATA-TABLE */}
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
