import QRCode from 'qrcode';

export interface TicketData {
  bookingId: string;
  turfName: string;
  date: string;
  time: string;
}

/**
 * Generates a Data URI containing the QR code.
 * (In a full graphics implementation, we could composite this onto a background template using Canvas/Sharp)
 */
export async function generateQRTicketBuffer(data: TicketData): Promise<Buffer> {
  const payload = JSON.stringify({
    b_id: data.bookingId,
    v: 1
  });

  // Generate QR Code with high error correction and a nice margin
  const qrBuffer = await QRCode.toBuffer(payload, {
    errorCorrectionLevel: 'H',
    type: 'png',
    margin: 4,
    scale: 10, // Larger size
    color: {
      dark: '#111827',  // Tailwind gray-900
      light: '#FFFFFF'
    }
  });

  return qrBuffer;
}
