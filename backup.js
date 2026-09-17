const fs = require('fs');
fs.writeFileSync('src/app/(admin)/whatsapp-admin/WhatsAppClient.tsx.backup', fs.readFileSync('src/app/(admin)/whatsapp-admin/WhatsAppClient.tsx'));
