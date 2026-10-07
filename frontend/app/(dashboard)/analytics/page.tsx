'use client';

import React, { useState, useEffect } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Clock,
  Activity,
  Building2,
  Download,
  RefreshCw,
  Stethoscope,
  Beaker,
  DoorOpen,
} from 'lucide-react';
import {
  fetchHospitalCensus,
  fetchHospitalMetrics,
  fetchDiagnosticTat,
  HospitalCensusData,
  HospitalMetricsData,
  DiagnosticTatData,
} from '@/lib/api';

// Hourly Patient Throughput Flow
const HOURLY_FLOW_DATA = [
  { hour: '08:00', intake: 2, discharge: 0 },
  { hour: '09:00', intake: 5, discharge: 1 },
  { hour: '10:00', intake: 8, discharge: 3 },
  { hour: '11:00', intake: 11, discharge: 5 },
  { hour: '12:00', intake: 9, discharge: 7 },
  { hour: '13:00', intake: 12, discharge: 8 },
  { hour: '14:00', intake: 14, discharge: 10 },
  { hour: '15:00', intake: 11, discharge: 12 },
  { hour: '16:00', intake: 6, discharge: 13 },
];

// TAT SLA Benchmark Comparison
const TAT_BENCHMARKS = [
  { category: 'STAT Emergency', actualMinutes: 11.2, targetSlaMinutes: 30 },
  { category: 'Urgent Priority', actualMinutes: 22.4, targetSlaMinutes: 45 },
  { category: 'Routine Outpatient', actualMinutes: 38.0, targetSlaMinutes: 60 },
];

// Doctor Consultation Workload
const DOCTOR_WORKLOAD_DATA = [
  { doctor: 'Dr. Sarah Chen', specialty: 'General Practice', completed: 8, avgDuration: 20.4 },
  { doctor: 'Dr. Marcus Vance', specialty: 'Cardiology', completed: 6, avgDuration: 28.0 },
  { doctor: 'Dr. Olivia Bennett', specialty: 'OB/GYN', completed: 5, avgDuration: 24.5 },
  { doctor: 'Elena Rostova, CLS', specialty: 'Pathology & Lab', completed: 18, avgDuration: 12.0 },
];

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

