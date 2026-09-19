export interface SlotInput {
  startTime: Date | string;
  endTime: Date | string;
}

export interface MergedSlot {
  startTime: Date;
  endTime: Date;
}

export interface SlotPriceCalculation {
  pricePerPerson: number;
  totalPrice: number;
}

export interface LoyaltyDiscountCalculation {
  totalDiscount: number;
  pointsToDeduct: number;
}

export interface PaymentStatusCalculation {
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
  amountDue: number;
}

export interface ExtensionAllocationItem {
  turfId: string;
  turfName: string;
  startTime: string;
  endTime: string;
  price: number;
  isSameCourt: boolean;
}

export function mergeContiguousSlots(slots: SlotInput[]): MergedSlot[] {
  if (!slots || slots.length === 0) return [];

  const sortedSlots = [...slots].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const mergedSlots: MergedSlot[] = [];
  for (const slot of sortedSlots) {
    const sStart = new Date(slot.startTime);
    const sEnd = new Date(slot.endTime);

    if (mergedSlots.length === 0) {
      mergedSlots.push({ startTime: sStart, endTime: sEnd });
    } else {
      const last = mergedSlots[mergedSlots.length - 1];
      if (last.endTime.getTime() === sStart.getTime()) {
        last.endTime = sEnd;
      } else {
        mergedSlots.push({ startTime: sStart, endTime: sEnd });
      }
    }
  }

  return mergedSlots;
}

export function calculateSlotPrice(
  bookingPrice: number | null | undefined,
  bookingDurationMinutes: number | null | undefined,
  durationMins: number,
  participantCount: number,
): SlotPriceCalculation {
  const basePrice = bookingPrice || 0;
  const baseMinutes = bookingDurationMinutes || 60;
  const pricePerSlot = (basePrice / baseMinutes) * 30;
  const pricePerPerson = pricePerSlot * (durationMins / 30);
  const totalPrice = pricePerPerson * (participantCount || 1);

  return { pricePerPerson, totalPrice };
}

export function calculateLoyaltyDiscount(
  memberLoyaltyPoints: number,
  totalPrice: number,
  pointsPerRupee: number = 100,
): LoyaltyDiscountCalculation {
  if (!memberLoyaltyPoints || memberLoyaltyPoints <= 0 || totalPrice <= 0) {
    return { totalDiscount: 0, pointsToDeduct: 0 };
  }

  const effectiveRate = pointsPerRupee > 0 ? pointsPerRupee : 100;
  const maxPossibleDiscount = Math.floor(memberLoyaltyPoints / effectiveRate);
  const totalDiscount = Math.min(totalPrice, maxPossibleDiscount);
  const pointsToDeduct = totalDiscount * effectiveRate;

  return { totalDiscount, pointsToDeduct };
}

export function calculateNetPrice(
  price: number,
  discountAmount?: number | null,
  pointsRedeemed?: number | null,
): number {
  return Math.max(0, price - (discountAmount || 0) - (pointsRedeemed || 0));
}

export function calculatePaymentStatusAndDue(
  netPrice: number,
  totalPaid: number,
): PaymentStatusCalculation {
  let paymentStatus: "PAID" | "PARTIAL" | "UNPAID" = "UNPAID";
  if (totalPaid >= netPrice) {
    paymentStatus = "PAID";
  } else if (totalPaid > 0) {
    paymentStatus = "PARTIAL";
  }

  const amountDue = Math.max(0, netPrice - totalPaid);
  return { paymentStatus, amountDue };
}

export function generateTicketQrCode(): string {
  const randomSuffix = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();
  return `TKT-${randomSuffix}-SYKM`;
}

export function formatBookingISTDateTime(
  startTime: Date | string,
  endTime: Date | string,
) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const formattedDate = start.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = start.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const endFormatted = end.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const timeString = `${formattedDate}, ${formattedTime} - ${endFormatted}`;

  return {
    formattedDate,
    formattedTime,
    endFormatted,
    timeString,
  };
}

export function mergeExtensionAllocations(
  allocations: ExtensionAllocationItem[],
): ExtensionAllocationItem[] {
  const mergedAllocations: ExtensionAllocationItem[] = [];
  for (const alloc of allocations) {
    if (mergedAllocations.length === 0) {
      mergedAllocations.push({ ...alloc });
    } else {
      const last = mergedAllocations[mergedAllocations.length - 1];
      if (last.turfId === alloc.turfId && last.endTime === alloc.startTime) {
        last.endTime = alloc.endTime;
        last.price += alloc.price;
      } else {
        mergedAllocations.push({ ...alloc });
      }
    }
  }
  return mergedAllocations;
}
