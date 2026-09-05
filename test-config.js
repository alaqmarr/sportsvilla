fetch('http://localhost:3000/api/client/v1/payments/config').then(res => res.json()).then(console.log).catch(console.error);
