function generateSlots(dateStr, durationMin, openTime, closeTime) {
  const slots = [];
  const start = new Date(dateStr);
  const [openHour, openMin] = openTime.split(':').map(Number);
  start.setHours(openHour, openMin, 0, 0);
  
  const end = new Date(dateStr);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  end.setHours(closeHour, closeMin, 0, 0);
  
  console.log("start:", start);
  console.log("end:", end);
  console.log("duration:", durationMin);

  let current = new Date(start);
  while (current < end) {
    const slotEnd = new Date(current.getTime() + durationMin * 60000);
    if (slotEnd > end) break; // Don't generate slots that go past closing time
    slots.push({
      startTime: new Date(current),
      endTime: slotEnd,
      label: current.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    });
    current = slotEnd;
  }
  return slots;
}

console.log(generateSlots("2026-06-08", 60, "06:00", "23:00"));
