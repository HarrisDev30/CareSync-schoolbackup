'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  Lock,
  Sparkles,
} from 'lucide-react';

interface CdsSafetyTelemetryStripProps {
  totalEvaluated?: number;
  allergyWarningsPrevented?: number;
  statPanicHandled?: number;
  auditPassPercent?: number;
}

export function CdsSafetyTelemetryStrip({
  totalEvaluated = 28,
  allergyWarningsPrevented = 2,
  statPanicHandled = 1,
  auditPassPercent = 100,
}: CdsSafetyTelemetryStripProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Summary Title */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                Clinical Decision Support & Patient Safety Telemetry
              </span>
              <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold py-0">
                ACTIVE
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Automated cross-allergy detection, panic limit alerts, and immutable HIPAA trail.
            </p>
          </div>
        </div>

        {/* Right: 4 Micro Telemetry Metrics */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/70 font-mono">
            <Sparkles className="size-3.5 text-primary" />
            <span>
              <strong>{totalEvaluated}</strong> Safety Checks Run
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 font-mono">
            <AlertTriangle className="size-3.5 text-amber-600" />
            <span>
              <strong>{allergyWarningsPrevented}</strong> Allergy Interventions
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 font-mono">
            <Flame className="size-3.5 text-rose-600" />
            <span>
              <strong>{statPanicHandled}</strong> STAT Panic Actioned
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/70 font-mono text-muted-foreground">
            <Lock className="size-3.5" />
            <span>
              <strong>{auditPassPercent}%</strong> HIPAA Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

