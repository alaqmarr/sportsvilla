const TOKEN = "EAAOxfZCpSUrEBSAydmLuycYbsCInDatVJkq9lfkUZBBEWk0TPB7DofCUVMYSWAfupDvkx8RyITTgLzJkiXnT5Jb2OZB6ZC455MZAKsn4Gxo2qfBA9askG9azFrwIXvD0gqZBLUNYxNWYRDRFfZCtuUQoqzRGbgvOBWZCxZA98PDmohlZBJZAJRivdkCUrE6dqoSoQZDZD";
const WABA_ID = "4575637675998391";

async function listTemplates() {
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${WABA_ID}/message_templates?limit=50`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  const data = await res.json();
  if (data.error) {
    console.error("API Error:", data.error);
    return;
  }
  for (const t of data.data || []) {
    const bodyComp = t.components?.find(c => c.type === "BODY");
    const paramCount = bodyComp?.example?.body_text?.[0]?.length || 0;
    console.log(`${t.name} | status=${t.status} | lang=${t.language} | bodyParams=${paramCount}`);
    if (t.name.includes("booking")) {
      console.log("  BODY:", bodyComp?.text);
      console.log("  ALL COMPONENTS:", JSON.stringify(t.components, null, 2));
    }
  }
}
listTemplates().catch(console.error);
