import { generateQRTicketBuffer } from './src/lib/qr-ticket';
import { uploadTempQRToR2, deleteTempQRFromR2 } from './src/lib/r2-storage';
import * as fs from 'fs';

async function test() {
  console.log('Generating QR...');
  const buffer = await generateQRTicketBuffer({
    bookingId: 'TEST-123',
    turfName: 'Turf A',
    date: '2026-09-18',
    time: '18:00'
  });
  
  console.log('Generated buffer of size:', buffer.length);
  fs.writeFileSync('scratch-qr.png', buffer);
  console.log('Saved to scratch-qr.png');
}

test().catch(console.error);
