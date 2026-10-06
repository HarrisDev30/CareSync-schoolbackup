'use client';

import React from 'react';
import {
  Beaker,
  AlertTriangle,
  Activity,
  CheckCircle2,
  FileCheck,
  Clock,
  Sparkles,
  Flame,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface LabsKpiGridProps {
  totalOrders: number;
  statAndUrgentCount: number;
  inAnalysisCount: number;
  verifiedCount: number;
}

export function LabsKpiGrid({
  totalOrders,
  statAndUrgentCount,
  inAnalysisCount,
  verifiedCount,
}: LabsKpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
      {/* 1. Total Diagnostic Pipeline */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Total Diagnostic Orders
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {totalOrders}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
              <Beaker className="size-3 text-muted-foreground" />
              <span>Pipeline</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>Diagnostic Volume</span>
            <FileCheck className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            Total clinical laboratory requisitions on file
          </div>
        </CardFooter>
      </Card>

      {/* 2. STAT & Urgent Triage */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            High-Priority Triage
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {statAndUrgentCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className={`flex items-center gap-1.5 rounded-lg text-xs font-medium ${
                statAndUrgentCount > 0
                  ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'text-muted-foreground'
              }`}
            >
              {statAndUrgentCount > 0 ? (
                <>
                  <span className="size-1.5 rounded-full bg-red-500 animate-ping" />
                  <span>STAT / Urgent</span>
                </>
              ) : (
                <>
                  <Clock className="size-3 text-muted-foreground" />
                  <span>Triage Normal</span>
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>Critical Turnaround Queue</span>
            <Flame className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            {statAndUrgentCount === 0
              ? 'Zero immediate stat runs pending'
              : `${statAndUrgentCount} orders requiring expedited lab turnaround`}
          </div>
        </CardFooter>
      </Card>

      {/* 3. In Specimen Analysis */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            In Specimen Analysis
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {inAnalysisCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Activity className="size-3 animate-spin" />
              <span>In Lab Run</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>Active Specimen Processing</span>
            <Clock className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            {inAnalysisCount === 0
              ? 'All collected specimens resulted'
              : `${inAnalysisCount} specimens undergoing analyzer processing`}
          </div>
        </CardFooter>
      </Card>

      {/* 4. Verified & Certified */}
      <Card className="@container/card border-border">
        <CardHeader className="relative pb-2">
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Verified & Certified
          </CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
            {verifiedCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3" />
              <span>Certified</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
          <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
            <span>Quality Assurance Sign-Off</span>
            <Sparkles className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            CLIA-certified findings released to attending physicians
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
