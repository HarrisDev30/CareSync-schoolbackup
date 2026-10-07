'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Stethoscope,
  Beaker,
  CheckCircle2,
  ArrowRight,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface PatientThroughputStreamProps {
  intakeCount: number;
  consultCount: number;
  labCount: number;
  dischargedCount: number;
  avgWaitMins: number;
  avgConsultMins: number;
  avgLabTatMins: number;
}

export function PatientThroughputStream({
  intakeCount = 4,
  consultCount = 3,
  labCount = 2,
  dischargedCount = 6,
  avgWaitMins = 8,
  avgConsultMins = 24,
  avgLabTatMins = 28,
}: PatientThroughputStreamProps) {
  const stages = [
    {
      id: 'intake',
      label: '1. Walk-In & Triage Waiting',
      count: intakeCount,
      metricLabel: 'Avg Wait',
      metricValue: `${avgWaitMins}m`,
      statusClass: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
      icon: Users,
      desc: 'Patients in outpatient waiting lounge',
    },
    {
      id: 'consult',
      label: '2. Active In-Consultation',
      count: consultCount,
      metricLabel: 'Avg Duration',
      metricValue: `${avgConsultMins}m`,
      statusClass: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
      icon: Stethoscope,
      desc: 'Active physician encounters in exam suites',
    },
    {
      id: 'lab',
      label: '3. Diagnostic Analyzer Run',
      count: labCount,
      metricLabel: 'Avg Lab TAT',
      metricValue: `${avgLabTatMins}m`,
      statusClass: 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300',
      icon: Beaker,
      desc: 'Specimens running on automated benches',
    },
    {
      id: 'discharge',
      label: '4. Discharged & Rx Dispensed',
      count: dischargedCount,
      metricLabel: 'Resolved Today',
      metricValue: `${dischargedCount} Patients`,
      statusClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
      icon: CheckCircle2,
      desc: 'Encounter closed with official care summary',
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <span>Real-Time Patient Flow Velocity & Operational Throughput</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live velocity of patients moving through intake, clinical consultation, lab testing, and discharge.
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-xs self-start sm:self-center">
          Total Outpatient Volume: {intakeCount + consultCount + labCount + dischargedCount}
        </Badge>
      </div>

      {/* Horizontal Flow River */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 relative">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.id}
              className={`p-3.5 rounded-xl border ${stage.statusClass} flex flex-col justify-between space-y-2 bg-card/60 backdrop-blur-xs shadow-2xs`}
            >
              {/* Top Row: Icon + Count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-background/80 border border-border/60">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">{stage.label}</span>
                </div>
                <span className="font-mono text-base font-extrabold">{stage.count}</span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {stage.desc}
              </p>

              {/* Bottom Metric */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted-foreground">{stage.metricLabel}:</span>
                <strong className="text-foreground">{stage.metricValue}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

