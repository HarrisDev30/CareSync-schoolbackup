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
} from '@/lib/api';
import { CommandMenu } from '@/components/command-menu';
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

export default function LabsPage() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active modals
  const [selectedOrderForFindings, setSelectedOrderForFindings] = useState<LabOrder | null>(null);
  const [selectedOrderForEntry, setSelectedOrderForEntry] = useState<LabOrder | null>(null);
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
      showToast('success', `Specimen for order ${order.orderNumber} marked as collected and in lab.`);
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

  // Metrics
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

  const statCount = orders.filter((o) => o.priority === 'STAT').length;
  const urgentCount = orders.filter((o) => o.priority === 'URGENT').length;
  const routineCount = orders.filter((o) => o.priority === 'ROUTINE').length;

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

      if (priorityFilter !== 'ALL' && o.priority !== priorityFilter) return false;
      if (categoryFilter !== 'ALL' && o.testCategory !== categoryFilter) return false;

      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PENDING' && o.status !== 'ORDERED' && o.status !== 'PENDING') return false;
        if (statusFilter === 'IN_LAB' && o.status !== 'COLLECTED' && o.status !== 'PROCESSING' && o.status !== 'IN_ANALYSIS') return false;
        if (statusFilter === 'RESULTED' && o.status !== 'RESULTED') return false;
        if (statusFilter === 'VERIFIED' && o.status !== 'VERIFIED' && o.status !== 'REVIEWED' && o.status !== 'COMPLETED') return false;
      }

      return true;
    });
  }, [orders, searchQuery, priorityFilter, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const hasActiveFilters = searchQuery.trim() !== '' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL' || statusFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const renderPriorityBadge = (priority: DiagnosticPriority) => {
    switch (priority) {
      case 'STAT':
        return (
          <Badge
            variant="outline"
            className="border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[11px] py-0.5 px-2 gap-1.5"
          >
            <span className="size-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <span>STAT</span>
          </Badge>
        );
      case 'URGENT':
        return (
          <Badge
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[11px] py-0.5 px-2 gap-1"
          >
            <Clock className="size-3 text-amber-600 dark:text-amber-400" />
            <span>Urgent</span>
          </Badge>
        );
      case 'ROUTINE':
        return (
          <Badge
            variant="outline"
            className="border-border bg-muted/40 text-muted-foreground font-medium text-[11px] py-0.5 px-2"
          >
            Routine
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderStatusBadge = (status: DiagnosticStatus) => {
    switch (status) {
      case 'COMPLETED':
      case 'REVIEWED':
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] py-0.5 px-2 gap-1"
          >
            <Check className="size-3" />
            <span>Reviewed</span>
          </Badge>
        );
      case 'VERIFIED':
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-[11px] py-0.5 px-2 gap-1"
          >
            <CheckCircle2 className="size-3" />
            <span>Verified</span>
          </Badge>
        );
      case 'RESULTED':
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-[11px] py-0.5 px-2"
          >
            Resulted
          </Badge>
        );
      case 'IN_ANALYSIS':
      case 'PROCESSING':
        return (
          <Badge
            variant="outline"
            className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium text-[11px] py-0.5 px-2 gap-1"
          >
            <Activity className="size-3 animate-spin text-sky-600 dark:text-sky-400" />
            <span>In Lab Run</span>
          </Badge>
        );
      case 'COLLECTED':
        return (
          <Badge
            variant="outline"
            className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium text-[11px] py-0.5 px-2"
          >
            Specimen In Lab
          </Badge>
        );
      case 'ORDERED':
      case 'PENDING':
      default:
        return (
          <Badge
            variant="outline"
            className="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-[11px] py-0.5 px-2"
          >
            Requisitioned
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
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Beaker className="size-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Diagnostic Services & Lab Orders
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Clinical worklist, specimen tracking, priority triage, and verified laboratory findings.
          </p>
        </div>

        {/* Global Action Group */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCommandOpen(true)}
            className="gap-2 text-xs text-muted-foreground hover:text-foreground h-9 px-3 border-border shadow-xs cursor-pointer"
          >
            <Search className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Search records</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 text-xs gap-1.5 border-border shadow-xs cursor-pointer"
          >
            <Link href="/patients">
              <Users className="size-3.5 text-muted-foreground" />
              <span>Patients</span>
            </Link>
          </Button>

          <Button
            onClick={() => setIsRequisitionOpen(true)}
            size="sm"
            className="gap-1.5 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 h-9 cursor-pointer active:scale-[0.98] transition-transform font-medium"
          >
            <Plus className="size-4" />
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
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Diagnostic Worklist</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {filteredOrders.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Laboratory orders, priority specimen tracking, and critical flags.
              </CardDescription>
            </div>

            {/* Segmented Priority Tabs */}
            <Tabs
              value={priorityFilter}
              onValueChange={(val) => {
                setPriorityFilter(val);
                setCurrentPage(1);
              }}
              className="w-auto"
            >
              <TabsList className="h-8 bg-muted/60 p-0.5 border border-border">
                <TabsTrigger value="ALL" className="text-xs px-2.5 py-1">
                  All <span className="ml-1 text-[10px] font-mono text-muted-foreground">({orders.length})</span>
                </TabsTrigger>
                <TabsTrigger value="STAT" className="text-xs px-2.5 py-1">
                  STAT <span className="ml-1 text-[10px] font-mono text-red-600 dark:text-red-400 font-semibold">({statCount})</span>
                </TabsTrigger>
                <TabsTrigger value="URGENT" className="text-xs px-2.5 py-1">
                  Urgent <span className="ml-1 text-[10px] font-mono text-amber-600 dark:text-amber-400">({urgentCount})</span>
                </TabsTrigger>
                <TabsTrigger value="ROUTINE" className="text-xs px-2.5 py-1">
                  Routine <span className="ml-1 text-[10px] font-mono text-muted-foreground">({routineCount})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Integrated Search & Filters */}
          <div className="pt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter orders by order #, patient, MRN, panel, or clinician..."
                className="pl-9 pr-14 h-9 text-xs border-border focus-visible:ring-1 focus-visible:ring-ring bg-background text-foreground"
              />
              <button
                type="button"
                onClick={() => setIsCommandOpen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-muted/40 text-[10px] font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Open Command Palette (⌘K)"
              >
                ⌘K
              </button>
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-52">
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 text-xs border-border bg-background text-foreground">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-popover dark:bg-card border-border shadow-2xl z-50">
                  <SelectGroup>
                    <SelectItem value="ALL" className="text-xs">All Categories</SelectItem>
                    <SelectItem value="General Chemistry" className="text-xs">General Chemistry</SelectItem>
                    <SelectItem value="Hematology" className="text-xs">Hematology</SelectItem>
                    <SelectItem value="Cardiovascular Chemistry" className="text-xs">Cardiovascular Chemistry</SelectItem>
                    <SelectItem value="Cardiology Biomarkers" className="text-xs">Cardiology Biomarkers</SelectItem>
                    <SelectItem value="Renal & Urology" className="text-xs">Renal & Urology</SelectItem>
                    <SelectItem value="Radiology / Imaging" className="text-xs">Radiology / Imaging</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-44">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 text-xs border-border bg-background text-foreground">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-popover dark:bg-card border-border shadow-2xl z-50">
                  <SelectGroup>
                    <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
                    <SelectItem value="PENDING" className="text-xs">Requisitioned</SelectItem>
                    <SelectItem value="IN_LAB" className="text-xs">In Laboratory Run</SelectItem>
                    <SelectItem value="RESULTED" className="text-xs">Resulted</SelectItem>
                    <SelectItem value="VERIFIED" className="text-xs">Verified & Reviewed</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1 px-2.5 cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </CardHeader>

        {/* 100% NATIVE SHADCN DATA TABLE */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/30">
                <TableHead className="w-[140px] text-xs font-semibold text-muted-foreground">Order #</TableHead>
                <TableHead className="w-[210px] text-xs font-semibold text-muted-foreground">Patient & MRN</TableHead>
                <TableHead className="min-w-[220px] text-xs font-semibold text-muted-foreground">Diagnostic Panel</TableHead>
                <TableHead className="w-[110px] text-xs font-semibold text-muted-foreground">Priority</TableHead>
                <TableHead className="w-[130px] text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="w-[180px] text-xs font-semibold text-muted-foreground">Requisitioned By</TableHead>
                <TableHead className="text-right w-[150px] text-xs font-semibold text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-xs text-muted-foreground">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    Synchronizing diagnostic orders...
                  </TableCell>
                </TableRow>
              ) : visibleOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-xs text-muted-foreground">
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
                  const isCompleted = order.status === 'VERIFIED' || order.status === 'REVIEWED' || order.status === 'COMPLETED';

                  return (
                    <TableRow key={order.id} className="hover:bg-muted/40 transition-colors border-b border-border/70">
                      {/* Column 1: Order # */}
                      <TableCell>
                        <div className="font-mono font-medium text-xs text-foreground">
                          {order.orderNumber}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(order.requestedAt).toLocaleDateString()}
                        </div>
                      </TableCell>

                      {/* Column 2: Patient Identity */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8 border border-border text-xs font-semibold text-foreground bg-muted shrink-0">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-foreground leading-tight truncate max-w-[130px]">
                              {order.patientName}
                            </div>
                            <div className="font-mono text-[11px] text-muted-foreground mt-0.5">
                              {order.mrn}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Column 3: Diagnostic Panel */}
                      <TableCell>
                        <div className="font-medium text-foreground text-xs leading-snug">
                          {order.testName}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {order.testCategory}
                        </div>
                      </TableCell>

                      {/* Column 4: Priority */}
                      <TableCell>{renderPriorityBadge(order.priority)}</TableCell>

                      {/* Column 5: Status */}
                      <TableCell>{renderStatusBadge(order.status)}</TableCell>

                      {/* Column 6: Requisitioned By */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium whitespace-nowrap">
                          <Stethoscope className="size-3.5 text-primary shrink-0" />
                          <span>{order.requestedBy}</span>
                        </div>
                      </TableCell>

                      {/* Column 7: Actions */}
                      <TableCell className="text-right">
                        {isPendingCollection ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkCollected(order)}
                            className="text-xs h-8 px-2.5 border-border hover:bg-muted font-medium cursor-pointer"
                          >
                            <FlaskConical className="size-3.5 mr-1 text-purple-500" />
                            <span>Collect Specimen</span>
                          </Button>
                        ) : isAwaitingResults ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrderForEntry(order)}
                            className="text-xs h-8 px-2.5 border-border hover:bg-muted font-medium cursor-pointer"
                          >
                            <Plus className="size-3.5 mr-1 text-sky-500" />
                            <span>Input Findings</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrderForFindings(order)}
                            className="text-xs text-foreground hover:bg-muted h-8 px-2.5 cursor-pointer font-medium"
                          >
                            <Eye className="size-3.5 mr-1 text-muted-foreground" />
                            <span>{isResulted ? 'Verify & Sign' : 'View Findings'}</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

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

      {/* Shared Command Palette (⌘K) */}
      <CommandMenu
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
      />
    </div>
  );
}
