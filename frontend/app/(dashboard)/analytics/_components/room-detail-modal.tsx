'use client';

import React from 'react';
import { RoomOccupancy } from './hospital-floor-grid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Stethoscope,
  User,
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  Activity,
  FileText,
  DoorOpen,
} from 'lucide-react';
import Link from 'next/link';

interface RoomDetailModalProps {
  room: RoomOccupancy | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RoomDetailModal({
  room,
  isOpen,
  onClose,
}: RoomDetailModalProps) {
  if (!room) return null;

  const isOccupied = room.status === 'OCCUPIED';
  const isAvailable = room.status === 'AVAILABLE';
  const isSanitizing = room.status === 'SANITIZING';
  const isStat = room.status === 'STAT_EMERGENCY';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-lg">
        <DialogHeader className="border-b border-border/80 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <DoorOpen className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {room.roomNumber}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-mono">
                  {room.wing}
                </DialogDescription>
              </div>
            </div>

            {isStat ? (
              <Badge variant="destructive" className="font-mono text-xs font-bold animate-pulse bg-rose-600 text-white">
                <Flame className="size-3 mr-1" />
                STAT EMERGENCY
              </Badge>
            ) : isOccupied ? (
              <Badge variant="outline" className="font-mono text-xs border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold">
                IN CONSULTATION
              </Badge>
            ) : isSanitizing ? (
              <Badge variant="outline" className="font-mono text-xs border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold">
                SANITIZING
              </Badge>
            ) : (
              <Badge variant="outline" className="font-mono text-xs border-border text-muted-foreground">
                AVAILABLE
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Modal Content */}
        <div className="space-y-4 py-2 text-xs">
          {isAvailable ? (
            <div className="p-6 text-center border border-dashed border-border rounded-xl space-y-2 bg-muted/20">
              <CheckCircle2 className="size-8 mx-auto text-emerald-600 opacity-80" />
              <p className="text-xs font-semibold text-foreground">Room Ready for Intake</p>
              <p className="text-[11px] text-muted-foreground">
                Examination suite sanitized, sterilized, and assigned for incoming outpatient triage.
              </p>
            </div>
          ) : isSanitizing ? (
            <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2 text-center">
              <Sparkles className="size-6 mx-auto text-amber-600 animate-spin" />
              <p className="text-xs font-semibold text-foreground">Sterilization Protocol Active</p>
              <p className="text-[11px] text-muted-foreground font-mono">
                Estimated turnaround: {room.elapsedMinutes}m remaining before next patient check-in.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Patient Dossier Strip */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="size-3.5 text-primary" />
                    <span className="font-bold text-sm text-foreground">{room.patientName}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{room.patientMrn}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Stethoscope className="size-3.5 text-primary" />
                  <span>Attending: <strong className="text-foreground">{room.physicianName}</strong></span>
                </div>

                {room.indication && (
                  <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Clinical Reason: </span>
                    {room.indication}
                  </div>
                )}
              </div>

              {/* Consultation Duration & Telemetry */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg border border-border bg-card">
                  <span className="text-[10px] text-muted-foreground block">TIME IN ROOM</span>
                  <span className="font-bold text-sm text-foreground">{room.elapsedMinutes} Minutes</span>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-card">
                  <span className="text-[10px] text-muted-foreground block">SCHEDULED SLOT</span>
                  <span className="font-bold text-sm text-foreground">{room.expectedDurationMinutes} Minutes</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border/80 pt-3 flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs cursor-pointer">
            Close
          </Button>

          {isOccupied && (
            <Button asChild size="sm" className="h-8 text-xs gap-1.5 cursor-pointer">
              <Link href="/patients">
                <FileText className="size-3.5" />
                <span>Open Patient Registry</span>
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

