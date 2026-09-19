export interface BookingConfirmedEvent {
  bookingId: string;
  memberId: string;
  customerName: string;
  turfName: string;
  sportName: string;
  startTime: Date | string;
  endTime: Date | string;
  price: number;
  discountAmount?: number | null;
  paymentStatus: string;
  mobile?: string | null;
  participantCount?: number;
  isKiosk?: boolean;
}

export interface BookingCancelledEvent {
  bookingId: string;
  memberId?: string;
  customerName: string;
  turfName: string;
  startTime: Date | string;
  refundAmountRupees: number;
  mobile?: string | null;
}

export interface WalletCreditedEvent {
  memberId: string;
  memberName?: string;
  customerName?: string;
  rechargeAmount: number;
  newBalance?: number;
  mobile?: string | null;
  description?: string;
  reason?: "RECHARGE" | "REFUND" | "REWARD" | "POINTS_REDEMPTION" | "ADMIN_TOPUP" | string;
  bookingId?: string;
}

export interface WalletDebitedEvent {
  memberId: string;
  amount: number;
  newBalance?: number;
  description?: string;
  bookingId?: string;
}

export interface PaymentSuccessEvent {
  bookingId: string;
  memberId?: string;
  gateway: "RAZORPAY" | "PHONEPE" | "WALLET" | "MANUAL" | string;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  amount: number;
  paymentStatus: "PAID" | "PARTIAL" | string;
  booking?: any;
}

export interface AttendanceMarkedEvent {
  attendanceId?: string;
  memberId: string;
  memberName: string;
  sportName: string;
  mobile?: string | null;
  date?: Date | string;
}

export interface CheckinConfirmedEvent {
  ticketId?: string;
  bookingId?: string;
  memberId?: string;
  memberName: string;
  sportName: string;
  mobile?: string | null;
}

export interface MembershipAssignedEvent {
  memberId: string;
  memberName: string;
  mobile?: string | null;
  planName: string;
  turfName?: string;
  eligibleSlot?: string;
  validUntil?: string;
  actionType?: "PURCHASED" | "ASSIGNED";
}

export interface MembershipExpiredEvent {
  memberId?: string;
  customerName: string;
  mobile?: string | null;
  planName: string;
  expirationDate: string;
  registeredPhone?: string | null;
}

export interface MemberRegisteredEvent {
  memberId: string;
  name: string;
  mobile?: string | null;
  isFamily?: boolean;
}

export interface EventPayloadMap {
  "booking.confirmed": BookingConfirmedEvent;
  "booking.cancelled": BookingCancelledEvent;
  "wallet.credited": WalletCreditedEvent;
  "wallet.debited": WalletDebitedEvent;
  "payment.success": PaymentSuccessEvent;
  "attendance.marked": AttendanceMarkedEvent;
  "checkin.confirmed": CheckinConfirmedEvent;
  "membership.assigned": MembershipAssignedEvent;
  "membership.expired": MembershipExpiredEvent;
  "member.registered": MemberRegisteredEvent;
}

export type AppEvent = keyof EventPayloadMap;
