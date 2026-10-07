'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sparkles,
  Activity,
  Microscope,
  User,
} from 'lucide-react';

export interface RoomOccupancy {
  id: string;
  roomNumber: string;
  wing: 'Outpatient Clinic Wing' | 'Specialty & Cardiology' | 'Diagnostic Laboratory';
  status: 'OCCUPIED' | 'AVAILABLE' | 'SANITIZING' | 'STAT_EMERGENCY';
  physicianName?: string;
  patientName?: string;
  patientMrn?: string;
  indication?: string;
  elapsedMinutes?: number;
  expectedDurationMinutes?: number;
  bedType?: string;
}

interface HospitalFloorGridProps {
  rooms: RoomOccupancy[];
  onSelectRoom: (room: RoomOccupancy) => void;
  selectedWing: string;
}

export function HospitalFloorGrid({
  rooms,
  onSelectRoom,
  selectedWing,
}: HospitalFloorGridProps) {
  const wings = [
    { id: 'ALL', label: 'All Hospital Wings' },
    { id: 'Outpatient Clinic Wing', label: 'Outpatient Clinic Wing' },
    { id: 'Specialty & Cardiology', label: 'Specialty & Cardiology' },
    { id: 'Diagnostic Laboratory', label: 'Diagnostic Laboratory' },
  ];

  const filteredRooms =
    selectedWing === 'ALL'
      ? rooms
      : rooms.filter((r) => r.wing === selectedWing);

  // Group by Wing
  const groupedWings = [
    'Outpatient Clinic Wing',
    'Specialty & Cardiology',
    'Diagnostic Laboratory',
  ].filter((w) => selectedWing === 'ALL' || selectedWing === w);

  return (
    <div className="space-y-6">
      {groupedWings.map((wingName) => {
        const wingRooms = filteredRooms.filter((r) => r.wing === wingName);
        if (wingRooms.length === 0) return null;

        const occupiedCount = wingRooms.filter(
          (r) => r.status === 'OCCUPIED' || r.status === 'STAT_EMERGENCY',
        ).length;

        return (
          <div key={wingName} className="space-y-3">
            {/* Wing Header Strip */}
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {wingName}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono px-2 py-0">
                  {occupiedCount} / {wingRooms.length} Active
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                Capacity: {Math.round((occupiedCount / wingRooms.length) * 100)}% Occupied
              </span>
            </div>

            {/* Room Blocks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {wingRooms.map((room) => {
                const isOccupied = room.status === 'OCCUPIED';
                const isAvailable = room.status === 'AVAILABLE';
                const isSanitizing = room.status === 'SANITIZING';
                const isStat = room.status === 'STAT_EMERGENCY';

                const progressPercent = room.elapsedMinutes && room.expectedDurationMinutes
                  ? Math.min(100, Math.round((room.elapsedMinutes / room.expectedDurationMinutes) * 100))
                  : 0;

                return (
                  <div
                    key={room.id}
                    onClick={() => onSelectRoom(room)}
                    className={`group relative p-3.5 rounded-xl border transition-all duration-150 cursor-pointer shadow-xs text-left flex flex-col justify-between min-h-[140px] hover:shadow-md ${
                      isStat
                        ? 'border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/20 hover:border-rose-500'
                        : isOccupied
                          ? 'border-primary/40 bg-card hover:border-primary/70'
                          : isSanitizing
                            ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70'
                            : 'border-dashed border-border/80 bg-muted/20 hover:border-border hover:bg-card'
                    }`}
                  >
                    {/* Top Row: Room # & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {room.roomNumber}
                        </span>
                        {room.bedType && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            ({room.bedType})
                          </span>
                        )}
                      </div>

                      {/* Status Badges */}
                      {isStat ? (
                        <Badge
                          variant="destructive"
                          className="font-mono text-[9px] uppercase px-1.5 py-0 h-4 font-bold bg-rose-600 text-white animate-pulse flex items-center gap-1"
                        >
                          <Flame className="size-2.5" />
                          STAT PANIC
                        </Badge>
                      ) : isOccupied ? (
                        <Badge
                          variant="outline"
                          className="font-mono text-[9px] uppercase px-1.5 py-0 h-4 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
                        >
                          IN USE
                        </Badge>
                      ) : isSanitizing ? (
                        <Badge
                          variant="outline"
                          className="font-mono text-[9px] uppercase px-1.5 py-0 h-4 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold"
                        >
                          SANITIZING
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="font-mono text-[9px] uppercase px-1.5 py-0 h-4 border-border text-muted-foreground font-medium"
                        >
                          READY
                        </Badge>
                      )}
                    </div>

                    {/* Middle Section: Occupant & Clinical Indication */}
                    <div className="my-2 space-y-1">
                      {isAvailable ? (
                        <div className="py-2 text-center text-xs text-muted-foreground font-medium">
                          Available for next intake
                        </div>
                      ) : isSanitizing ? (
                        <div className="py-1 space-y-0.5">
                          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                            <Sparkles className="size-3" />
                            Turnaround in progress
                          </span>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            Est. {room.elapsedMinutes}m remaining
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-foreground truncate">
                              {room.patientName}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                              {room.patientMrn}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                            <Stethoscope className="size-3 text-primary shrink-0" />
                            <span className="truncate">{room.physicianName}</span>
                          </div>
                          {room.indication && (
                            <p className="text-[10px] text-muted-foreground truncate italic">
                              "{room.indication}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Elapsed Time Bar & Inspector Hint */}
                    {isOccupied || isStat ? (
                      <div className="space-y-1 pt-1.5 border-t border-border/50">
                        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-2.5" />
                            {room.elapsedMinutes}m elapsed
                          </span>
                          <span>Slot: {room.expectedDurationMinutes}m</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              progressPercent > 90
                                ? 'bg-rose-500'
                                : progressPercent > 70
                                  ? 'bg-amber-500'
                                  : 'bg-primary'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground font-mono flex items-center justify-between">
                        <span>Physical Slot</span>
                        <span className="text-primary group-hover:underline">Inspect ➔</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

