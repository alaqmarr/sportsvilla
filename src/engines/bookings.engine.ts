export interface Slot {
  startTime: Date;
  endTime: Date;
  label?: string;
}

export interface Turf {
  id: string;
  name: string;
  bookingPrice?: number;
  bookingDurationMinutes?: number;
  capacityPerSlot?: number;
}

export interface Booking {
  turfId: string;
  status: string;
  startTime: string | Date;
  endTime: string | Date;
  participantCount?: number;
}

export interface Allocation {
  turfId: string;
  turfName: string;
  startTime: Date;
  endTime: Date;
  price: number;
}

export function allocateTurfsForSlots(
  selectedSlots: Slot[],
  bookings: Booking[],
  turfs: Turf[]
): Allocation[] | null {
  if (!selectedSlots.length || !turfs.length) return null;

  // Sort selected slots chronologically
  const sortedSlots = [...selectedSlots].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Helper to check if a turf is available for a specific slot
  const isTurfAvailable = (turf: Turf, slot: Slot) => {
    let maxBooked = 0;
    const bookedInSlot = bookings.reduce((sum, b) => {
      if (b.turfId !== turf.id || b.status === "CANCELLED") return sum;
      const slotStart = slot.startTime.getTime();
      const slotEnd = slot.endTime.getTime();
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      if (slotStart < bEnd && slotEnd > bStart) {
        return sum + (b.participantCount || 1);
      }
      return sum;
    }, 0);
    maxBooked = bookedInSlot;
    const capacity = turf.capacityPerSlot || 1;
    return (capacity - maxBooked) > 0;
  };

  // 1. Try to find a SINGLE turf that is available for ALL selected slots
  for (const turf of turfs) {
    let allAvailable = true;
    for (const slot of sortedSlots) {
      if (!isTurfAvailable(turf, slot)) {
        allAvailable = false;
        break;
      }
    }
    if (allAvailable) {
      const startTime = sortedSlots[0].startTime;
      const endTime = sortedSlots[sortedSlots.length - 1].endTime;
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMins = durationMs / 60000;
      const pricePerMin = (turf.bookingPrice || 0) / (turf.bookingDurationMinutes || 60);
      return [{
        turfId: turf.id,
        turfName: turf.name,
        startTime,
        endTime,
        price: pricePerMin * durationMins
      }];
    }
  }

  // 2. If single turf fails, greedily allocate splitting across turfs
  const allocations: Allocation[] = [];
  let currentTurf: Turf | null = null;
  let currentBlockStart: Date | null = null;
  let currentBlockEnd: Date | null = null;

  const pushAllocation = () => {
    if (currentTurf && currentBlockStart && currentBlockEnd) {
      const durationMs = currentBlockEnd.getTime() - currentBlockStart.getTime();
      const durationMins = durationMs / 60000;
      const pricePerMin = (currentTurf.bookingPrice || 0) / (currentTurf.bookingDurationMinutes || 60);
      allocations.push({
        turfId: currentTurf.id,
        turfName: currentTurf.name,
        startTime: currentBlockStart,
        endTime: currentBlockEnd,
        price: pricePerMin * durationMins
      });
    }
  };

  for (const slot of sortedSlots) {
    if (currentTurf && isTurfAvailable(currentTurf, slot)) {
      // Continue with current turf
      currentBlockEnd = slot.endTime;
    } else {
      // Find a new turf
      let foundTurf: Turf | null = null;
      for (const turf of turfs) {
        if (isTurfAvailable(turf, slot)) {
          foundTurf = turf;
          break;
        }
      }
      if (!foundTurf) return null; // No turf available for this slot, allocation fails

      // Push previous block if exists
      if (currentTurf) {
        pushAllocation();
      }

      currentTurf = foundTurf;
      currentBlockStart = slot.startTime;
      currentBlockEnd = slot.endTime;
    }
  }

  if (currentTurf) {
    pushAllocation();
  }

  return allocations;
}
