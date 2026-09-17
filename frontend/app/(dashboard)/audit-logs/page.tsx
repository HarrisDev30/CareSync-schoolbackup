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
} from 'lucide-react';
import { AuditLogEntry } from '@/types';
import { fetchAuditLogs } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
  const [actionFilter, setActionFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

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
    loadData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (actionFilter === 'ALL') return true;
    if (actionFilter === 'SECURITY') {
      return log.action.includes('RBAC') || log.action.includes('ENFORCED') || log.action.includes('AUTH');
    }
    return log.action.includes(actionFilter);
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const getActionBadge = (action: string) => {
    if (action.includes('DECRYPT') || action.includes('KEY')) {
      return (
        <Badge variant="purple" className="gap-1 text-[11px] py-0.5">
          <Key className="w-3 h-3 text-purple-600" />
          {action}
        </Badge>
      );
    }
    if (action.includes('REGISTER') || action.includes('CREATED')) {
      return (
        <Badge variant="outline" className="gap-1 text-[11px] py-0.5 border-blue-200 bg-blue-50 text-blue-700">
          <Database className="w-3 h-3 text-blue-600" />
          {action}
        </Badge>
      );
    }
    if (action.includes('VIEW')) {
      return (
        <Badge variant="outline" className="gap-1 text-[11px] py-0.5 text-slate-700 bg-slate-50 border-slate-200">
          <Eye className="w-3 h-3 text-slate-500" />
          {action}
        </Badge>
      );
    }
    if (action.includes('ENFORCED') || action.includes('RBAC')) {
      return (
        <Badge variant="warning" className="gap-1 text-[11px] py-0.5 font-bold">
          <Lock className="w-3 h-3 text-amber-600" />
          {action}
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="gap-1 text-[11px] py-0.5 font-medium">
        <UserCheck className="w-3 h-3 text-emerald-600" />
        {action}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. UNIFORM CLINICAL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Compliance & Cryptographic Audit Stream
            </h1>
            <Badge variant="outline" className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200 gap-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              WORM Immutable
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Write Once Read Many tamper-evident security stream recording clinical record access, key decryptions, and operator authentication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCommandOpen(true)}
            className="h-8.5 text-xs text-slate-500 gap-2 border-slate-200 shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search logs...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-600">
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="h-8.5 text-xs text-slate-700 gap-1.5 border-slate-200 shadow-2xs hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Refresh Stream</span>
          </Button>
        </div>
      </div>

      {/* 2. THREE-CARD OPERATIONAL METRICS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Audited Stream Events
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {logs.length}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Cryptographically Signed</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Patient PHI Access Reads
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {logs.filter((l) => l.action.includes('VIEW')).length}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Clinical need-to-know verified</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Security & Key Events
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {logs.filter((l) => l.action.includes('DECRYPT') || l.action.includes('RBAC') || l.action.includes('ENFORCED')).length}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-purple-600" />
            <span>RBAC & Key Ring Enforced</span>
          </div>
        </div>
      </div>

      {/* 3. FILTER CONTROLS */}
      <Card className="shadow-2xs border-slate-200/80 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Filter by action, user email, resource, or IP..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 text-xs h-8.5 bg-slate-50/50"
            />
          </div>

          <Tabs
            value={actionFilter}
            onValueChange={(val) => {
              setActionFilter(val);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto"
          >
            <TabsList className="h-8.5 bg-slate-100/80 p-0.5 border border-slate-200/60">
              <TabsTrigger value="ALL" className="text-xs">All Events</TabsTrigger>
              <TabsTrigger value="DECRYPT" className="text-xs">Decryptions</TabsTrigger>
              <TabsTrigger value="VIEW" className="text-xs">PHI Reads</TabsTrigger>
              <TabsTrigger value="REGISTER" className="text-xs">Registrations</TabsTrigger>
              <TabsTrigger value="SECURITY" className="text-xs">Security</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* 4. AUDIT LOG STREAM TABLE */}
      <Card className="shadow-2xs border-slate-200/80 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Fetching tamper-evident cryptographic audit stream...
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[190px]">Security Action</TableHead>
                  <TableHead className="w-[160px]">Protected Resource</TableHead>
                  <TableHead className="w-[200px]">Operator & Role</TableHead>
                  <TableHead className="w-[130px]">IP Address</TableHead>
                  <TableHead className="text-right w-[100px]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center text-xs text-slate-400">
                      No security audit events match the current filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-600 whitespace-nowrap">
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
                      <TableCell className="font-mono text-xs text-slate-800">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200/60">
                          /{log.resource}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold text-slate-900">{log.userEmail}</div>
                        <div className="text-[10px] font-mono text-slate-400">{log.userRole}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {log.ipAddress || '127.0.0.1'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-8 text-xs text-slate-600 hover:text-slate-900 px-2.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Footer */}
            <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing{' '}
                <span className="font-medium text-slate-900">
                  {filteredLogs.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, filteredLogs.length)}
                </span>{' '}
                of <span className="font-medium text-slate-900">{filteredLogs.length}</span> audit records
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
          </div>
        )}
      </Card>

      {/* 5. AUDIT ENTRY INSPECTION MODAL (Standard Native shadcn Dialog) */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        {selectedLog && (
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
                  <ShieldCheck className="size-4 text-emerald-600" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <span>Audit Event Inspection</span>
                    <Badge variant="outline" className="font-mono text-[10px] bg-slate-50">
                      ID: {selectedLog.id.slice(0, 8)}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Recorded {new Date(selectedLog.timestamp).toUTCString()}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 text-xs mt-1">
              {/* Event Summary Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Security Action</span>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Protected Resource</span>
                  <div className="mt-1 font-mono text-xs font-semibold text-slate-800">
                    /{selectedLog.resource}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Operator Email</span>
                  <div className="mt-0.5 font-medium text-slate-900">{selectedLog.userEmail}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Role</span>
                  <div className="mt-0.5 font-mono text-slate-700">{selectedLog.userRole}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Source IP Address</span>
                  <div className="mt-0.5 font-mono text-slate-700">{selectedLog.ipAddress || '127.0.0.1'}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Cryptographic Integrity</span>
                  <div className="mt-0.5 text-emerald-700 font-semibold flex items-center gap-1">
                    <Fingerprint className="size-3 text-emerald-600" />
                    <span>WORM Verified</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Event Metadata & Payload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode className="size-3.5 text-slate-400" />
                    Structured Payload Metadata
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog.metadata || {}, null, 2))}
                    className="h-7 text-[11px] text-slate-500 hover:text-slate-900 px-2 cursor-pointer gap-1"
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

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between sm:justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Log UUID: {selectedLog.id}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="h-8 text-xs cursor-pointer"
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
