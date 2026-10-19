'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Beaker,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Activity,
  Plus,
  Search,
  Users,
  Calendar,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FileCheck,
  AlertCircle,
  FlaskConical,
  Flame,
  Check,
  Loader2,
  Printer,
  XCircle,
  PhoneCall,
} from 'lucide-react';
import { LabOrder, DiagnosticPriority, DiagnosticStatus, Patient, CreateDiagnosticOrderInput, LabResultItem } from '@/types';
import {
  fetchLabOrders,
  fetchPatients,
  createDiagnosticOrder,
  updateDiagnosticOrderStatus,
  submitDiagnosticResult,
  verifyDiagnosticResult,
  reviewDiagnosticResult,
  triggerRecollectionRequisition,
} from '@/lib/api';
import { CommandMenu } from '@/components/command-menu';
import { DiagnosticReportExportModal } from '@/components/diagnostic-report-export-modal';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

import { LabsKpiGrid } from './_components/labs-kpi-grid';
import { RequisitionModal } from './_components/requisition-modal';
import { ResultsEntryModal } from './_components/results-entry-modal';
import { ResultsFindingsModal } from './_components/results-findings-modal';
import { SpecimenRejectionModal } from './_components/specimen-rejection-modal';
import { PanicCallModal } from './_components/panic-call-modal';

