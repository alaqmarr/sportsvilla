import { prisma } from "@/lib/prisma";
import QRCodeLib from "qrcode";
import { formatIST } from "@/lib/dateUtils";

export default async function PrintTicketPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      member: true,
      sport: true,
      turf: true,
      tickets: true
    }
  });

  if (!booking) {
    return <div className="p-4">Booking not found</div>;
  }

  // Generate QR codes
  const ticketsWithQRs = await Promise.all(booking.tickets.map(async (ticket) => {
    const qrPayload = JSON.stringify({
      id: ticket.qrCode,
      guestName: ticket.guestName || booking.member.name,
      phone: booking.member.mobile,
      sport: booking.sport.name,
      turf: booking.turf.name,
      startTime: booking.startTime,
      endTime: booking.endTime
    });
    const qrDataUrl = await QRCodeLib.toDataURL(qrPayload, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'L'
    });
    return { ...ticket, qrDataUrl };
  }));

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          margin: 0 !important;
          background: #fff !important;
          color: #000 !important;
          font-family: 'Courier New', Courier, monospace !important;
          line-height: 1.2;
        }
        .ticket-container {
          width: 80mm;
          padding: 2mm 4mm;
          box-sizing: border-box;
          page-break-after: always;
        }
        .ticket-container:last-child {
          page-break-after: auto;
        }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .border-dashed { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 4px 0; margin: 4px 0; }
        .flex-center { display: flex; justify-content: center; align-items: center; margin: 4px 0; }
        .uppercase { text-transform: uppercase; }
        p { margin: 1px 0; font-size: 11px; }
        h1 { margin: 0 0 2px 0; font-size: 18px; text-align: center; font-weight: bold; }
        .ticket-title { font-size: 10px; text-align: center; text-transform: uppercase; margin-bottom: 4px; }
      `}} />
      
      {ticketsWithQRs.map((ticket, index) => (
        <div key={ticket.id} className="ticket-container">
          <h1>SPORTSVILLA</h1>
          <p className="ticket-title">Entry Ticket</p>
          
          <div className="border-dashed">
            <p className="font-bold uppercase text-center">{booking.sport.name}</p>
            <p className="text-center">{booking.turf.name}</p>
            <p>Name: <b>{ticket.guestName || booking.member.name}</b></p>
            <p>Phone: {booking.member.mobile}</p>
          </div>

          <div>
            <p>Date: {formatIST(booking.startTime, 'MMM dd, yyyy')}</p>
            <p>Slot: {formatIST(booking.startTime, 'h:mm a')} - {formatIST(booking.endTime, 'h:mm a')}</p>
            {booking.turf.bookingValidityDays > 0 && (
              <p style={{ fontSize: '9px', fontStyle: 'italic', marginTop: '2px' }}>
                * Valid until: {formatIST(new Date(booking.startTime.getTime() + booking.turf.bookingValidityDays * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
              </p>
            )}
            {booking.participantCount > 1 && (
              <p className="text-center font-bold" style={{ marginTop: '4px' }}>Ticket {index + 1} of {booking.participantCount}</p>
            )}
          </div>

          <div className="flex-center">
            <img src={ticket.qrDataUrl} alt="Ticket QR" style={{ width: '45mm', height: '45mm' }} />
          </div>
          <p className="text-center font-bold" style={{ fontSize: '10px' }}>{ticket.qrCode}</p>
          
          <p className="text-center" style={{ marginTop: '6px', fontSize: '10px' }}>Thank you for visiting!</p>
        </div>
      ))}
      
      {/* Auto-print script */}
      <script dangerouslySetInnerHTML={{__html: `
        function triggerPrint() {
          setTimeout(function() {
            window.print();
          }, 800);
        }
        if (document.readyState === 'complete') {
          triggerPrint();
        } else {
          window.addEventListener('load', triggerPrint);
        }
      `}} />
    </>
  );
}
