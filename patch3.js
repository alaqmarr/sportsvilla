const fs = require('fs');
let content = fs.readFileSync('src/app/(admin)/bookings/BookingsClient.tsx', 'utf8');

content = content.replace('createAdminRazorpayOrder,', 'createAdminRazorpayOrder,\n  createAdminPhonePeOrder,');

const phonePeHandler = `
  async function handleDirectPhonePeCheckout() {
    if (!mobile && !memberId) return showAlert("Missing Details", "Please provide a mobile number.", "error");
    if (searchResults.length === 0 && !name) return showAlert("Missing Name", "This is a new member, please enter their full name.", "error");
    
    setIsProcessing(true);
    try {
      const createdBookings = await createBooking({
        turfIds: autoAllocation ? autoAllocation.map(a => a.turfId) : selectedTurfs.map(t => t.id),
        sportId: selectedSportId,
        slots: autoAllocation 
          ? autoAllocation.map(a => ({ startTime: a.startTime, endTime: a.endTime }))
          : selectedSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime })),
        memberId,
        mobile,
        name,
        participantCount: participantCount === '' ? 1 : participantCount,
        guestNames,
        additionalMemberIds,
        redeemPoints
      });

      const bookingIds = createdBookings.map((b: any) => b.id);
      
      const res = await createAdminPhonePeOrder(bookingIds, window.location.origin);
      if (res.redirectUrl) {
        window.open(res.redirectUrl, '_blank');
        showAlert("Success", "PhonePe payment opened in new tab. Booking created.", "success");
        setStep(1);
        setActiveTab('MANAGE');
        setIsProcessing(false);
        fetchBookings();
      }
    } catch (err: any) {
      console.error(err);
      showAlert("Error", err.message, "error");
      setIsProcessing(false);
    }
  }

  async function handleDirectRazorpayCheckout() {`;

content = content.replace('async function handleDirectRazorpayCheckout() {', phonePeHandler);

const buttons = `
                  <div className="flex gap-3">
                    <button 
                      onClick={handleDirectRazorpayCheckout}
                      disabled={isProcessing || !!generatedRzpLink}
                      className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-4 font-bold transition-colors disabled:opacity-50"
                    >
                      Razorpay
                    </button>
                    <button 
                      onClick={handleDirectPhonePeCheckout}
                      disabled={isProcessing || !!generatedRzpLink}
                      className="flex-[2] bg-purple-600 hover:bg-purple-500 text-white rounded-lg py-4 font-bold transition-colors disabled:opacity-50"
                    >
                      PhonePe
                    </button>
                    <button 
                      onClick={generatePaymentLink}
                      disabled={isProcessing || !!generatedRzpLink}
                      className="flex-1 bg-[#1c1f2e] border border-blue-500/30 hover:bg-blue-500/10 text-blue-400 rounded-lg py-4 font-bold transition-colors disabled:opacity-50"
                      title="Generate Payment Link"
                    >
                      Send Link
                    </button>
                    <button 
                      onClick={handleCastToDisplay}
                      className="flex-1 bg-[#1c1f2e] border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 rounded-lg py-4 font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      title="Show QR on second screen"
                    >
                      Cast Screen
                    </button>
                  </div>`;

const buttonRegex = /<div className="flex gap-3">[\s\S]*?Cast Screen[\s\S]*?<\/button>\s*<\/div>/;
content = content.replace(buttonRegex, buttons);

fs.writeFileSync('src/app/(admin)/bookings/BookingsClient.tsx', content);
