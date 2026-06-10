import { prisma } from "@/lib/prisma";
import QRCodeLib from "qrcode";
import { format } from "date-fns";

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
        }
        .ticket-container {
          width: 80mm;
          padding: 2mm 5mm 5mm 5mm;
          box-sizing: border-box;
          break-inside: avoid;
        }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .border-dashed { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; }
        .flex-center { display: flex; justify-content: center; align-items: center; }
        .uppercase { text-transform: uppercase; }
        .text-sm { font-size: 0.8rem; }
      `}} />
      
      {ticketsWithQRs.map((ticket, index) => (
        <div key={ticket.id} className="ticket-container">
          <h1 className="text-center font-bold" style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>SPORTSVILLA</h1>
          <p className="text-center text-sm uppercase mb-4">Entry Ticket</p>
          
          <div className="border-dashed mb-4">
            <p className="mb-2 font-bold uppercase">{booking.sport.name}</p>
            <p style={{ margin: '2px 0' }}>{booking.turf.name}</p>
            <p style={{ margin: '2px 0' }}>Name: {ticket.guestName || booking.member.name}</p>
            <p style={{ margin: '2px 0' }}>Phone: {booking.member.mobile}</p>
          </div>

          <div className="mb-4">
            <p style={{ margin: '2px 0' }}>Date: {format(booking.startTime, 'MMM dd, yyyy')}</p>
            <p style={{ margin: '2px 0' }}>Slot: {format(booking.startTime, 'hh:mm a')} - {format(booking.endTime, 'hh:mm a')}</p>
            {booking.turf.bookingValidityDays > 0 && (
              <p className="text-sm" style={{ margin: '5px 0', fontStyle: 'italic' }}>
                * Valid until: {format(new Date(booking.startTime.getTime() + booking.turf.bookingValidityDays * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
              </p>
            )}
            {booking.participantCount > 1 && (
              <p className="text-center font-bold mt-2">Ticket {index + 1} of {booking.participantCount}</p>
            )}
          </div>

          <div className="flex-center mb-2">
            <img src={ticket.qrDataUrl} alt="Ticket QR" style={{ width: '50mm', height: '50mm' }} />
          </div>
          <p className="text-center font-bold" style={{ fontSize: '0.7rem' }}>{ticket.qrCode}</p>
          
          <p className="text-center text-sm mt-4">Thank you for visiting!</p>
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
