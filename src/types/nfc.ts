/**
 * Core NFC TypeScript Definitions for SportsVilla
 * Supports physical NFC cards (Mifare / NTAG), dual-hardware readers, kiosk check-in, and wallet transactions.
 */

export type NfcCardStatus = "ACTIVE" | "BLOCKED" | "SUSPENDED" | "INACTIVE";

export type NfcTxType = "CHECKIN" | "PAYMENT" | "TOPUP" | "DROPIN";

export type NfcTxStatus = "SUCCESS" | "FAILED";

export type NfcDeviceType = "KEYBOARD_WEDGE" | "WEB_NFC" | "SIMULATOR" | "POS_READER";

export interface NfcCard {
  id: string;
  cardUid: string;
  cardId?: string | null;
  memberId?: string | null;
  member?: {
    id: string;
    name: string;
    mobile: string;
    email?: string | null;
    walletBalance: number; // in paise
  } | null;
  status: NfcCardStatus | string;
  issuedAt: Date | string;
  lastUsedAt?: Date | string | null;
  notes?: string | null;
  assignedBy?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    transactions?: number;
  };
}

export interface NfcTransaction {
  id: string;
  cardId?: string | null;
  card?: NfcCard | null;
  cardUid: string;
  memberId?: string | null;
  member?: {
    id: string;
    name: string;
    mobile: string;
    walletBalance: number; // in paise
  } | null;
  bookingId?: string | null;
  booking?: {
    id: string;
    price: number;
    paymentStatus: string;
    turf?: { name: string } | null;
    sport?: { name: string } | null;
    startTime: Date | string;
    endTime: Date | string;
  } | null;
  type: NfcTxType | string;
  status: NfcTxStatus | string;
  amount: number; // in Rupees
  deviceType: NfcDeviceType | string;
  readerLocation?: string | null;
  failureReason?: string | null;
  metadata?: string | null;
  createdAt: Date | string;
}

export interface NfcCardAssignmentPayload {
  memberId: string;
  cardUid: string;
  cardId?: string;
  notes?: string;
}

export interface NfcCardStatusUpdatePayload {
  cardId: string;
  status: NfcCardStatus;
  notes?: string;
}

export interface NfcCheckinRequest {
  cardUid: string;
  deviceType?: NfcDeviceType;
  location?: string;
}

export interface NfcCheckinResponse {
  success: boolean;
  action: "BOOKING_CHECKIN" | "MEMBERSHIP_ATTENDANCE" | "DROPIN_DEDUCTED" | "REJECTED";
  message: string;
  member?: {
    id: string;
    name: string;
    mobile: string;
    walletBalanceRupees: number;
  };
  details?: {
    bookingId?: string;
    ticketId?: string;
    sportName?: string;
    courtName?: string;
    timeSlot?: string;
    attendanceId?: string;
    membershipPlanName?: string;
    dropInFeeRupees?: number;
  };
  error?: string;
}

export interface NfcPaymentRequest {
  cardUid: string;
  bookingId?: string;
  amount: number; // in Rupees
  description?: string;
  deviceType?: NfcDeviceType;
}

export interface NfcPaymentResponse {
  success: boolean;
  transactionId?: string;
  deductedAmount?: number; // in Rupees
  remainingBalance?: number; // in Rupees
  member?: {
    id: string;
    name: string;
    mobile?: string;
  };
  bookingId?: string;
  message?: string;
  error?: string;
  code?: string;
}

export interface NfcTapEventDetail {
  cardUid: string;
  deviceType: NfcDeviceType;
  timestamp?: number;
}

export interface NfcTransactionFilter {
  startDate?: string;
  endDate?: string;
  type?: string;
  status?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}

export interface NfcTransactionStats {
  totalTaps: number;
  successfulTaps: number;
  failedTaps: number;
  totalVolumeRupees: number;
  todayTaps: number;
}

export type NfcSimulatorCategory =
  | "ACTIVE_BOOKING"
  | "ACTIVE_MEMBERSHIP"
  | "MEMBER_WALLET"
  | "LOW_BALANCE"
  | "BLOCKED_CARD"
  | "UNREGISTERED_CARD";

export interface NfcSimulatorPreset {
  id: string;
  name: string;
  category: NfcSimulatorCategory;
  cardUid: string;
  memberName?: string;
  memberMobile?: string;
  walletBalanceRupees?: number;
  description: string;
}

export type NfcSimulatorMode =
  | "CUSTOM_EVENT"
  | "KEYBOARD_WEDGE"
  | "DIRECT_CHECKIN"
  | "DIRECT_PAYMENT";

export interface NfcSimulationLogEntry {
  id: string;
  timestamp: string;
  mode: NfcSimulatorMode;
  cardUid: string;
  status: "SUCCESS" | "REJECTED" | "FAILED" | "DISPATCHED" | "STREAMED";
  durationMs?: number;
  summary: string;
  payload?: any;
}

