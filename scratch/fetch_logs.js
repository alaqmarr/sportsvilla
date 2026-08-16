async function fetchLogs() {
  const res = await fetch("https://play-beta.sportsvilla.co.in/api/client/v1/whatsapp/logs");
  const data = await res.json();
  const recentMessages = data.messages.slice(0, 3).map(m => ({
    phoneNumber: m.phoneNumber,
    type: m.type,
    status: m.status,
    errorMessage: m.errorMessage,
    createdAt: m.createdAt
  }));
  console.table(recentMessages);
}
fetchLogs().catch(console.error);
