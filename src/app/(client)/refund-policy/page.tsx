import React from "react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Refund and Cancellation Policy</h1>
        <p className="mb-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString("en-IN")}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Overview</h2>
          <p className="mb-4 leading-relaxed">
            At <strong>Sportsvilla</strong>, we strive to ensure a seamless and fair sports turf booking experience for all
            our users. This Refund and Cancellation Policy outlines the guidelines, timelines, and procedures for booking
            cancellations and wallet refunds on our website (
            <a href="https://sportsvilla.co.in" className="text-emerald-600 hover:underline">
              sportsvilla.co.in
            </a>
            ) and mobile applications.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">2. Turf Booking Cancellations</h2>
          <p className="mb-4 leading-relaxed">
            We understand that plans can change. Eligibility for a refund depends on how far in advance the cancellation is
            requested before the scheduled start time of the booked slot:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4">
            <ul className="space-y-3 leading-relaxed">
              <li>
                <span className="font-semibold text-emerald-700">100% Refund (More than 4 hours before slot):</span>{" "}
                Cancellations made at least 4 hours prior to the booked slot start time are eligible for a 100% full refund of
                the booking amount.
              </li>
              <li>
                <span className="font-semibold text-amber-700">50% Refund (2 to 4 hours before slot):</span> Cancellations
                made between 2 hours and 4 hours prior to the slot start time are eligible for a 50% refund.
              </li>
              <li>
                <span className="font-semibold text-red-700">No Refund (Less than 2 hours before slot):</span> Cancellations
                made less than 2 hours prior to the slot start time, or no-shows, are non-refundable.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">3. Weather & Venue-Initiated Cancellations</h2>
          <p className="mb-4 leading-relaxed">
            If a booked turf slot is cancelled by Sportsvilla or the turf venue management due to extreme weather conditions
            (heavy rain, waterlogging), technical maintenance, or unexpected venue closures:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 leading-relaxed">
            <li>
              You will be notified immediately via WhatsApp or SMS.
            </li>
            <li>
              A <strong>100% full refund</strong> will be initiated automatically without any cancellation deductions.
            </li>
            <li>
              Alternatively, you may request to reschedule your booking to another available date and time slot at no extra charge.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">4. Refund Method & Processing Timelines</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2 leading-relaxed">
            <li>
              <strong>Sportsvilla Wallet Credit (Instant):</strong> By default, approved refunds are credited instantly to your
              in-app Sportsvilla Wallet balance, which can be used immediately for future turf bookings or tournament entries.
            </li>
            <li>
              <strong>Original Payment Source (UPI / Card / Net Banking):</strong> If you request a refund back to your original
              payment method, it will be processed through our payment gateway within <strong>5 to 7 business days</strong>,
              subject to banking clearance timelines.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">5. Tournament Registrations</h2>
          <p className="mb-4 leading-relaxed">
            Tournament entry fees are refundable only if the cancellation request is submitted before the official tournament
            registration deadline. Once the registration deadline passes or tournament fixtures/brackets are published, entry
            fees become non-refundable.
          </p>
        </section>

        <section className="mb-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">6. Customer Support & Disputes</h2>
          <p className="mb-4 leading-relaxed">
            For any queries, refund requests, or dispute resolutions regarding your payments, please reach out to our support
            team:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="mb-1">
              <strong>Email:</strong>{" "}
              <a href="mailto:support@sportsvilla.co.in" className="text-emerald-600 hover:underline">
                support@sportsvilla.co.in
              </a>
            </p>
            <p className="mb-1">
              <strong>Phone / WhatsApp:</strong> +91 9618443558
            </p>
            <p>
              <strong>Website:</strong>{" "}
              <a href="https://sportsvilla.co.in" className="text-emerald-600 hover:underline">
                https://sportsvilla.co.in
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