export default function LabsPage() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active modals
  const [selectedOrderForFindings, setSelectedOrderForFindings] = useState<LabOrder | null>(null);
  const [selectedOrderForEntry, setSelectedOrderForEntry] = useState<LabOrder | null>(null);
  const [orderToExport, setOrderToExport] = useState<LabOrder | null>(null);
  const [orderToReject, setOrderToReject] = useState<LabOrder | null>(null);
  const [orderForPanicCall, setOrderForPanicCall] = useState<LabOrder | null>(null);
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [labData, patData] = await Promise.all([
        fetchLabOrders(),
        fetchPatients(),
      ]);
      setOrders(labData);
      setPatients(patData);
    } catch {
      showToast('error', 'Failed to synchronize diagnostic laboratory data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleCreateRequisition = async (input: CreateDiagnosticOrderInput) => {
    const res = await createDiagnosticOrder(input);
    if (res.success && res.data) {
      setOrders((prev) => [res.data!, ...prev]);
      showToast('success', `Diagnostic order ${res.data.orderNumber} created for ${res.data.patientName}.`);
      return { success: true };
    }
    showToast('error', res.error || 'Failed to dispatch diagnostic order.');
    return { success: false, error: res.error };
  };

  const handleMarkCollected = async (order: LabOrder) => {
    const res = await updateDiagnosticOrderStatus(order.id, 'COLLECTED');
    if (res.success && res.data) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'COLLECTED' } : o)));
      showToast('success', `Specimen for order ${order.orderNumber} received in lab.`);
    } else {
      showToast('error', 'Failed to update collection status.');
    }
  };

  const handleSubmitFindings = async (orderId: string, findings: LabResultItem[], summary: string) => {
    const res = await submitDiagnosticResult(orderId, findings, summary);
    if (res.success && res.data) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data! : o)));
      showToast('success', `Laboratory findings recorded. Order transitioned to RESULTED.`);
      setSelectedOrderForEntry(null);
      return { success: true };
    }
    showToast('error', res.error || 'Failed to submit laboratory findings.');
    return { success: false, error: res.error };
  };

  const handleVerifyFindings = async (orderId: string) => {
    const res = await verifyDiagnosticResult(orderId);
    if (res.success && res.data) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data! : o)));
      setSelectedOrderForFindings(res.data);
      showToast('success', `Findings verified by Laboratory Supervisor and released to attending clinician.`);
      return { success: true };
    }
    return { success: false, error: 'Failed to verify findings.' };
  };

  const handleReviewFindings = async (orderId: string, notes: string) => {
    const res = await reviewDiagnosticResult(orderId, notes);
    if (res.success && res.data) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data! : o)));
      setSelectedOrderForFindings(res.data);
      showToast('success', `Diagnostic results marked as clinically reviewed by physician.`);
      return { success: true };
    }
    return { success: false, error: 'Failed to record physician review.' };
  };

  // Metrics for Top KPI Strip
  const statAndUrgentCount = useMemo(
    () => orders.filter((o) => o.priority === 'STAT' || o.priority === 'URGENT').length,
    [orders],
  );
  const inAnalysisCount = useMemo(
    () => orders.filter((o) => o.status === 'PROCESSING' || o.status === 'IN_ANALYSIS' || o.status === 'COLLECTED').length,
    [orders],
  );
  const verifiedCount = useMemo(
    () => orders.filter((o) => o.status === 'VERIFIED' || o.status === 'REVIEWED' || o.status === 'COMPLETED').length,
    [orders],
  );

  // Pipeline Stage Tab Counts
  const awaitingCount = useMemo(
    () => orders.filter((o) => o.status === 'ORDERED' || o.status === 'PENDING').length,
    [orders],
  );
  const inLabCount = useMemo(
    () => orders.filter((o) => o.status === 'PROCESSING' || o.status === 'IN_ANALYSIS' || o.status === 'COLLECTED').length,
    [orders],
  );
  const resultedCount = useMemo(
    () => orders.filter((o) => o.status === 'RESULTED').length,
    [orders],
  );
  const completedCount = useMemo(
    () => orders.filter((o) => o.status === 'VERIFIED' || o.status === 'REVIEWED' || o.status === 'COMPLETED').length,
    [orders],
  );

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.patientName.toLowerCase().includes(q) ||
        o.mrn.toLowerCase().includes(q) ||
        o.testName.toLowerCase().includes(q) ||
        o.requestedBy.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Stage Tabs
      if (activeTab === 'AWAITING') {
        if (o.status !== 'ORDERED' && o.status !== 'PENDING') return false;
      } else if (activeTab === 'IN_LAB') {
        if (o.status !== 'COLLECTED' && o.status !== 'PROCESSING' && o.status !== 'IN_ANALYSIS') return false;
      } else if (activeTab === 'RESULTED') {
        if (o.status !== 'RESULTED') return false;
      } else if (activeTab === 'COMPLETED') {
        if (o.status !== 'VERIFIED' && o.status !== 'REVIEWED' && o.status !== 'COMPLETED') return false;
      }

      // Priority Filter
      if (priorityFilter !== 'ALL' && o.priority !== priorityFilter) return false;

      // Department Category Filter
      if (categoryFilter !== 'ALL' && o.testCategory !== categoryFilter) return false;

      return true;
    });
  }, [orders, searchQuery, activeTab, priorityFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const hasActiveFilters = searchQuery.trim() !== '' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL' || activeTab !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setActiveTab('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
    setCurrentPage(1);
  };

  const renderPriorityBadge = (priority: DiagnosticPriority) => {
    switch (priority) {
      case 'STAT':
        return (
          <Badge
            variant="outline"
            className="border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[10px] py-0 px-1.5 gap-1 whitespace-nowrap shrink-0 shadow-2xs"
          >
            <span className="size-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <span>STAT</span>
          </Badge>
        );
      case 'URGENT':
        return (
          <Badge
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[10px] py-0 px-1.5 gap-1 whitespace-nowrap shrink-0"
          >
            <Clock className="size-2.5 text-amber-600 dark:text-amber-400" />
            <span>Urgent</span>
          </Badge>
        );
      case 'ROUTINE':
      default:
        return null;
    }
  };

  const renderStatusBadge = (status: DiagnosticStatus) => {
    switch (status) {
      case 'COMPLETED':
      case 'REVIEWED':
      case 'VERIFIED':
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium text-xs py-0.5 px-2 gap-1.5 whitespace-nowrap shrink-0"
          >
            <Check className="size-3" />
            <span>Completed</span>
          </Badge>
        );
      case 'RESULTED':
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium text-xs py-0.5 px-2 whitespace-nowrap shrink-0"
          >
            Results Entered
          </Badge>
        );
      case 'IN_ANALYSIS':
      case 'PROCESSING':
      case 'COLLECTED':
        return (
          <Badge
            variant="outline"
            className="border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 font-medium text-xs py-0.5 px-2 gap-1.5 whitespace-nowrap shrink-0"
          >
            <Activity className="size-3 animate-spin text-sky-600 dark:text-sky-400" />
            <span>In Lab Run</span>
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge
            variant="outline"
            className="border-destructive/30 bg-destructive/10 text-destructive font-medium text-xs py-0.5 px-2 gap-1.5 whitespace-nowrap shrink-0"
          >
            <AlertCircle className="size-3 text-destructive" />
            <span>Specimen Rejected</span>
          </Badge>
        );
      case 'ORDERED':
      case 'PENDING':
      default:
        return (
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium text-xs py-0.5 px-2 whitespace-nowrap shrink-0"
          >
            Awaiting Specimen
          </Badge>
        );
    }
  };

  return (
    <div className="w-full space-y-6 text-foreground">
      {/* Floating Toast Notification (Zero Layout Shift) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
          <div
            className={`p-3.5 rounded-xl border shadow-lg flex items-center justify-between bg-card text-foreground ${
              toastMessage.type === 'success'
                ? 'border-emerald-500/30'
                : 'border-destructive/30'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="size-4 text-destructive shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground ml-3 cursor-pointer p-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 1. COMMAND HEADER (Exact match to all dashboard pages) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Diagnostic Services & Lab Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            Clinical worklist, specimen tracking, priority triage, and verified laboratory findings.
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
            <Link href="/patients">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>Patients</span>
            </Link>
          </Button>

          <Button
            onClick={() => setIsRequisitionOpen(true)}
            size="sm"
            className="gap-2 h-10 px-4 cursor-pointer active:scale-[0.98] transition-transform bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>New Requisition</span>
          </Button>
        </div>
      </div>

      {/* 2. OPERATIONAL METRICS STRIP (Cohesive with Appointments KPI Grid) */}
      <LabsKpiGrid
        totalOrders={orders.length}
        statAndUrgentCount={statAndUrgentCount}
        inAnalysisCount={inAnalysisCount}
        verifiedCount={verifiedCount}
      />

      {/* 3. DIAGNOSTIC ORDERS WORKLIST CARD */}
      <Card className="shadow-xs border-border bg-card">
        <CardHeader className="py-5 px-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <span>Diagnostic Worklist</span>
                <Badge variant="outline" className="font-mono text-xs font-medium text-muted-foreground px-2 py-0.5">
                  {filteredOrders.length} orders
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Laboratory specimen pipeline, clinical analysis bench, and physician sign-off.
              </CardDescription>
            </div>
          </div>

          {/* 1. Pipeline Stage Navigation (Clean underline tabs, zero pill container) */}
          <div className="flex items-center gap-2 sm:gap-6 border-b border-border overflow-x-auto pt-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('ALL');
                setCurrentPage(1);
              }}
              className={`pb-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === 'ALL'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All Orders <span className="ml-1 text-xs opacity-70">({orders.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('AWAITING');
                setCurrentPage(1);
              }}
              className={`pb-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === 'AWAITING'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Awaiting Specimen <span className="ml-1 text-xs opacity-70">({awaitingCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('IN_LAB');
                setCurrentPage(1);
              }}
              className={`pb-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === 'IN_LAB'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              In Lab Run <span className="ml-1 text-xs opacity-70">({inLabCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('RESULTED');
                setCurrentPage(1);
              }}
              className={`pb-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === 'RESULTED'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Needs Verification <span className="ml-1 text-xs opacity-70">({resultedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('COMPLETED');
                setCurrentPage(1);
              }}
              className={`pb-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === 'COMPLETED'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Completed <span className="ml-1 text-xs opacity-70">({completedCount})</span>
            </button>
          </div>

          {/* 2. Secondary Filter Strip: Search + Priority Dropdown + Category Dropdown + Reset */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search order #, patient name, MRN, test, or clinician..."
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

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              {/* Priority Select */}
              <div className="w-full sm:w-40 shrink-0">
                <Select
                  value={priorityFilter}
                  onValueChange={(val) => {
                    setPriorityFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 text-sm border-border bg-background shadow-none">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover dark:bg-card border-border shadow-2xl z-50">
                    <SelectGroup>
                      <SelectItem value="ALL" className="text-sm">All Priorities</SelectItem>
                      <SelectItem value="STAT" className="text-sm">STAT Only</SelectItem>
                      <SelectItem value="URGENT" className="text-sm">Urgent Only</SelectItem>
                      <SelectItem value="ROUTINE" className="text-sm">Routine Only</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Department Category Select */}
              <div className="w-full sm:w-48 shrink-0">
                <Select
                  value={categoryFilter}
                  onValueChange={(val) => {
                    setCategoryFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 text-sm border-border bg-background shadow-none">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover dark:bg-card border-border shadow-2xl z-50">
                    <SelectGroup>
                      <SelectItem value="ALL" className="text-sm">All Departments</SelectItem>
                      <SelectItem value="General Chemistry" className="text-sm">General Chemistry</SelectItem>
                      <SelectItem value="Hematology" className="text-sm">Hematology</SelectItem>
                      <SelectItem value="Cardiovascular Chemistry" className="text-sm">Cardiovascular Chemistry</SelectItem>
                      <SelectItem value="Cardiology Biomarkers" className="text-sm">Cardiology Biomarkers</SelectItem>
                      <SelectItem value="Renal & Urology" className="text-sm">Renal & Urology</SelectItem>
                      <SelectItem value="Radiology / Imaging" className="text-sm">Radiology / Imaging</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-10 text-sm text-muted-foreground hover:text-foreground gap-1.5 px-3 cursor-pointer shrink-0"
                >
                  <RotateCcw className="size-4" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* 5-COLUMN RESPONSIVE WORKLIST (NO HORIZONTAL SLIDER) */}
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/40">
                  <TableHead className="w-[160px] pl-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground py-3.5 whitespace-nowrap">
                    Order & Urgency
                  </TableHead>
                  <TableHead className="w-[200px] font-semibold text-xs uppercase tracking-wider text-muted-foreground py-3.5 whitespace-nowrap">
                    Patient
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground py-3.5">
                    Diagnostic Test & Clinician
                  </TableHead>
                  <TableHead className="w-[150px] font-semibold text-xs uppercase tracking-wider text-muted-foreground py-3.5 whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="w-[200px] pr-6 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground py-3.5 whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center text-sm text-muted-foreground">
                      <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                      Synchronizing diagnostic orders...
                    </TableCell>
                  </TableRow>
                ) : visibleOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center text-sm text-muted-foreground">
                      <Beaker className="size-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                      No diagnostic orders found matching the filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleOrders.map((order) => {
                    const initials = order.patientName
                      ? order.patientName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                      : 'PT';

                    const isPendingCollection = order.status === 'ORDERED' || order.status === 'PENDING';
                    const isAwaitingResults = order.status === 'COLLECTED' || order.status === 'PROCESSING' || order.status === 'IN_ANALYSIS';
                    const isResulted = order.status === 'RESULTED';
                    const hasPanicValue = order.results?.some((r) => r.isPanicValue || r.isPanic || r.flag === 'CRITICAL');

                    return (
                      <TableRow
                        key={order.id}
                        onClick={() => setSelectedOrderForFindings(order)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors group border-b border-border/70"
                        title="Click to view diagnostic order details"
                      >
                        {/* Column 1: Order & Urgency */}
                        <TableCell className="pl-6 py-3.5 align-middle">
                          <div className="flex flex-col gap-1 items-start">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-medium text-xs text-foreground bg-muted/80 px-2 py-0.5 rounded border border-border">
                                {order.orderNumber}
                              </span>
                              {renderPriorityBadge(order.priority)}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(order.requestedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </TableCell>

                        {/* Column 2: Patient Identity */}
                        <TableCell className="py-3.5 align-middle">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar className="h-8 w-8 border border-border text-xs shrink-0">
                              <AvatarFallback className="text-[11px] font-semibold text-muted-foreground bg-muted">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-foreground truncate">
                                {order.patientName}
                              </div>
                              <div className="font-mono text-[11px] text-muted-foreground">
                                {order.mrn}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Column 3: Diagnostic Test & Clinician (Zero Tube Badges) */}
                        <TableCell className="py-3.5 align-middle">
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-foreground leading-snug">
                              {order.testName}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span>{order.testCategory}</span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-foreground/80">
                                <Stethoscope className="w-3 h-3 text-muted-foreground shrink-0" />
                                {order.requestedBy}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Column 4: Status & Critical Alert */}
                        <TableCell className="py-3.5 align-middle">
                          <div className="flex flex-col gap-1 items-start">
                            {renderStatusBadge(order.status)}
                            {hasPanicValue && (
                              <Badge
                                variant="outline"
                                className="border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[10px] py-0.5 px-1.5 gap-1 whitespace-nowrap shrink-0 animate-pulse"
                              >
                                <AlertTriangle className="size-2.5 text-red-600 dark:text-red-400 shrink-0" />
                                <span>Critical Panic</span>
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Column 5: Clear Actions */}
                        <TableCell className="pr-6 py-3.5 align-middle text-right">
                          <div className="flex items-center justify-end gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {/* Panic Call Log Badge or Action */}
                            {hasPanicValue && (
                              order.panicCallLog ? (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] py-1 px-2 gap-1 whitespace-nowrap shrink-0 shadow-2xs"
                                  title={`Verbal read-back logged by ${order.panicCallLog.callerName} to ${order.panicCallLog.calledTo}`}
                                >
                                  <PhoneCall className="size-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>MD Notified</span>
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => setOrderForPanicCall(order)}
                                  className="text-xs h-8 px-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs animate-pulse cursor-pointer gap-1 whitespace-nowrap shrink-0"
                                  title="CLIA Critical Value: Attending Physician Read-Back Call Mandatory"
                                >
                                  <PhoneCall className="size-3.5" />
                                  <span>Call MD</span>
                                </Button>
                              )
                            )}

                            {order.status === 'REJECTED' ? (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedOrderForFindings(order)}
                                  className="text-xs text-destructive hover:bg-destructive/10 h-8 px-2.5 cursor-pointer font-medium border-destructive/30 whitespace-nowrap"
                                  title={order.rejectionReason}
                                >
                                  <AlertCircle className="size-3.5 mr-1" />
                                  <span>Rejection</span>
                                </Button>
                                {order.recollectionRequired && !order.recollectionRequisitionId && (
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      const res = await triggerRecollectionRequisition(order.id);
                                      if (res.success && res.data) {
                                        setOrders((prev) => [res.data!, ...prev.map((o) => (o.id === order.id ? { ...o, recollectionRequisitionId: res.data!.id } : o))]);
                                        showToast('success', `Recollection requisition ${res.data.orderNumber} initiated for ${order.patientName}.`);
                                      } else {
                                        showToast('error', res.error || 'Failed to trigger recollection.');
                                      }
                                    }}
                                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white h-8 px-2.5 cursor-pointer font-medium whitespace-nowrap"
                                    title="Order replacement specimen recollection"
                                  >
                                    <RotateCcw className="size-3.5 mr-1" />
                                    <span>Recollect</span>
                                  </Button>
                                )}
                              </div>
                            ) : isPendingCollection ? (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkCollected(order)}
                                  className="text-xs h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90 font-medium cursor-pointer whitespace-nowrap shadow-2xs"
                                >
                                  <FlaskConical className="size-3.5 mr-1.5" />
                                  <span>Receive Specimen</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setOrderToReject(order)}
                                  className="text-xs h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive font-medium cursor-pointer whitespace-nowrap"
                                  title="Reject Specimen (CLIA Exception)"
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : isAwaitingResults ? (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedOrderForEntry(order)}
                                  className="text-xs h-8 px-3 gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-medium whitespace-nowrap shadow-2xs"
                                >
                                  <Plus className="size-3.5" />
                                  <span>Enter Results</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setOrderToReject(order)}
                                  className="text-xs h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive font-medium cursor-pointer whitespace-nowrap"
                                  title="Reject Specimen (CLIA Exception)"
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedOrderForFindings(order)}
                                  className="text-xs text-foreground hover:bg-muted h-8 px-2.5 cursor-pointer font-medium border-border whitespace-nowrap"
                                >
                                  <Eye className="size-3.5 mr-1 text-muted-foreground" />
                                  <span>{isResulted ? 'Verify & Sign' : 'View'}</span>
                                </Button>
                                {order.results && order.results.length > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setOrderToExport(order)}
                                    className="h-8 w-8 p-0 border-border hover:bg-muted font-medium cursor-pointer shrink-0"
                                    title="Export Certified Official PDF Laboratory Report"
                                  >
                                    <Printer className="size-3.5 text-muted-foreground" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Showing{' '}
              <span className="font-semibold text-foreground">
                {filteredOrders.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, filteredOrders.length)}
              </span>{' '}
              of <span className="font-semibold text-foreground">{filteredOrders.length}</span> requisitions
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="h-8 text-xs px-2.5 cursor-pointer border-border"
              >
                <ChevronLeft className="size-3.5 mr-1" />
                Previous
              </Button>
              <span className="text-muted-foreground font-mono text-xs px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="h-8 text-xs px-2.5 cursor-pointer border-border"
              >
                Next
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requisition Modal (Scalable Patient Combobox) */}
      <RequisitionModal
        isOpen={isRequisitionOpen}
        onClose={() => setIsRequisitionOpen(false)}
        patients={patients}
        onSubmit={handleCreateRequisition}
      />

      {/* Lab Results Entry Modal (For Lab Staff to input values) */}
      <ResultsEntryModal
        order={selectedOrderForEntry}
        onClose={() => setSelectedOrderForEntry(null)}
        onSubmit={handleSubmitFindings}
      />

      {/* Clinical Findings & Review Modal (For Doctors & Quality Supervisors) */}
      <ResultsFindingsModal
        order={selectedOrderForFindings}
        onClose={() => setSelectedOrderForFindings(null)}
        onVerify={handleVerifyFindings}
        onReview={handleReviewFindings}
      />

      {/* Official Certified PDF Report Modal [FE-704] */}
      <DiagnosticReportExportModal
        isOpen={!!orderToExport}
        onClose={() => setOrderToExport(null)}
        order={orderToExport}
      />

      {/* Specimen Rejection Modal (CLIA/CAP QA Rejection) [FE-803] */}
      <SpecimenRejectionModal
        isOpen={!!orderToReject}
        onClose={() => setOrderToReject(null)}
        order={orderToReject}
        onOrderRejected={(rejected) => {
          setOrders((prev) => prev.map((o) => (o.id === rejected.id ? rejected : o)));
          showToast('error', `Specimen rejected: ${rejected.rejectionReason}. Recollection protocol initiated.`);
        }}
      />

      {/* Panic Value Telephone Call-Back Modal [FE-902] */}
      <PanicCallModal
        isOpen={!!orderForPanicCall}
        onClose={() => setOrderForPanicCall(null)}
        order={orderForPanicCall}
        onCallLogged={(updated) => {
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          showToast('success', `Verbal panic value call logged to ${updated.panicCallLog?.calledTo}. Read-back confirmed.`);
        }}
      />

      {/* Shared Command Palette (⌘K) */}
      <CommandMenu
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
      />
    </div>
  );
}
