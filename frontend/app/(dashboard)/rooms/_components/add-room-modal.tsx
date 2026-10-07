'use client';

import React, { useState } from 'react';
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
  Plus,
  Check,
  Stethoscope,
  Activity,
  Beaker,
  DoorOpen,
  Sparkles,
} from 'lucide-react';
import { CreateRoomInput, RoomWing, RoomType, RoomStatus } from '@/types';

interface AddRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomCreated: (input: CreateRoomInput) => Promise<{ success: boolean; error?: string }>;
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

export function AddRoomModal({
  open,
  onOpenChange,
  onRoomCreated,
}: AddRoomModalProps) {
  const [roomNumber, setRoomNumber] = useState('');
  const [wing, setWing] = useState<RoomWing>('Outpatient Clinic');
  const [roomType, setRoomType] = useState<RoomType>('Examination Suite');
  const [floor, setFloor] = useState('Floor 1 - Outpatient Wing');
  const [bedType, setBedType] = useState('Standard Examination Table');
  const [bedCount, setBedCount] = useState(1);
  const [status, setStatus] = useState<RoomStatus>('AVAILABLE');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([
    'Vital Signs Monitor',
    'Electronic Exam Light',
  ]);
  const [notes, setNotes] = useState('');
  const [customEquip, setCustomEquip] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleEquipment = (item: string) => {
    if (selectedEquipment.includes(item)) {
      setSelectedEquipment(selectedEquipment.filter((e) => e !== item));
    } else {
      setSelectedEquipment([...selectedEquipment, item]);
    }
  };

  const handleAddCustomEquip = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customEquip.trim()) {
      e.preventDefault();
      if (!selectedEquipment.includes(customEquip.trim())) {
        setSelectedEquipment([...selectedEquipment, customEquip.trim()]);
      }
      setCustomEquip('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!roomNumber.trim()) {
      setErrorMessage('Please provide a valid Room Number or Suite Identifier.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onRoomCreated({
        roomNumber: roomNumber.trim(),
        wing,
        roomType,
        floor,
        bedType,
        bedCount,
        status,
        equipment: selectedEquipment,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        // Reset form
        setRoomNumber('');
        setWing('Outpatient Clinic');
        setRoomType('Examination Suite');
        setBedType('Standard Examination Table');
        setSelectedEquipment(['Vital Signs Monitor', 'Electronic Exam Light']);
        setNotes('');
        onOpenChange(false);
      } else {
        setErrorMessage(res.error || 'Failed to create room.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred while creating the room.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Add New Hospital Suite / Facility Room
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Configure facility inventory, department wing routing, and room diagnostic equipment.
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

          {/* Row 1: Room Identifier & Wing Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="roomNumber" className="text-xs font-semibold text-foreground">
                Suite / Room Identifier <span className="text-destructive">*</span>
              </Label>
              <Input
                id="roomNumber"
                placeholder="e.g. Exam Suite 5A, Cardio 2B..."
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="h-10 text-sm border-border bg-background"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wingSelect" className="text-xs font-semibold text-foreground">
                Department Wing <span className="text-destructive">*</span>
              </Label>
              <Select value={wing} onValueChange={(v) => setWing(v as RoomWing)}>
                <SelectTrigger id="wingSelect" className="h-10 text-sm border-border bg-background">
                  <SelectValue placeholder="Select Department Wing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Outpatient Clinic">Outpatient Clinic</SelectItem>
                  <SelectItem value="Cardiology & Specialty">Cardiology & Specialty</SelectItem>
                  <SelectItem value="Diagnostic Laboratory">Diagnostic Laboratory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Room Type & Floor Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="roomTypeSelect" className="text-xs font-semibold text-foreground">
                Room Classification
              </Label>
              <Select value={roomType} onValueChange={(v) => setRoomType(v as RoomType)}>
                <SelectTrigger id="roomTypeSelect" className="h-10 text-sm border-border bg-background">
                  <SelectValue placeholder="Select Room Classification" />
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
              <Label htmlFor="floorInput" className="text-xs font-semibold text-foreground">
                Floor / Location Zone
              </Label>
              <Input
                id="floorInput"
                placeholder="e.g. Floor 1 - Outpatient Wing"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="h-10 text-sm border-border bg-background"
              />
            </div>
          </div>

          {/* Row 3: Bed / Recliner Type & Initial Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bedTypeInput" className="text-xs font-semibold text-foreground">
                Bed / Recliner Specification
              </Label>
              <Input
                id="bedTypeInput"
                placeholder="e.g. Standard Exam Table, Telemetry Recliner..."
                value={bedType}
                onChange={(e) => setBedType(e.target.value)}
                className="h-10 text-sm border-border bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="statusSelect" className="text-xs font-semibold text-foreground">
                Initial Operational Status
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RoomStatus)}>
                <SelectTrigger id="statusSelect" className="h-10 text-sm border-border bg-background">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available (Ready for Intake)</SelectItem>
                  <SelectItem value="SANITIZING">Sanitizing (Turnover)</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance (Out of Service)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Equipment & Device Features */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold text-foreground">
              Equipment & Diagnostic Amenities (Click to toggle)
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

          {/* Row 5: Notes & Facility Specs */}
          <div className="space-y-1.5">
            <Label htmlFor="roomNotes" className="text-xs font-semibold text-foreground">
              Facility Notes / Engineering Specifications
            </Label>
            <Textarea
              id="roomNotes"
              placeholder="e.g. Dedicated high-flow oxygen wall unit, negative pressure isolation capability, dual LCD physician workstation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs min-h-[60px] border-border bg-background"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border sm:justify-between items-center gap-2">
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
              <Plus className="size-4" />
              <span>{isSubmitting ? 'Registering...' : 'Add Room to Facility'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
