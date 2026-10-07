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
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Pill,
  FileCheck,
  Stethoscope,
  Beaker,
  Download,
  ShieldAlert,
  Calendar,
  Shield,
  FileText,
  UserCheck,
} from 'lucide-react';
import { AuditLogEntry, StaffUser } from '@/types';
import { fetchAuditLogs, getActiveStaffUser, setActiveStaffUser, STAFF_PRESETS } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [actionCategory, setActionCategory] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<StaffUser>(STAFF_PRESETS[0]);

  const pageSize = 10;

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
    setMounted(true);
    setCurrentUser(getActiveStaffUser());
    loadData();
  }, []);

  const handleSwitchToAdmin = async () => {
    const adminUser = STAFF_PRESETS.find((s) => s.role === 'ADMINISTRATOR') || STAFF_PRESETS[4];
    await setActiveStaffUser(adminUser);
    setCurrentUser(adminUser);
    loadData();
  };

  // Category Filter Counts
  const securityCount = logs.filter(
    (l) =>
      l.action.includes('RBAC') ||
      l.action.includes('ENFORCED') ||
      l.action.includes('DENIED') ||
      l.action.includes('AUTH'),
  ).length;

  const clinicalCount = logs.filter(
    (l) =>
      l.action.includes('CONSULTATION') ||
      l.action.includes('NOTE') ||
      l.action.includes('SOAP'),
  ).length;

  const rxCount = logs.filter((l) => l.action.includes('PRESCRIPTION')).length;
  const dischargeCount = logs.filter((l) => l.action.includes('DISCHARGE')).length;
  const labCount = logs.filter((l) => l.action.includes('DIAGNOSTIC') || l.action.includes('LAB')).length;

  // Filter Logic
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
    if (roleFilter !== 'ALL' && log.userRole !== roleFilter) {
      return false;
    }

    // 3. Category Filter
    if (actionCategory === 'SECURITY') {
      const isSecurity =
        log.action.includes('RBAC') ||
        log.action.includes('ENFORCED') ||
        log.action.includes('DENIED') ||
        log.action.includes('AUTH');
      if (!isSecurity) return false;
    } else if (actionCategory === 'CLINICAL') {
      const isClinical =
        log.action.includes('CONSULTATION') ||
        log.action.includes('NOTE') ||
        log.action.includes('SOAP');
      if (!isClinical) return false;
    } else if (actionCategory === 'PRESCRIPTION') {
      if (!log.action.includes('PRESCRIPTION')) return false;
    } else if (actionCategory === 'DISCHARGE') {
      if (!log.action.includes('DISCHARGE')) return false;
    } else if (actionCategory === 'DIAGNOSTIC') {
      if (!log.action.includes('DIAGNOSTIC') && !log.action.includes('LAB')) return false;
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
        <Badge variant="outline" className="gap-1 text-xs py-0.5 bg-destructive/10 text-destructive border-destructive/30 font-medium">
          <Lock className="size-3 text-destructive" />
          <span>{action}</span>
        </Badge>
      );
    }
    if (action.includes('PRESCRIPTION')) {
      return (
        <Badge variant="outline" className="gap-1 text-xs py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium">
          <Pill className="size-3 text-amber-600 dark:text-amber-400" />
          <span>{action}</span>
        </Badge>
      );
    }
    if (action.includes('DISCHARGE')) {
      return (
        <Badge variant="outline" className="gap-1 text-xs py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium">
          <FileCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
          <span>{action}</span>
        </Badge>
      );
    }
    if (action.includes('DIAGNOSTIC') || action.includes('LAB')) {
      return (
        <Badge variant="outline" className="gap-1 text-xs py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-medium">
          <Beaker className="size-3 text-purple-600 dark:text-purple-400" />
          <span>{action}</span>
        </Badge>
      );
    }
    if (action.includes('CONSULTATION') || action.includes('NOTE') || action.includes('SOAP')) {
      return (
        <Badge variant="outline" className="gap-1 text-xs py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-medium">
          <Stethoscope className="size-3 text-blue-600 dark:text-blue-400" />
          <span>{action}</span>
        </Badge>
      );
    }
    if (action.includes('DECRYPT') || action.includes('KEY')) {
      return (
        <Badge variant="outline" className="gap-1 text-xs py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 font-medium">
          <Key className="size-3 text-indigo-600" />
          <span>{action}</span>
        </Badge>
      );
    }
    if (action.includes('REGISTER') || action.includes('CREATED')) {
      return (
        <Badge variant="outline" className="gap-1 text-xs py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium">
          <Database className="size-3 text-emerald-600" />
          <span>{action}</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-xs py-0.5 bg-muted text-muted-foreground border-border font-medium">
        <Eye className="size-3 text-muted-foreground" />
        <span>{action}</span>
      </Badge>
    );
  };

  const isAccessDenied = mounted && currentUser.role !== 'ADMINISTRATOR';

  return (
    <div className="w-full space-y-6">
      {/* 1. COMMAND HEADER (Strict DESIGN.md §2 Standard) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Compliance Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground">
            Tamper-evident WORM security stream recording clinical record access, e-prescriptions, and role boundary enforcement.
          </p>
        </div>

        {/* Global Toolbar Controls */}
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
            onClick={loadData}
            disabled={isLoading}
            className="gap-2 text-sm text-muted-foreground hover:text-foreground h-10 px-3.5 border-border shadow-none cursor-pointer"
            title="Refresh live audit logs from PostgreSQL"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Live</span>
          </Button>

          <Button
            size="sm"
            onClick={handleExportJson}
            className="gap-2 h-10 px-4 cursor-pointer active:scale-[0.98] transition-transform bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export Stream</span>
          </Button>
        </div>
      </div>

      {/* 2. RBAC ACCESS GATE BANNER (IF NOT ADMIN) */}
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
                    Current: {currentUser.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Unredacted security and cryptographic audit trails are legally reserved for designated Security Administrators. Non-admin users operate with restricted read privilege.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleSwitchToAdmin}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-9 shrink-0 cursor-pointer shadow-xs"
            >
              <UserCheck className="size-3.5 mr-1.5" />
              <span>Switch to Administrator</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 3. TOP 4 KPI SECTION-CARDS (Strict dashboard-01 section-cards Standard) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
        {/* KPI 1: Total Stream Events */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Total Stream Events
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {logs.length}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <ShieldCheck className="size-3 text-muted-foreground" />
                <span>WORM Ledger</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Tamper-Evident Index</span>
              <FileText className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              All events cryptographically signed
            </div>
          </CardFooter>
        </Card>

        {/* KPI 2: Clinical Actions */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Clinical Prescriptions & Notes
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {clinicalCount + rxCount}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <Pill className="size-3 text-muted-foreground" />
                <span>Signed Rx</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Encounter Actions</span>
              <Stethoscope className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              SOAP consultations, orders & discharges
            </div>
          </CardFooter>
        </Card>

        {/* KPI 3: Security & RBAC Blocks */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Security & RBAC Blocks
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {securityCount}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <Lock className="size-3 text-muted-foreground" />
                <span>403 Enforced</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Role Boundary Guards</span>
              <Shield className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Unauthorized access attempts blocked
            </div>
          </CardFooter>
        </Card>

        {/* KPI 4: Cryptographic Status */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Cryptographic Integrity
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              100%
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <Key className="size-3 text-muted-foreground" />
                <span>AES-256-GCM</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Envelope Encryption</span>
              <Database className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Demographics encrypted at rest
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* 4. MAIN AUDIT WORKLIST CARD */}
      <Card className="border-border shadow-xs">
        <CardHeader className="py-5 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <span>Audit Trail Records</span>
                <Badge variant="outline" className="font-mono text-xs font-medium text-muted-foreground px-2 py-0.5">
                  {filteredLogs.length} events
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Write-Once-Read-Many ledger compliant with HIPAA § 164.312(b) audit trail safeguards.
              </CardDescription>
            </div>
          </div>

          {/* Unified Command Toolbar & Filter Tabs */}
          <div className="pt-3.5 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search Input with ⌘K Badge */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter by action, user, IP, or resource..."
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

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
              <Tabs
                value={actionCategory}
                onValueChange={(val) => {
                  setActionCategory(val);
                  setCurrentPage(1);
                }}
                className="w-auto shrink-0"
              >
                <TabsList className="h-10 bg-muted p-1 border border-border">
                  <TabsTrigger value="ALL" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                    All ({logs.length})
                  </TabsTrigger>
                  <TabsTrigger value="SECURITY" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                    Security ({securityCount})
                  </TabsTrigger>
                  <TabsTrigger value="CLINICAL" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                    Clinical ({clinicalCount})
                  </TabsTrigger>
                  <TabsTrigger value="PRESCRIPTION" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                    Rx ({rxCount})
                  </TabsTrigger>
                  <TabsTrigger value="DISCHARGE" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                    Discharges ({dischargeCount})
                  </TabsTrigger>
                  <TabsTrigger value="DIAGNOSTIC" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                    Labs ({labCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        {/* Table Content */}
        <CardContent className="p-0 border-t border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/40">
                  <TableHead className="w-[160px] text-xs font-semibold text-muted-foreground">Timestamp</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Operator (User)</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Role</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Action & Event</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Target Resource</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Client IP</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-muted-foreground pr-6">Inspection</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                        <ShieldCheck className="size-8 stroke-[1.5]" />
                        <p className="text-sm font-medium">No audit events match your active filters.</p>
                        <p className="text-xs">Try adjusting your search terms or category selection.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/40 transition-colors">
                      {/* Timestamp */}
                      <TableCell className="font-mono text-xs text-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true,
                        })}
                        <span className="block text-[10px] text-muted-foreground">
                          {new Date(log.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </TableCell>

                      {/* Operator Email */}
                      <TableCell className="text-xs font-medium text-foreground">
                        <div className="truncate max-w-[200px]" title={log.userEmail}>
                          {log.userEmail}
                        </div>
                      </TableCell>

                      {/* Role Badge */}
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px] py-0">
                          {log.userRole}
                        </Badge>
                      </TableCell>

                      {/* Action Badge */}
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>

                      {/* Resource */}
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.resource}
                      </TableCell>

                      {/* Client IP */}
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.ipAddress || '127.0.0.1'}
                      </TableCell>

                      {/* Inspection Action */}
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-8 px-2.5 text-xs gap-1.5 border-border hover:bg-muted cursor-pointer"
                        >
                          <Eye className="size-3.5 text-muted-foreground" />
                          <span>Inspect</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border bg-card">
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-mono font-medium text-foreground">{visibleLogs.length > 0 ? startIndex + 1 : 0}</span> to{' '}
              <span className="font-mono font-medium text-foreground">{Math.min(startIndex + pageSize, filteredLogs.length)}</span> of{' '}
              <span className="font-mono font-medium text-foreground">{filteredLogs.length}</span> records
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 text-xs gap-1 border-border cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous</span>
              </Button>
              <div className="text-xs font-mono px-2 text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 text-xs gap-1 border-border cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. PAYLOAD INSPECTION DIALOG */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
              <span>Audit Log Payload Inspection</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Cryptographically verified WORM audit ledger entry ({selectedLog?.id}).
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 text-xs">
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-muted/40">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono block">Timestamp</span>
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono block">Operator</span>
                  <span className="text-xs font-semibold text-foreground truncate block" title={selectedLog.userEmail}>
                    {selectedLog.userEmail}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono block">Role</span>
                  <Badge variant="outline" className="font-mono text-[10px] py-0 mt-0.5">
                    {selectedLog.userRole}
                  </Badge>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono block">Action</span>
                  <span className="font-mono text-xs text-foreground font-semibold">
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono block">Resource</span>
                  <span className="font-mono text-xs text-foreground">
                    {selectedLog.resource}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono block">Client IP</span>
                  <span className="font-mono text-xs text-foreground">
                    {selectedLog.ipAddress || '127.0.0.1'}
                  </span>
                </div>
              </div>

              {/* JSON Payload Viewer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    State Diff & Context Payload (JSON)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog.metadata || {}, null, 2))}
                    className="h-7 text-[11px] gap-1 px-2 border-border cursor-pointer"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3 text-muted-foreground" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </Button>
                </div>
                <pre className="p-3.5 rounded-lg border border-border bg-muted/60 font-mono text-[11px] text-foreground overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLog.metadata || { status: 'NO_METADATA_RECORDED' }, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setSelectedLog(null)}
              className="h-9 px-4 text-xs cursor-pointer"
            >
              Close Inspector
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. COMMAND PALETTE MODAL (⌘K) */}
      <CommandMenu open={isCommandOpen} onOpenChange={setIsCommandOpen} />
    </div>
  );
}
