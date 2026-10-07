'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Check,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { HospitalRoom, UpdateRoomInput, RoomWing, RoomType, RoomStatus } from '@/types';

interface EditRoomModalProps {
  room: HospitalRoom | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomUpdated: (input: UpdateRoomInput) => Promise<{ success: boolean; error?: string }>;
  onRoomDeleted?: (roomId: string) => Promise<{ success: boolean; error?: string }>;
}

const COMMON_EQUIPMENT = [
  'Vital Signs Monitor',
  '12-Lead ECG Unit',
  'Ultrasound Station',
  'Oxygen Supply Wall',
  'Negative Pressure System',
  'Defibrillator Ready',
  'Phlebotomy Tray Station',
  'Centrifuge STAT Unit',
  'Electronic Exam Light',
  'Glucometer Pro',
];

export function EditRoomModal({
  room,
  open,
  onOpenChange,
  onRoomUpdated,
  onRoomDeleted,
}: EditRoomModalProps) {
  const [roomNumber, setRoomNumber] = useState('');
  const [wing, setWing] = useState<RoomWing>('Outpatient Clinic');
  const [roomType, setRoomType] = useState<RoomType>('Examination Suite');
  const [floor, setFloor] = useState('');
  const [bedType, setBedType] = useState('');
  const [status, setStatus] = useState<RoomStatus>('AVAILABLE');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (room) {
      setRoomNumber(room.roomNumber);
      setWing(room.wing);
      setRoomType(room.roomType || 'Examination Suite');
      setFloor(room.floor || 'Floor 1 - General Wing');
      setBedType(room.bedType || 'Standard Examination Table');
      setStatus(room.status);
      setSelectedEquipment(room.equipment || ['Vital Signs Monitor']);
      setNotes(room.notes || '');
      setConfirmDelete(false);
      setErrorMessage(null);
    }
  }, [room]);

  if (!room) return null;

  const toggleEquipment = (item: string) => {
    if (selectedEquipment.includes(item)) {
      setSelectedEquipment(selectedEquipment.filter((e) => e !== item));
    } else {
      setSelectedEquipment([...selectedEquipment, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!roomNumber.trim()) {
      setErrorMessage('Room number / identifier is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onRoomUpdated({
        id: room.id,
        roomNumber: roomNumber.trim(),
        wing,
        roomType,
        floor,
        bedType,
        status,
        equipment: selectedEquipment,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        onOpenChange(false);
      } else {
        setErrorMessage(res.error || 'Failed to update room configuration.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred while updating room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onRoomDeleted) return;
    setIsDeleting(true);
    try {
      const res = await onRoomDeleted(room.id);
      if (res.success) {
        onOpenChange(false);
      } else {
        setErrorMessage(res.error || 'Failed to decommission room.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred while decommissioning room.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOccupied = room.status === 'IN_USE' || room.status === 'STAT_EMERGENCY';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Building2 className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Manage Suite: {room.roomNumber}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Update operational parameters, equipment, or facility maintenance status.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {isOccupied && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400 text-xs font-medium flex items-center justify-between">
              <span>Suite currently occupied by {room.assignedPatient || 'Active Patient'} ({room.assignedDoctor || 'Assigned MD'}).</span>
              <Badge variant="outline" className="font-mono text-[10px] bg-blue-500/10">In Session</Badge>
            </div>
          )}

          {/* Row 1: Room Identifier & Wing Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="editRoomNumber" className="text-xs font-semibold text-foreground">
                Suite / Room Identifier
              </Label>
              <Input
                id="editRoomNumber"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="h-10 text-sm border-border bg-background"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editWingSelect" className="text-xs font-semibold text-foreground">
                Department Wing
              </Label>
              <Select value={wing} onValueChange={(v) => setWing(v as RoomWing)}>
                <SelectTrigger id="editWingSelect" className="h-10 text-sm border-border bg-background">
                  <SelectValue placeholder="Select Wing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Outpatient Clinic">Outpatient Clinic</SelectItem>
                  <SelectItem value="Cardiology & Specialty">Cardiology & Specialty</SelectItem>
                  <SelectItem value="Diagnostic Laboratory">Diagnostic Laboratory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Room Type & Operational Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="editRoomType" className="text-xs font-semibold text-foreground">
                Room Classification
              </Label>
              <Select value={roomType} onValueChange={(v) => setRoomType(v as RoomType)}>
                <SelectTrigger id="editRoomType" className="h-10 text-sm border-border bg-background">
                  <SelectValue placeholder="Select Classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Examination Suite">Examination Suite</SelectItem>
                  <SelectItem value="Consultation Room">Consultation Room</SelectItem>
                  <SelectItem value="Procedure Suite">Procedure Suite</SelectItem>
                  <SelectItem value="STAT Biomarkers Bench">STAT Biomarkers Bench</SelectItem>
                  <SelectItem value="Triage Bay">Triage Bay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editStatusSelect" className="text-xs font-semibold text-foreground">
                Operational Status
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RoomStatus)}>
                <SelectTrigger id="editStatusSelect" className="h-10 text-sm border-border bg-background">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available (Ready for Intake)</SelectItem>
                  <SelectItem value="IN_USE">In Use / Occupied</SelectItem>
                  <SelectItem value="SANITIZING">Sanitizing (Turnover)</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance (Out of Service)</SelectItem>
                  <SelectItem value="STAT_EMERGENCY">STAT Emergency Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Bed Type & Floor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="editBedType" className="text-xs font-semibold text-foreground">
                Bed / Recliner Specification
              </Label>
              <Input
                id="editBedType"
                value={bedType}
                onChange={(e) => setBedType(e.target.value)}
                className="h-10 text-sm border-border bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editFloor" className="text-xs font-semibold text-foreground">
                Floor / Location Zone
              </Label>
              <Input
                id="editFloor"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="h-10 text-sm border-border bg-background"
              />
            </div>
          </div>

          {/* Equipment Checkboxes */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold text-foreground">
              Equipment & Diagnostic Amenities
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_EQUIPMENT.map((equip) => {
                const isSelected = selectedEquipment.includes(equip);
                return (
                  <button
                    type="button"
                    key={equip}
                    onClick={() => toggleEquipment(equip)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/60 text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {isSelected && <Check className="size-3" />}
                    <span>{equip}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="editRoomNotes" className="text-xs font-semibold text-foreground">
              Facility Notes / Engineering Specs
            </Label>
            <Textarea
              id="editRoomNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs min-h-[60px] border-border bg-background"
            />
          </div>

          {/* Decommission Confirmation Area */}
          {confirmDelete && (
            <div className="p-3.5 rounded-lg border border-destructive/40 bg-destructive/5 space-y-2 text-xs">
              <div className="font-bold text-destructive flex items-center gap-2">
                <AlertTriangle className="size-4" />
                <span>Confirm Suite Decommission</span>
              </div>
              <p className="text-muted-foreground">
                Are you sure you want to decommission <strong>{room.roomNumber}</strong>? This action will archive the facility record in WORM audit logs.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting || isOccupied}
                  className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Decommissioning...' : 'Yes, Decommission Room'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  className="h-8 text-xs border-border"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border sm:justify-between items-center gap-2">
            {!confirmDelete && onRoomDeleted && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDelete(true)}
                disabled={isOccupied}
                className="h-10 text-xs px-3.5 border-destructive/40 text-destructive hover:bg-destructive/10 cursor-pointer"
                title={isOccupied ? 'Cannot decommission occupied suite' : 'Decommission this suite'}
              >
                <Trash2 className="size-3.5 mr-1.5" />
                <span>Decommission Suite</span>
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-10 text-xs px-4 border-border cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || !roomNumber.trim()}
                className="h-10 text-xs px-5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs gap-1.5"
              >
                <Check className="size-4" />
                <span>{isSubmitting ? 'Saving Changes...' : 'Save Configuration'}</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
