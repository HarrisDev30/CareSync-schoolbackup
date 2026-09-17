'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { LabOrder, DiagnosticPriority, Patient } from '@/types';
import { fetchLabOrders, fetchPatients, PHYSICIAN_PRESETS } from '@/lib/api';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export default function LabsPage() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Requisition Form State
  const [reqPatientId, setReqPatientId] = useState('');
  const [reqTestName, setReqTestName] = useState('Lipid Profile & Atherogenic Risk Panel');
  const [reqCategory, setReqCategory] = useState('Cardiovascular Chemistry');
  const [reqPriority, setReqPriority] = useState<DiagnosticPriority>('ROUTINE');
  const [reqPhysician, setReqPhysician] = useState(PHYSICIAN_PRESETS[0]?.name || 'Dr. Sarah Chen, MD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [labData, patData] = await Promise.all([
        fetchLabOrders(),
        fetchPatients(),
      ]);
      setOrders(labData);
      setPatients(patData);
      if (patData.length > 0) {
        setReqPatientId(patData[0].id);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const patient = patients.find((p) => p.id === reqPatientId) || patients[0];
    const newOrder: LabOrder = {
      id: `lab-${Date.now()}`,
      orderNumber: `LAB-2026-${String(orders.length + 905).padStart(4, '0')}`,
      patientId: patient ? patient.id : 'p-1',
      patientName: patient ? patient.fullName : 'Eleanor Vance',
      mrn: patient ? patient.mrn : 'MRN-90214',
      testName: reqTestName,
      testCategory: reqCategory,
      priority: reqPriority,
      status: 'COLLECTED',
      requestedBy: reqPhysician,
      requestedAt: new Date().toISOString(),
      results: [
        { parameter: 'Total Cholesterol', value: '185', unit: 'mg/dL', referenceRange: '< 200', isAbnormal: false },
        { parameter: 'Triglycerides', value: '142', unit: 'mg/dL', referenceRange: '< 150', isAbnormal: false },
        { parameter: 'HDL-C', value: '54', unit: 'mg/dL', referenceRange: '> 40', isAbnormal: false },
        { parameter: 'LDL-C Calculated', value: '102', unit: 'mg/dL', referenceRange: '< 100', isAbnormal: true },
      ],
    };

    setOrders([newOrder, ...orders]);
    setIsRequisitionOpen(false);
    setIsSubmitting(false);
    showToast('success', `Diagnostic order ${newOrder.orderNumber} created for ${newOrder.patientName}.`);
  };

  // Metrics
  const statCount = orders.filter((o) => o.priority === 'STAT').length;
  const urgentCount = orders.filter((o) => o.priority === 'URGENT').length;
  const routineCount = orders.filter((o) => o.priority === 'ROUTINE').length;
  const inProcessCount = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'COLLECTED').length;
  const verifiedCount = orders.filter((o) => o.status === 'VERIFIED' || o.status === 'COMPLETED').length;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (priorityFilter !== 'ALL' && o.priority !== priorityFilter) return false;
    if (categoryFilter !== 'ALL' && o.testCategory !== categoryFilter) return false;

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const hasActiveFilters = searchQuery.trim() !== '' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
    setCurrentPage(1);
  };

  const renderPriorityBadge = (priority: DiagnosticPriority) => {
    switch (priority) {
      case 'STAT':
        return (
          <Badge variant="destructive" className="gap-1 font-semibold text-[11px] py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            STAT
          </Badge>
        );
      case 'URGENT':
        return (
          <Badge variant="warning" className="gap-1 text-[11px] py-0.5">
            <Clock className="w-3 h-3 text-amber-600" />
            Urgent
          </Badge>
        );
      case 'ROUTINE':
        return (
          <Badge variant="outline" className="text-[11px] py-0.5 text-slate-600 bg-slate-50 border-slate-200">
            Routine
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderStatusBadge = (status: LabOrder['status']) => {
    switch (status) {
      case 'COMPLETED':
      case 'VERIFIED':
        return (
          <Badge variant="success" className="gap-1 text-[11px] py-0.5">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge variant="outline" className="gap-1 text-[11px] py-0.5 text-blue-700 bg-blue-50/60 border-blue-200">
            <Activity className="w-3 h-3 text-blue-600 animate-spin" />
            Processing
          </Badge>
        );
      case 'COLLECTED':
        return (
          <Badge variant="purple" className="text-[11px] py-0.5">
            In Lab
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[11px] py-0.5 text-slate-600">
            Pending
          </Badge>
        );
    }
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

      {/* 1. COMMAND HEADER (Exact match to all dashboard pages) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Diagnostic Services & Lab Orders
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Diagnostic Command
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Clinical worklist, specimen tracking, priority triage, and verified laboratory findings.
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
            <Link href="/patients">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Patients</span>
            </Link>
          </Button>

          <Button
            onClick={() => setIsRequisitionOpen(true)}
            size="sm"
            className="gap-1.5 shadow-xs bg-blue-600 hover:bg-blue-700 text-white h-9 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>New Requisition</span>
          </Button>
        </div>
      </div>

      {/* 2. OPERATIONAL METRICS STRIP (Exact match to all dashboard pages) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
              <Beaker className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Total Lab Orders</div>
              <div className="text-xs text-slate-700 font-medium mt-0.5">
                Active Diagnostic Panel
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-slate-900">{orders.length}</span>
            <span className="block text-[10px] font-mono text-blue-700">Requisitions</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Specimens in Process</div>
              <div className="text-xs text-slate-700 font-medium mt-0.5">
                {inProcessCount === 0 ? 'Queue clear' : `${inProcessCount} in analyzer`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-slate-900">{inProcessCount}</span>
            <span className="block text-[10px] font-mono text-amber-700">In lab run</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Verified Findings</div>
              <div className="text-xs text-slate-700 font-medium mt-0.5">
                Physician Certified
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-slate-900">{verifiedCount}</span>
            <span className="block text-[10px] font-mono text-emerald-700">Reported</span>
          </div>
        </div>
      </div>

      {/* 3. DIAGNOSTIC ORDERS WORKLIST CARD (Exact match to all dashboard pages) */}
      <Card className="shadow-2xs border-slate-200/80">
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Diagnostic Worklist</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {filteredOrders.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Laboratory orders, priority specimen tracking, and critical flags.
              </CardDescription>
            </div>

            {/* Linear-Style Segmented Tabs */}
            <Tabs
              value={priorityFilter}
              onValueChange={(val) => {
                setPriorityFilter(val);
                setCurrentPage(1);
              }}
              className="w-auto"
            >
              <TabsList className="h-8 bg-slate-100/90 p-0.5 border border-slate-200/60">
                <TabsTrigger value="ALL" className="text-xs px-2.5 py-1">
                  All <span className="ml-1 text-[10px] font-mono text-slate-500">({orders.length})</span>
                </TabsTrigger>
                <TabsTrigger value="STAT" className="text-xs px-2.5 py-1">
                  STAT <span className="ml-1 text-[10px] font-mono text-rose-700 font-semibold">({statCount})</span>
                </TabsTrigger>
                <TabsTrigger value="URGENT" className="text-xs px-2.5 py-1">
                  Urgent <span className="ml-1 text-[10px] font-mono text-amber-700">({urgentCount})</span>
                </TabsTrigger>
                <TabsTrigger value="ROUTINE" className="text-xs px-2.5 py-1">
                  Routine <span className="ml-1 text-[10px] font-mono text-slate-600">({routineCount})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Integrated Search & Category Filter Bar */}
          <div className="pt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter orders by order #, patient, MRN, panel, or clinician..."
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

            <div className="w-full sm:w-56">
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ALL" className="text-xs">All Categories</SelectItem>
                    <SelectItem value="Cardiology Biomarkers" className="text-xs">Cardiology Biomarkers</SelectItem>
                    <SelectItem value="Chemistry" className="text-xs">Chemistry</SelectItem>
                    <SelectItem value="Hematology" className="text-xs">Hematology</SelectItem>
                    <SelectItem value="Endocrinology" className="text-xs">Endocrinology</SelectItem>
                    <SelectItem value="Cardiovascular Chemistry" className="text-xs">Cardiovascular Chemistry</SelectItem>
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

        {/* 100% NATIVE SHADCN TABLE (Zero Truncation, Full Data Visibility) */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Order #</TableHead>
                <TableHead className="w-[210px]">Patient & MRN</TableHead>
                <TableHead className="min-w-[220px]">Diagnostic Panel</TableHead>
                <TableHead className="w-[110px]">Priority</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[180px]">Requisitioned By</TableHead>
                <TableHead className="text-right w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-xs text-slate-400">
                    Loading diagnostic orders...
                  </TableCell>
                </TableRow>
              ) : visibleOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-xs text-slate-400">
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

                  return (
                    <TableRow key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Column 1: Order # */}
                      <TableCell>
                        <div className="font-mono font-medium text-xs text-slate-900">
                          {order.orderNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(order.requestedAt).toLocaleDateString()}
                        </div>
                      </TableCell>

                      {/* Column 2: Patient Identity */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border border-slate-200/80 text-xs font-semibold text-slate-700 bg-slate-100 flex-shrink-0">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-slate-900 leading-tight">
                              {order.patientName}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                              {order.mrn}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Column 3: Diagnostic Panel */}
                      <TableCell>
                        <div className="font-medium text-slate-800 text-xs leading-snug">
                          {order.testName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {order.testCategory}
                        </div>
                      </TableCell>

                      {/* Column 4: Priority */}
                      <TableCell>{renderPriorityBadge(order.priority)}</TableCell>

                      {/* Column 5: Status */}
                      <TableCell>{renderStatusBadge(order.status)}</TableCell>

                      {/* Column 6: Requisitioned By */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium whitespace-nowrap">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span>{order.requestedBy}</span>
                        </div>
                      </TableCell>

                      {/* Column 7: Actions */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs text-slate-600 hover:text-slate-900 h-8 px-2.5 cursor-pointer font-medium"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span>{order.results ? 'View Findings' : 'Enter Results'}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing{' '}
              <span className="font-medium text-slate-900">
                {filteredOrders.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, filteredOrders.length)}
              </span>{' '}
              of <span className="font-medium text-slate-900">{filteredOrders.length}</span> requisitions
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="h-8 text-xs px-2.5 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <span className="text-slate-400 font-mono text-xs px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="h-8 text-xs px-2.5 cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. NEW REQUISITION MODAL (Standard Native shadcn Dialog) */}
      <Dialog open={isRequisitionOpen} onOpenChange={setIsRequisitionOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
                <Beaker className="size-4 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-slate-900">
                  New Diagnostic Test Requisition
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Issue an outpatient or inpatient laboratory order and specimen collection.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateRequisition} className="space-y-4 text-xs mt-1">
            {/* Section 1: Patient & Clinician */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Patient & Ordering Care Team
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Target Patient *
                  </label>
                  <Select value={reqPatientId} onValueChange={setReqPatientId}>
                    <SelectTrigger className="w-full text-xs h-8.5">
                      <SelectValue placeholder="Select patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">
                            {p.fullName} ({p.mrn}) — {p.bloodType}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Ordering Clinician *
                  </label>
                  <Select value={reqPhysician} onValueChange={setReqPhysician}>
                    <SelectTrigger className="w-full text-xs h-8.5">
                      <SelectValue placeholder="Select clinician..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PHYSICIAN_PRESETS.map((doc) => (
                          <SelectItem key={doc.id} value={doc.name} className="text-xs">
                            {doc.name} ({doc.specialty})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Section 2: Test Panel & Priority */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Diagnostic Panel & Urgency
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Diagnostic Panel *
                  </label>
                  <Select
                    value={reqTestName}
                    onValueChange={(val) => {
                      setReqTestName(val);
                      if (val.includes('Troponin')) setReqCategory('Cardiology Biomarkers');
                      else if (val.includes('Lipid')) setReqCategory('Cardiovascular Chemistry');
                      else if (val.includes('Blood Count')) setReqCategory('Hematology');
                      else setReqCategory('General Chemistry');
                    }}
                  >
                    <SelectTrigger className="w-full text-xs h-8.5">
                      <SelectValue placeholder="Select panel..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Lipid Profile & Atherogenic Risk Panel" className="text-xs">
                          Lipid Profile & Risk Panel
                        </SelectItem>
                        <SelectItem value="Cardiac Troponin I (High Sensitivity)" className="text-xs">
                          hs-cTnI Cardiac Troponin
                        </SelectItem>
                        <SelectItem value="Comprehensive Metabolic Panel (CMP)" className="text-xs">
                          Comprehensive Metabolic Panel
                        </SelectItem>
                        <SelectItem value="Complete Blood Count with Diff" className="text-xs">
                          Complete Blood Count (CBC)
                        </SelectItem>
                        <SelectItem value="Serum Ferritin & Iron Saturation" className="text-xs">
                          Serum Ferritin & Iron Studies
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Clinical Priority *
                  </label>
                  <Select
                    value={reqPriority}
                    onValueChange={(val) => setReqPriority(val as DiagnosticPriority)}
                  >
                    <SelectTrigger className="w-full text-xs h-8.5">
                      <SelectValue placeholder="Select priority..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="ROUTINE" className="text-xs">
                          Routine (Standard Turnaround)
                        </SelectItem>
                        <SelectItem value="URGENT" className="text-xs">
                          Urgent (4-Hour TAT)
                        </SelectItem>
                        <SelectItem value="STAT" className="text-xs">
                          STAT (Immediate Critical Run)
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRequisitionOpen(false)}
                className="h-8.5 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-8.5 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Submit Order'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. LAB RESULTS FINDINGS MODAL (Standard Native shadcn Dialog) */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader className="pb-3 border-b border-slate-100 pr-8">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
                  <Beaker className="size-4 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-base font-semibold text-slate-900">
                      {selectedOrder.testName}
                    </DialogTitle>
                    <Badge variant="outline" className="font-mono text-xs text-slate-600 bg-slate-50">
                      {selectedOrder.orderNumber}
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    {selectedOrder.patientName} ({selectedOrder.mrn}) • {selectedOrder.testCategory}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400">Ordering Clinician:</span>{' '}
                  <span className="font-semibold text-slate-800">{selectedOrder.requestedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400">Requisition Date:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedOrder.requestedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {selectedOrder.results && selectedOrder.results.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Verified Laboratory Findings
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Analyte / Parameter</th>
                          <th className="py-2.5 px-3">Result</th>
                          <th className="py-2.5 px-3">Unit</th>
                          <th className="py-2.5 px-3">Ref Range</th>
                          <th className="py-2.5 px-3">Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedOrder.results.map((r, idx) => (
                          <tr
                            key={idx}
                            className={r.isPanicValue ? 'bg-rose-50/60 font-semibold' : ''}
                          >
                            <td className="py-2.5 px-3 font-medium text-slate-900">{r.parameter}</td>
                            <td className={`py-2.5 px-3 font-mono ${r.isAbnormal ? 'text-rose-600 font-bold' : 'text-slate-800 font-medium'}`}>
                              {r.value}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{r.unit}</td>
                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{r.referenceRange}</td>
                            <td className="py-2.5 px-3">
                              {r.isPanicValue ? (
                                <Badge variant="destructive" className="text-[10px] uppercase font-bold py-0 px-1.5">
                                  CRITICAL PANIC
                                </Badge>
                              ) : r.isAbnormal ? (
                                <Badge variant="warning" className="text-[10px] uppercase font-bold py-0 px-1.5">
                                  ABNORMAL
                                </Badge>
                              ) : (
                                <Badge variant="success" className="text-[10px] uppercase font-semibold py-0 px-1.5">
                                  NORMAL
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
                  <Clock className="size-8 text-slate-300 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-slate-700">Awaiting Laboratory Analysis</div>
                  <div className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Specimen collected and barcoded. Diagnostic analyzer run queued on automated line.
                  </div>
                </div>
              )}

              <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between sm:justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <FileCheck className="size-3.5 text-emerald-600" />
                  CLIA / CAP Certified Diagnostic Protocol
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Close Findings
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Shared Command Palette */}
      <CommandMenu
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
      />
    </div>
  );
}
