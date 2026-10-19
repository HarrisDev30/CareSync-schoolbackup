'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Clock,
  Pill,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  PhoneCall,
  XCircle,
  FileText,
  UserCheck,
  Check,
  Building2,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  HospitalRoom,
  PrescriptionRefillRequest,
  LabOrder,
  Patient,
  StaffUser,
} from '@/types';
import {
  fetchHospitalRooms,
  fetchPrescriptionRefillRequests,
  reviewPrescriptionRefill,
  fetchLabOrders,
  triggerRecollectionRequisition,
} from '@/lib/api';

interface PhysicianInbasketProps {
  currentStaff: StaffUser;
  patients: Patient[];
  onViewChart: (patient: Patient) => void;
  onToast: (type: 'success' | 'error', text: string) => void;
}

export function PhysicianInbasket({
  currentStaff,
  patients,
  onViewChart,
  onToast,
}: PhysicianInbasketProps) {
  const [activeTab, setActiveTab] = useState<'rooms' | 'refills' | 'panics' | 'recollections'>('rooms');
  const [rooms, setRooms] = useState<HospitalRoom[]>([]);
  const [refills, setRefills] = useState<PrescriptionRefillRequest[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadInbasketData = async () => {
    setIsLoading(true);
    try {
      const [roomsData, refillsData, labsData] = await Promise.all([
        fetchHospitalRooms(),
        fetchPrescriptionRefillRequests(),
        fetchLabOrders(),
      ]);
      setRooms(roomsData);
      setRefills(refillsData);
      setLabOrders(labsData);
    } catch {
      // Non-fatal inbasket sync fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInbasketData();
  }, []);

  // Filter queues
  const waitingRooms = rooms.filter(
    (r) => (r.status === 'IN_USE' || r.status === 'STAT_EMERGENCY') && r.assignedPatient,
  );

  const pendingRefills = refills.filter((r) => r.status === 'PENDING');

  const panicOrders = labOrders.filter(
    (o) =>
      o.results?.some((r) => r.isPanicValue || (r as any).isPanic || (r as any).flag === 'CRITICAL') &&
      o.status !== 'REVIEWED' &&
      o.status !== 'COMPLETED',
  );

  const recollectionOrders = labOrders.filter(
    (o) => o.status === 'REJECTED' && o.recollectionRequired && !o.recollectionRequisitionId,
  );

  const totalInbasketItems =
    waitingRooms.length + pendingRefills.length + panicOrders.length + recollectionOrders.length;

  // Handlers
  const handleApproveRefill = async (refill: PrescriptionRefillRequest) => {
    setActionInProgress(refill.id);
    const res = await reviewPrescriptionRefill(refill.id, 'APPROVE', 'Approved 30-day maintenance supply renewal.');
    if (res.success && res.data) {
      setRefills((prev) => prev.map((r) => (r.id === refill.id ? res.data! : r)));
      onToast('success', `Refill approved for ${refill.patientName} (${refill.medicationName}).`);
    } else {
      onToast('error', res.error || 'Failed to approve prescription refill.');
    }
    setActionInProgress(null);
  };

  const handleDenyRefill = async (refill: PrescriptionRefillRequest) => {
    setActionInProgress(refill.id);
    const res = await reviewPrescriptionRefill(refill.id, 'DENY', 'Denied. In-person clinical consultation required.');
    if (res.success && res.data) {
      setRefills((prev) => prev.map((r) => (r.id === refill.id ? res.data! : r)));
      onToast('success', `Refill denied for ${refill.patientName}. Patient notified to schedule consult.`);
    } else {
      onToast('error', res.error || 'Failed to deny prescription refill.');
    }
    setActionInProgress(null);
  };

  const handleAuthorizeRecollection = async (order: LabOrder) => {
    setActionInProgress(order.id);
    const res = await triggerRecollectionRequisition(order.id);
    if (res.success && res.data) {
      setLabOrders((prev) => [
        res.data!,
        ...prev.map((o) => (o.id === order.id ? { ...o, recollectionRequisitionId: res.data!.id } : o)),
      ]);
      onToast('success', `Recollection requisition ${res.data.orderNumber} authorized for ${order.patientName}.`);
    } else {
      onToast('error', res.error || 'Failed to authorize specimen recollection.');
    }
    setActionInProgress(null);
  };

  const findPatientForRoom = (room: HospitalRoom): Patient | undefined => {
    return patients.find((p) => p.mrn === room.mrn || p.id === room.patientId);
  };

  return (
    <Card className="border-border bg-card shadow-xs overflow-hidden">
      <CardHeader className="py-4 px-6 bg-muted/40 border-b border-border/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Stethoscope className="size-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                  Attending Physician Clinical Inbasket & Action Center
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`text-xs font-mono font-semibold px-2 py-0.5 ${
                    totalInbasketItems > 0
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {totalInbasketItems} Active Actions
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Real-time room occupancy, pending pharmacy refill authorizations, and CLIA critical panic laboratory findings.
              </CardDescription>
            </div>
          </div>

          {/* Queue Filter Segmented Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="w-auto shrink-0"
          >
            <TabsList className="h-10 bg-muted p-1 border border-border">
              <TabsTrigger value="rooms" className="text-xs px-3 py-1.5 font-medium gap-1.5">
                <Building2 className="size-3.5" />
                <span>In Exam Rooms ({waitingRooms.length})</span>
              </TabsTrigger>
              <TabsTrigger value="refills" className="text-xs px-3 py-1.5 font-medium gap-1.5">
                <Pill className="size-3.5" />
                <span>Refills ({pendingRefills.length})</span>
              </TabsTrigger>
              <TabsTrigger value="panics" className="text-xs px-3 py-1.5 font-medium gap-1.5">
                <AlertTriangle className="size-3.5 text-red-500" />
                <span>Panic Labs ({panicOrders.length})</span>
              </TabsTrigger>
              <TabsTrigger value="recollections" className="text-xs px-3 py-1.5 font-medium gap-1.5">
                <RotateCcw className="size-3.5 text-amber-500" />
                <span>Recollect ({recollectionOrders.length})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Synchronizing physician clinical action queues...
          </div>
        ) : (
          <>
            {/* 1. ROOM OCCUPANCY / IN CONSULT PATIENTS */}
            {activeTab === 'rooms' && (
              <div>
                {waitingRooms.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="size-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                    <p className="text-sm font-medium text-foreground">No patients currently waiting in exam suites</p>
                    <p className="text-xs text-muted-foreground mt-1">All outpatient rooms are currently available or sanitized.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {waitingRooms.map((room) => {
                      const matchedPatient = findPatientForRoom(room);
                      const isAssignedToDoctor =
                        room.assignedDoctor?.toLowerCase().includes(currentStaff.fullName.toLowerCase()) ||
                        room.assignedDoctor?.toLowerCase().includes('sarah chen') ||
                        room.assignedDoctor?.toLowerCase().includes('marcus vance');

                      return (
                        <div
                          key={room.id}
                          className={`p-4 rounded-lg border transition-all ${
                            isAssignedToDoctor
                              ? 'border-primary/40 bg-primary/5 hover:border-primary/60'
                              : 'border-border bg-card hover:bg-muted/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-foreground">
                                  {room.roomNumber}
                                </span>
                                <Badge variant="outline" className="text-[10px] bg-muted/60 text-muted-foreground">
                                  {room.wing}
                                </Badge>
                              </div>
                              <div className="text-xs font-semibold text-primary mt-1">
                                {room.assignedPatient}
                              </div>
                              <div className="font-mono text-[11px] text-muted-foreground">
                                {room.mrn}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-mono shrink-0 gap-1"
                            >
                              <Clock className="size-2.5" />
                              <span>{room.elapsedMinutes || 15}m in suite</span>
                            </Badge>
                          </div>

                          <div className="mt-2.5 text-xs text-muted-foreground bg-muted/40 p-2 rounded border border-border/60">
                            <span className="font-medium text-foreground">Reason: </span>
                            {room.reason || 'Routine Outpatient Examination'}
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                            <span className="text-[11px] text-muted-foreground truncate">
                              MD: {room.assignedDoctor || 'Attending Physician'}
                            </span>
                            {matchedPatient ? (
                              <Button
                                size="sm"
                                onClick={() => onViewChart(matchedPatient)}
                                className="h-8 text-xs px-3 gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-medium shrink-0"
                              >
                                <FileText className="size-3.5" />
                                <span>Open Chart</span>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 text-xs px-3 gap-1.5 cursor-pointer border-border shrink-0"
                              >
                                <Link href="/consultations">
                                  <span>Consultation</span>
                                  <ChevronRight className="size-3.5" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. PENDING PRESCRIPTION REFILLS */}
            {activeTab === 'refills' && (
              <div>
                {pendingRefills.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="size-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                    <p className="text-sm font-medium text-foreground">No prescription refill requests pending authorization</p>
                    <p className="text-xs text-muted-foreground mt-1">All outpatient pharmacy renewals are up to date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {pendingRefills.map((refill) => (
                      <div
                        key={refill.id}
                        className="p-4 rounded-lg border border-border bg-card flex flex-col justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground">
                                {refill.medicationName}
                              </span>
                              <Badge variant="outline" className="text-xs font-mono bg-muted">
                                {refill.dosage}
                              </Badge>
                            </div>
                            <div className="text-xs text-foreground font-medium mt-1">
                              Patient: {refill.patientName}{' '}
                              <span className="font-mono text-muted-foreground">({refill.patientMrn})</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              Prescribed by: {refill.prescribedBy} • Requested {new Date(refill.requestedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold shrink-0"
                          >
                            Authorization Required
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded border border-border/60">
                          <span className="font-medium text-foreground">Pharmacy Clinical Note: </span>
                          {refill.notes}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionInProgress === refill.id}
                            onClick={() => handleDenyRefill(refill)}
                            className="h-8 text-xs px-3 text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer font-medium"
                          >
                            <XCircle className="size-3.5 mr-1" />
                            <span>Deny & Require Consult</span>
                          </Button>
                          <Button
                            size="sm"
                            disabled={actionInProgress === refill.id}
                            onClick={() => handleApproveRefill(refill)}
                            className="h-8 text-xs px-3 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
                          >
                            <Check className="size-3.5" />
                            <span>Authorize 30-Day Supply</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. CRITICAL PANIC LAB RESULTS */}
            {activeTab === 'panics' && (
              <div>
                {panicOrders.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="size-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                    <p className="text-sm font-medium text-foreground">No unreviewed CLIA critical panic values</p>
                    <p className="text-xs text-muted-foreground mt-1">All urgent diagnostic findings have been certified and reviewed.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {panicOrders.map((order) => {
                      const panicResults = order.results?.filter((r) => r.isPanicValue || (r as any).isPanic || (r as any).flag === 'CRITICAL') || [];

                      return (
                        <div
                          key={order.id}
                          className="p-4 rounded-lg border border-red-500/40 bg-red-500/5 flex flex-col justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-foreground">
                                  {order.testName}
                                </span>
                                <Badge variant="outline" className="border-red-500 bg-red-500 text-white text-[10px] font-bold">
                                  STAT PANIC
                                </Badge>
                              </div>
                              <div className="text-xs text-foreground font-medium mt-1">
                                Patient: {order.patientName}{' '}
                                <span className="font-mono text-muted-foreground">({order.mrn})</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                Order #{order.orderNumber} • Requisitioned by {order.requestedBy}
                              </div>
                            </div>
                            {order.panicCallLog ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shrink-0 gap-1"
                                title={`Called to ${order.panicCallLog.calledTo}`}
                              >
                                <PhoneCall className="size-3 text-emerald-600 dark:text-emerald-400" />
                                <span>MD Notified</span>
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-red-500/40 bg-red-500/15 text-red-600 dark:text-red-400 text-xs font-semibold shrink-0 gap-1 animate-pulse"
                              >
                                <AlertTriangle className="size-3 text-red-500" />
                                <span>Phone Call Pending</span>
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1.5 bg-background/80 p-2.5 rounded border border-border/60">
                            {panicResults.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="font-medium text-foreground">{item.parameter || (item as any).testName || 'Biomarker'}:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-red-600 dark:text-red-400">
                                    {item.value} {item.unit}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    (Ref: {item.referenceRange})
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                            <span className="text-[11px] text-muted-foreground">
                              {order.panicCallLog
                                ? `Read-back confirmed by ${order.panicCallLog.callerName}`
                                : 'Immediate clinical assessment required'}
                            </span>
                            <Button
                              size="sm"
                              asChild
                              className="h-8 text-xs px-3 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium cursor-pointer"
                            >
                              <Link href="/labs">
                                <span>Open Lab Workbench</span>
                                <ExternalLink className="size-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. SPECIMEN RECOLLECTION AUTHORIZATIONS */}
            {activeTab === 'recollections' && (
              <div>
                {recollectionOrders.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="size-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                    <p className="text-sm font-medium text-foreground">No rejected specimens requiring physician recollection</p>
                    <p className="text-xs text-muted-foreground mt-1">All laboratory collection requisitions are fulfilled.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {recollectionOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-lg border border-amber-500/40 bg-amber-500/5 flex flex-col justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground">
                                {order.testName}
                              </span>
                              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
                                Specimen Rejected
                              </Badge>
                            </div>
                            <div className="text-xs text-foreground font-medium mt-1">
                              Patient: {order.patientName}{' '}
                              <span className="font-mono text-muted-foreground">({order.mrn})</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              Requisition #{order.orderNumber} • Container: {order.specimenTube || 'Lavender EDTA'}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium shrink-0"
                          >
                            CLIA Exception
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded border border-border/60">
                          <span className="font-medium text-foreground">QA Rejection Reason: </span>
                          {order.rejectionReason || 'Specimen hemolyzed > 500 mg/dL'}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                          <Button
                            size="sm"
                            disabled={actionInProgress === order.id}
                            onClick={() => handleAuthorizeRecollection(order)}
                            className="h-8 text-xs px-3 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-pointer"
                          >
                            <RotateCcw className="size-3.5" />
                            <span>Authorize Replacement Requisition</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

