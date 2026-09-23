'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const CHART_CONFIG = {
  scheduled: {
    label: 'Expected Consultations',
    color: '#0f172a',
  },
  checkedIn: {
    label: 'Admitted & Checked In',
    color: '#64748b',
  },
} satisfies ChartConfig;

export interface InteractiveFlowChartCardProps {
  className?: string;
  chartView: 'TODAY' | 'WEEK';
  onChartViewChange: (view: 'TODAY' | 'WEEK') => void;
  dynamicFlowData: Array<{ hour: string; scheduled: number; checkedIn: number }>;
  peakFlowInfo: string;
}

export function InteractiveFlowChartCard({
  className,
  chartView,
  onChartViewChange,
  dynamicFlowData,
  peakFlowInfo,
}: InteractiveFlowChartCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totalScheduled = dynamicFlowData.reduce((acc, curr) => acc + curr.scheduled, 0);
  const totalCheckedIn = dynamicFlowData.reduce((acc, curr) => acc + curr.checkedIn, 0);

  return (
    <Card className={className}>
      <CardHeader className="py-5 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span>Outpatient Flow & Volume</span>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {chartView === 'TODAY'
                ? 'Hourly outpatient schedule vs actual patient check-in pacing.'
                : '7-day outpatient intake and consultation trends.'}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2.5">
            <Tabs
              value={chartView}
              onValueChange={(v) => onChartViewChange(v as 'TODAY' | 'WEEK')}
              className="w-auto"
            >
              <TabsList className="h-9 bg-muted p-0.5 border border-border">
                <TabsTrigger value="TODAY" className="text-xs px-3 py-1 font-medium">
                  Today
                </TabsTrigger>
                <TabsTrigger value="WEEK" className="text-xs px-3 py-1 font-medium">
                  7-Day
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              title={isCollapsed ? 'Expand analytics chart' : 'Collapse analytics chart'}
            >
              {isCollapsed ? (
                <div className="flex items-center gap-1.5 font-medium">
                  <span>Show Chart</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-medium">
                  <span>Hide</span>
                  <ChevronUp className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="px-6 pb-6 pt-0">
          <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[280px] w-full">
            <AreaChart
              data={dynamicFlowData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillScheduled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-scheduled)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--color-scheduled)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fillCheckedIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-checkedIn)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-checkedIn)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="text-xs font-mono text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="text-xs font-mono text-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Area
                type="monotone"
                dataKey="scheduled"
                stroke="var(--color-scheduled)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#fillScheduled)"
              />
              <Area
                type="monotone"
                dataKey="checkedIn"
                stroke="var(--color-checkedIn)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#fillCheckedIn)"
              />
            </AreaChart>
          </ChartContainer>

          <div className="mt-4 pt-3.5 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
                <span className="font-medium text-foreground">Scheduled ({totalScheduled})</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                <span className="font-medium text-foreground">Admitted ({totalCheckedIn})</span>
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
              <span>{peakFlowInfo}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
