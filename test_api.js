const jwt = require('jsonwebtoken');

async function test() {
  const token = jwt.sign(
    { uid: '+919876543210' }, // Assume this is a test member
    'fallback_secret_for_dev',
    { expiresIn: '30d' }
  );

  console.log("Generated token:", token);

  try {
    const res = await fetch('http://localhost:3000/api/client/v1/home', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error("Fetch Error:", e);
  }
}

test();
