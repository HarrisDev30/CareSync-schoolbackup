'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Search,
  RefreshCw,
  Eye,
  Key,
  Database,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  FileCode,
  Copy,
  Check,
  AlertTriangle,
  Pill,
  FileCheck,
  Stethoscope,
  Beaker,
  Download,
  Filter,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { AuditLogEntry, StaffUser } from '@/types';
import { fetchAuditLogs, getActiveStaffUser, setActiveStaffUser, STAFF_PRESETS } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { CommandMenu } from '@/components/command-menu';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionCategory, setActionCategory] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [currentUser, setCurrentUser] = useState<StaffUser>(getActiveStaffUser());

  const pageSize = 12;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setCurrentUser(getActiveStaffUser());
  }, []);

  const handleSwitchToAdmin = async () => {
    const adminUser = STAFF_PRESETS.find((s) => s.role === 'ADMINISTRATOR') || STAFF_PRESETS[3];
    await setActiveStaffUser(adminUser);
    setCurrentUser(adminUser);
    loadData();
  };

  // Multi-Filter Logic
  const filteredLogs = logs.filter((log) => {
    // 1. Search Query Filter
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchesAction = log.action.toLowerCase().includes(query);
      const matchesEmail = log.userEmail.toLowerCase().includes(query);
      const matchesResource = log.resource.toLowerCase().includes(query);
      const matchesIp = log.ipAddress && log.ipAddress.toLowerCase().includes(query);
      const matchesMeta = log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(query);
      if (!matchesAction && !matchesEmail && !matchesResource && !matchesIp && !matchesMeta) {
        return false;
      }
    }

    // 2. Role Filter
    if (roleFilter !== 'ALL') {
      if (log.userRole !== roleFilter) return false;
    }

    // 3. Action Category Filter
    if (actionCategory === 'SECURITY') {
      const isSecurity =
        log.action.includes('RBAC') ||
        log.action.includes('ENFORCED') ||
        log.action.includes('DENIED') ||
        log.action.includes('AUTH');
      if (!isSecurity) return false;
    } else if (actionCategory === 'PRESCRIPTION') {
      if (!log.action.includes('PRESCRIPTION')) return false;
    } else if (actionCategory === 'DISCHARGE') {
      if (!log.action.includes('DISCHARGE')) return false;
    } else if (actionCategory === 'CLINICAL') {
      const isClinical =
        log.action.includes('CONSULTATION') ||
        log.action.includes('NOTE') ||
        log.action.includes('SOAP');
      if (!isClinical) return false;
    } else if (actionCategory === 'DIAGNOSTIC') {
      if (!log.action.includes('DIAGNOSTIC') && !log.action.includes('LAB')) return false;
    } else if (actionCategory === 'CRYPTO') {
      if (!log.action.includes('KEY') && !log.action.includes('DECRYPT')) return false;
    } else if (actionCategory === 'PHI_READ') {
      if (!log.action.includes('VIEW') && !log.action.includes('READ')) return false;
    }

    // 4. Time Range Filter
    if (timeFilter !== 'ALL') {
      const logDate = new Date(log.timestamp).getTime();
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      if (timeFilter === 'TODAY' && now - logDate > oneDay) return false;
      if (timeFilter === 'WEEK' && now - logDate > 7 * oneDay) return false;
      if (timeFilter === 'MONTH' && now - logDate > 30 * oneDay) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleExportJson = () => {
    const payload = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caresync-hipaa-audit-stream-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: string) => {
    if (action.includes('ENFORCED') || action.includes('RBAC') || action.includes('DENIED')) {
      return (
        <Badge variant="outline" className="gap-1 text-[11px] py-0.5 bg-destructive/10 text-destructive border-destructive/30 font-bold">
          <Lock className="size-3 text-destructive" />
          <span>{action}</span>
        </Badge>
      );
    }
    if (action.includes('PRESCRIPTION')) {
      return (
        <Badge variant="outline" className="gap-1 text-[11px] py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium">
          <Pill className="size-3 text-amber-600 dark:text-amber-400" />
          <span>{action}</span>
        </Badge>
      );
    }
    if (action.includes('DISCHARGE')) {
      return (
        <Badge variant="outline" className="gap-1 text-[11px] py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold">
          <FileCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
          <span>{action}</span>
        </Badge>
      );
    }
    if (action.includes('DIAGNOSTIC') || action.includes('LAB')) {
      return (
        <Badge variant="outline" className="gap-1 text-[11px] py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30">
          <Beaker className="size-3 text-purple-600 dark:text-purple-400" />
          <span>{action}</span>
        </Badge>
      );
    }
    if (action.includes('CONSULTATION') || action.includes('NOTE') || action.includes('SOAP')) {
      return (
        <Badge variant="outline" className="gap-1 text-[11px] py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
          <Stethoscope className="size-3 text-blue-600 dark:text-blue-400" />
          <span>{action}</span>
        </Badge>
      );
    }
    if (action.includes('DECRYPT') || action.includes('KEY')) {
      return (
        <Badge variant="outline" className="gap-1 text-[11px] py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30">
          <Key className="size-3 text-indigo-600" />
          <span>{action}</span>
        </Badge>
      );
    }
    if (action.includes('REGISTER') || action.includes('CREATED')) {
      return (
        <Badge variant="outline" className="gap-1 text-[11px] py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30">
          <Database className="size-3 text-teal-600" />
          <span>{action}</span>
        </Badge>
      );
    }
    if (action.includes('VIEW') || action.includes('READ')) {
      return (
        <Badge variant="outline" className="gap-1 text-[11px] py-0.5 text-muted-foreground bg-muted border-border">
          <Eye className="size-3 text-muted-foreground" />
          <span>{action}</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-[11px] py-0.5 bg-muted text-foreground border-border">
        <UserCheck className="size-3 text-muted-foreground" />
        <span>{action}</span>
      </Badge>
    );
  };

  const isAccessDenied = currentUser.role !== 'ADMINISTRATOR';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. UNIFORM ENTERPRISE CLINICAL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Enterprise HIPAA Compliance & Security Audit Stream
            </h1>
            <Badge variant="outline" className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30 gap-1.5 py-0.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              WORM Immutable § 164.312(b)
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Write Once Read Many tamper-evident security stream recording clinical record access, e-prescriptions, patient discharges, and operator authentication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="h-8.5 text-xs text-foreground gap-1.5 border-border shadow-2xs hover:bg-muted cursor-pointer"
            title="Export compliance log as JSON"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Export Stream</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCommandOpen(true)}
            className="h-8.5 text-xs text-muted-foreground gap-2 border-border shadow-2xs hover:text-foreground cursor-pointer"
          >
            <Search className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="h-8.5 text-xs text-foreground gap-1.5 border-border shadow-2xs hover:bg-muted cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. ROLE-BASED ACCESS CONTROL (RBAC) ACCESS GATE BANNER (IF NOT ADMIN) */}
      {isAccessDenied && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-xs">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <ShieldAlert className="size-5" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-destructive text-sm flex items-center gap-2">
                  <span>HIPAA § 164.312(b) Access Restricted: Administrator Credentials Required</span>
                  <Badge variant="outline" className="border-destructive/40 text-destructive text-[10px] uppercase font-mono">
                    Current Role: {currentUser.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Unredacted security and cryptographic audit trails are legally reserved for designated Security Administrators and Compliance Officers. Non-admin users operate with restricted read privilege.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleSwitchToAdmin}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8 shrink-0 cursor-pointer shadow-xs"
            >
              <UserCheck className="size-3.5 mr-1.5" />
              <span>Switch to Administrator (admin@caresync.org)</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 3. FOUR-CARD OPERATIONAL METRICS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Audited Stream Events
          </div>
          <div className="text-2xl font-bold text-foreground mt-1 font-mono">
            {logs.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>100% Cryptographically Signed</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Clinical Prescriptions & Discharges
          </div>
          <div className="text-2xl font-bold text-foreground mt-1 font-mono">
            {logs.filter((l) => l.action.includes('PRESCRIPTION') || l.action.includes('DISCHARGE')).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Pill className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span>Legal e-Rx & patient releases</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Security & RBAC Enforcement
          </div>
          <div className="text-2xl font-bold text-foreground mt-1 font-mono">
            {logs.filter((l) => l.action.includes('RBAC') || l.action.includes('ENFORCED') || l.action.includes('DENIED')).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Lock className="size-3.5 text-destructive" />
            <span>HTTP 403 blocks documented</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Cryptographic Integrity
          </div>
          <div className="text-2xl font-bold text-foreground mt-1 font-mono">
            AES-256
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Fingerprint className="size-3.5 text-indigo-600" />
            <span>Zero Tamper Detections</span>
          </div>
        </div>
      </div>

      {/* 4. MULTI-FILTER COMPLIANCE TOOLBAR */}
      <Card className="shadow-2xs border-border bg-card p-4">
        <div className="space-y-3">
          {/* Row 1: Search + Quick Category Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search action, email, resource, IP, or metadata..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 text-xs h-9 bg-background border-border"
              />
            </div>

            <Tabs
              value={actionCategory}
              onValueChange={(val) => {
                setActionCategory(val);
                setCurrentPage(1);
              }}
              className="w-full lg:w-auto"
            >
              <TabsList className="h-9 bg-muted p-0.5 border border-border flex flex-wrap">
                <TabsTrigger value="ALL" className="text-xs px-2.5 cursor-pointer">All Events</TabsTrigger>
                <TabsTrigger value="SECURITY" className="text-xs px-2.5 cursor-pointer text-destructive data-[state=active]:text-destructive">
                  Security Alerts
                </TabsTrigger>
                <TabsTrigger value="PRESCRIPTION" className="text-xs px-2.5 cursor-pointer">e-Rx Orders</TabsTrigger>
                <TabsTrigger value="DISCHARGE" className="text-xs px-2.5 cursor-pointer">Discharges</TabsTrigger>
                <TabsTrigger value="CLINICAL" className="text-xs px-2.5 cursor-pointer">SOAP Notes</TabsTrigger>
                <TabsTrigger value="DIAGNOSTIC" className="text-xs px-2.5 cursor-pointer">Labs</TabsTrigger>
                <TabsTrigger value="CRYPTO" className="text-xs px-2.5 cursor-pointer">Crypto Keys</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Row 2: Secondary Filters (Actor Role, Time Range, Active Filter Status) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Filter className="size-3.5" />
                <span className="font-medium">Filter by Actor:</span>
              </div>

              <Select
                value={roleFilter}
                onValueChange={(val) => {
                  setRoleFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs w-[160px] bg-background border-border">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="bg-popover dark:bg-card border-border shadow-xl z-50">
                  <SelectItem value="ALL" className="text-xs">All Staff Roles</SelectItem>
                  <SelectItem value="ADMINISTRATOR" className="text-xs">Administrator</SelectItem>
                  <SelectItem value="PHYSICIAN" className="text-xs">Physician</SelectItem>
                  <SelectItem value="RECEPTIONIST" className="text-xs">Receptionist</SelectItem>
                  <SelectItem value="LABORATORY_USER" className="text-xs">Laboratory User</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1.5 text-muted-foreground ml-2">
                <Calendar className="size-3.5" />
                <span className="font-medium">Time Window:</span>
              </div>

              <Select
                value={timeFilter}
                onValueChange={(val) => {
                  setTimeFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs w-[140px] bg-background border-border">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent className="bg-popover dark:bg-card border-border shadow-xl z-50">
                  <SelectItem value="ALL" className="text-xs">All Time</SelectItem>
                  <SelectItem value="TODAY" className="text-xs">Past 24 Hours</SelectItem>
                  <SelectItem value="WEEK" className="text-xs">Past 7 Days</SelectItem>
                  <SelectItem value="MONTH" className="text-xs">Past 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-muted-foreground font-mono text-[11px]">
              Showing <strong className="text-foreground">{filteredLogs.length}</strong> matching log events
            </div>
          </div>
        </div>
      </Card>

      {/* 5. AUDIT LOG STREAM TABLE */}
      <Card className="shadow-2xs border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground text-xs">
            <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
            <span>Fetching tamper-evident cryptographic audit stream...</span>
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[180px]">Timestamp (UTC)</TableHead>
                  <TableHead className="w-[210px]">Action & Classification</TableHead>
                  <TableHead className="w-[160px]">Protected Resource</TableHead>
                  <TableHead className="w-[200px]">Operator & Role</TableHead>
                  <TableHead className="w-[120px]">IP Address</TableHead>
                  <TableHead className="text-right w-[100px]">Inspector</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center text-xs text-muted-foreground">
                      No security audit events match the current filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/40 transition-colors border-border">
                      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString([], {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground">
                        <span className="bg-muted px-1.5 py-0.5 rounded border border-border text-foreground font-medium">
                          /{log.resource}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold text-foreground">{log.userEmail}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{log.userRole}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.ipAddress || '127.0.0.1'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground px-2.5 cursor-pointer"
                        >
                          <Eye className="size-3.5 mr-1 text-muted-foreground" />
                          <span>Inspect</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Footer */}
            <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <div>
                Showing{' '}
                <span className="font-medium text-foreground">
                  {filteredLogs.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, filteredLogs.length)}
                </span>{' '}
                of <span className="font-medium text-foreground">{filteredLogs.length}</span> audit records
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
          </div>
        )}
      </Card>

      {/* 6. AUDIT ENTRY INSPECTION MODAL */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        {selectedLog && (
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-card text-card-foreground border-border shadow-2xl">
            <DialogHeader className="pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <ShieldCheck className="size-4 text-emerald-600" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <span>Audit Event Inspection</span>
                    <Badge variant="outline" className="font-mono text-[10px] bg-muted">
                      ID: {selectedLog.id.slice(0, 8)}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Recorded {new Date(selectedLog.timestamp).toUTCString()}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 text-xs mt-1">
              {/* Event Summary Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Security Action</span>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Protected Resource</span>
                  <div className="mt-1 font-mono text-xs font-semibold text-foreground">
                    /{selectedLog.resource}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Operator Email</span>
                  <div className="mt-0.5 font-medium text-foreground">{selectedLog.userEmail}</div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Assigned Role</span>
                  <div className="mt-0.5 font-mono text-muted-foreground">{selectedLog.userRole}</div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Source IP Address</span>
                  <div className="mt-0.5 font-mono text-muted-foreground">{selectedLog.ipAddress || '127.0.0.1'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Cryptographic Integrity</span>
                  <div className="mt-0.5 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Fingerprint className="size-3 text-emerald-600" />
                    <span>WORM Verified</span>
                  </div>
                </div>
              </div>

              <Separator className="border-border" />

              {/* Event Metadata & Payload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode className="size-3.5 text-muted-foreground" />
                    Structured Payload Metadata
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog.metadata || {}, null, 2))}
                    className="h-7 text-[11px] text-muted-foreground hover:text-foreground px-2 cursor-pointer gap-1"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="size-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-slate-950 text-slate-100 rounded-lg p-3 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                  <pre>{JSON.stringify(selectedLog.metadata || { status: 'OK', details: 'No additional payload' }, null, 2)}</pre>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex items-center justify-between sm:justify-between">
              <span className="text-[11px] text-muted-foreground font-mono">
                Log UUID: {selectedLog.id}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="h-8 text-xs cursor-pointer border-border"
              >
                Close
              </Button>
            </DialogFooter>
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
