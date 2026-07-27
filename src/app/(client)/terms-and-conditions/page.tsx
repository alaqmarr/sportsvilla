import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Terms and Conditions</h1>
        <p className="mb-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString("en-IN")}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Acceptance of Terms</h2>
          <p className="mb-4 leading-relaxed">
            Welcome to <strong>Sportsvilla</strong> ("we", "our", or "us"). By accessing or using our website (
            <a href="https://sportsvilla.co.in" className="text-emerald-600 hover:underline">
              sportsvilla.co.in
            </a>
            ), our mobile applications (Android/iOS), or our sports turf booking and tournament management platform, you
            agree to comply with and be bound by these Terms and Conditions. If you do not agree with any part of these
            terms, please do not use our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">2. Services Provided</h2>
          <p className="mb-4 leading-relaxed">
            Sportsvilla provides an online platform for booking sports turfs, grounds, and facilities, registering for
            tournaments, managing member wallets, and tracking loyalty points. We act as an intermediary between sports
            enthusiasts and turf/facility management.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">3. Account Registration & Security</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2 leading-relaxed">
            <li>
              You must register using a valid mobile phone number. Authentication is conducted via WhatsApp or SMS One-Time
              Passwords (OTPs).
            </li>
            <li>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that
              occur under your account.
            </li>
            <li>
              You agree to provide accurate, current, and complete information during registration and to update such
              information to keep it accurate.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">4. Turf Booking & Usage Rules</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2 leading-relaxed">
            <li>
              <strong>Slot Confirmation:</strong> Bookings are subject to availability and are only confirmed once payment is
              processed or wallet credit is verified.
            </li>
            <li>
              <strong>Punctuality:</strong> Players must arrive on time for their reserved slots. Bookings will not be
              extended beyond the scheduled end time due to late arrivals.
            </li>
            <li>
              <strong>Venue Guidelines:</strong> All players must adhere to the rules of the specific turf venue, including
              appropriate footwear, equipment usage, and general code of conduct.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">5. Payments & Digital Wallet</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2 leading-relaxed">
            <li>
              All payments on Sportsvilla are processed through authorized and secure third-party payment gateways (including
              UPI, Credit/Debit Cards, Net Banking, and Wallets).
            </li>
            <li>
              <strong>Sportsvilla Wallet:</strong> Wallet credits and balances are non-transferable and can only be used for
              booking turfs or services within the Sportsvilla platform.
            </li>
            <li>
              Prices for turf slots and tournament entries are displayed in Indian Rupees (INR) and are subject to change by
              venue management.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">6. Cancellations & Refunds</h2>
          <p className="mb-4 leading-relaxed">
            Cancellations and refunds are governed by our separate{" "}
            <a href="/refund-policy" className="text-emerald-600 hover:underline font-semibold">
              Refund & Cancellation Policy
            </a>
            . Please review the refund policy before confirming any bookings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">7. Limitation of Liability</h2>
          <p className="mb-4 leading-relaxed">
            Sportsvilla is not liable for any physical injuries, loss of personal property, or accidents that occur on turf
            premises during matches or tournaments. Users participate in sports activities at their own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">8. Governing Law & Jurisdiction</h2>
          <p className="mb-4 leading-relaxed">
            These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes
            arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of
            Telangana, India.
          </p>
        </section>

        <section className="mb-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">9. Contact Information</h2>
          <p className="mb-4 leading-relaxed">
            If you have any questions or concerns regarding these Terms and Conditions, please contact us:
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