// Custom Opaque Tooltip for Cartesian Charts (Area/Bar)
const CustomChartTooltip = ({ active, payload, label, unit = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-xs space-y-1.5 min-w-[150px]">
        {label && (
          <div className="font-semibold text-foreground pb-1 border-b border-border/60">
            {label}
          </div>
        )}
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="font-mono font-semibold text-foreground">
                {entry.value}
                {unit ? ` ${unit}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Opaque Tooltip for Pie / Donut Charts
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border border-border bg-card p-2.5 shadow-lg text-xs">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full shrink-0"
            style={{ backgroundColor: data.payload.fill || data.color }}
          />
          <span className="text-foreground font-semibold">{data.name}:</span>
          <span className="font-mono font-medium text-foreground">{data.value} tests</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'YTD'>('TODAY');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [census, setCensus] = useState<HospitalCensusData | null>(null);
  const [metrics, setMetrics] = useState<HospitalMetricsData | null>(null);
  const [tatData, setTatData] = useState<DiagnosticTatData | null>(null);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [c, m, t] = await Promise.all([
        fetchHospitalCensus(),
        fetchHospitalMetrics(),
        fetchDiagnosticTat(),
      ]);
      setCensus(c);
      setMetrics(m);
      setTatData(t);
    } catch {
      // fallback values
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrintReport = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const categoryChartData = tatData?.volumeByCategory
    ? Object.entries(tatData.volumeByCategory).map(([name, value]) => ({ name, value }))
    : [
        { name: 'Clinical Chemistry', value: 26 },
        { name: 'Hematology', value: 18 },
        { name: 'Cardiac Biomarkers', value: 9 },
        { name: 'Coagulation', value: 6 },
      ];

  const intakeCount = metrics?.todayPatientIntake ?? 14;
  const avgDuration = metrics?.averageConsultationDurationMinutes ?? 22.5;
  const tatCompliance = tatData?.targetComplianceRatePercent ?? 96.2;
  const occupancyRate = census?.occupancyRatePercent ?? 63.6;
  const availableSuites = census?.availableCount ?? 3;
  const inUseSuites = census?.inUseCount ?? 6;

  return (
    <div className="w-full space-y-6 print:space-y-4">
      {/* 1. COMMAND HEADER (Strict DESIGN.md §2 Standard) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Hospital Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time hospital census, diagnostic turnaround compliance, clinician workload distribution, and hourly patient throughput.
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Range Filter Tabs */}
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-auto">
            <TabsList className="h-10 bg-muted p-1 border border-border">
              <TabsTrigger value="TODAY" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                Today
              </TabsTrigger>
              <TabsTrigger value="WEEK" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                7 Days
              </TabsTrigger>
              <TabsTrigger value="MONTH" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                Month
              </TabsTrigger>
              <TabsTrigger value="YTD" className="text-xs px-3 py-1.5 font-medium cursor-pointer">
                YTD
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isRefreshing}
            className="gap-2 text-sm text-muted-foreground hover:text-foreground h-10 px-3.5 border-border shadow-none cursor-pointer"
            title="Refresh live telemetry from PostgreSQL"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Live</span>
          </Button>

          <Button
            size="sm"
            onClick={handlePrintReport}
            className="gap-2 h-10 px-4 cursor-pointer active:scale-[0.98] transition-transform bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* 2. TOP 4 KPI METRIC STRIP (Strict dashboard-01 section-cards Standard) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
        {/* KPI 1: Today's Patient Intake */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Today's Patient Intake
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {intakeCount}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <Users className="size-3 text-muted-foreground" />
                <span>+12.5%</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Admissions Trajectory</span>
              <TrendingUp className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Outpatient walk-ins and scheduled admissions
            </div>
          </CardFooter>
        </Card>

        {/* KPI 2: Average Consultation Time */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Avg Consultation Time
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {avgDuration}m
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <Clock className="size-3 text-muted-foreground" />
                <span>On SLA</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Physician Pacing</span>
              <Stethoscope className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Target range 20–30 min per encounter
            </div>
          </CardFooter>
        </Card>

        {/* KPI 3: Diagnostic TAT Compliance */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Diagnostic TAT Compliance
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {tatCompliance}%
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <Activity className="size-3 text-muted-foreground" />
                <span>STAT: 11m</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Lab SLA Benchmark</span>
              <Beaker className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Orders verified within target turnaround
            </div>
          </CardFooter>
        </Card>

        {/* KPI 4: Hospital Suite Occupancy */}
        <Card className="@container/card border-border">
          <CardHeader className="relative pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Hospital Suite Occupancy
            </CardDescription>
            <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-1">
              {occupancyRate}%
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg text-xs font-medium">
                <Building2 className="size-3 text-muted-foreground" />
                <span>{availableSuites} Free</span>
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
            <div className="line-clamp-1 flex items-center gap-2 font-medium text-foreground">
              <span>Active Bed Capacity</span>
              <DoorOpen className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              {inUseSuites} of {inUseSuites + availableSuites} suites currently occupied
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* 3. CHART ROW 1: Patient Admission Flow & Category Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Patient Throughput Hourly Flow Area Chart */}
        <Card className="lg:col-span-2 border-border shadow-xs">
          <CardHeader className="py-5 px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                  Patient Intake & Discharge Hourly Trajectory
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Real-time admissions, outpatient triage volume, and discharge releases.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs font-medium text-muted-foreground">
                Live Roster
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HOURLY_FLOW_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="dischargeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                  <XAxis dataKey="hour" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="intake"
                    name="Intake Registrations"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#intakeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="discharge"
                    name="Discharge Releases"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dischargeGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right: Lab Requisition Volume by Category */}
        <Card className="border-border shadow-xs">
          <CardHeader className="py-5 px-6">
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
              Diagnostic Volume by Category
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Specimen distribution across analytical benches.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Legend List */}
            <div className="space-y-2 pt-3 border-t border-border/60 text-xs">
              {categoryChartData.map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="text-muted-foreground truncate max-w-[150px]">{cat.name}</span>
                  </div>
                  <span className="font-mono font-medium text-foreground">{cat.value} tests</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. CHART ROW 2: Diagnostic Turnaround SLA & Doctor Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Diagnostic Turnaround Time vs SLA Targets */}
        <Card className="border-border shadow-xs">
          <CardHeader className="py-5 px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                  Diagnostic Turnaround Time (TAT) vs. Target SLA
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Mean minutes from order creation to clinical tech verification.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                Target Met
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TAT_BENCHMARKS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                  <XAxis dataKey="category" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} unit="m" tickLine={false} />
                  <Tooltip content={<CustomChartTooltip unit="m" />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="actualMinutes" name="Actual Mean TAT (mins)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="targetSlaMinutes" name="Target SLA Ceiling (mins)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right: Attending Physician Workload & Durations */}
        <Card className="border-border shadow-xs">
          <CardHeader className="py-5 px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                  Clinician Workload & Average Duration
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Encounter volumes and duration metrics per attending provider.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                4 Providers
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DOCTOR_WORKLOAD_DATA} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888820" horizontal={false} />
                  <XAxis type="number" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis dataKey="doctor" type="category" stroke="#888888" fontSize={11} tickLine={false} width={110} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="completed" name="Completed Encounters" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="avgDuration" name="Avg Duration (mins)" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. DEPARTMENTAL WING CAPACITY & BED UTILIZATION (Standard Card §4.1) */}
      <Card className="border-border shadow-xs">
        <CardHeader className="py-5 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                Departmental Wing Capacity
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Real-time room occupancy and capacity utilization across clinical departments.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-muted-foreground self-start sm:self-auto">
              {census?.totalRooms || 11} Total Suites
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {census?.wings ? (
              census.wings.map((w) => (
                <div
                  key={w.name}
                  className="p-4 rounded-xl border border-border bg-background space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground truncate">{w.name}</span>
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {w.occupancyRate}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {w.inUse} in use · {w.available} available · {w.sanitizing} sanitizing
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <Progress value={w.occupancyRate} className="h-2 bg-muted" />
                    <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                      <span>0%</span>
                      <span>{w.total} Suites</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Outpatient Clinic</span>
                    <span className="font-mono text-xs font-semibold text-foreground">50.0%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">2 in use · 1 available · 1 sanitizing</p>
                  <Progress value={50} className="h-2 bg-muted" />
                </div>

                <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Cardiology & Specialty</span>
                    <span className="font-mono text-xs font-semibold text-foreground">66.7%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">2 in use · 1 available</p>
                  <Progress value={66.7} className="h-2 bg-muted" />
                </div>

                <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Diagnostic Laboratory</span>
                    <span className="font-mono text-xs font-semibold text-foreground">75.0%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">2 in use · 1 available · 1 STAT Emergency</p>
                  <Progress value={75} className="h-2 bg-muted" />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
