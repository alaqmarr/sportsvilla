"use client";

import { useState } from "react";
import Image from "next/image";

export default function RequestDeletePage() {
  const [mobile, setMobile] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call for deletion request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image src="/long-logo.png" alt="SportsVilla" width={200} height={50} unoptimized className="h-12 w-auto object-contain mx-auto mb-6" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Request Account Deletion
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Submit a request to permanently delete your Sportsvilla account and all associated data.
          </p>
        </div>

        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-4">
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                  Registered Mobile Number
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="e.g. +919876543210"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1 mt-4">
                  Reason for leaving (Optional)
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Let us know how we can improve..."
                />
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm mt-4">
              <p><strong>Warning:</strong> This action cannot be undone. All your turf bookings, memberships, and loyalty points will be permanently lost.</p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Deletion Request"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-md p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-green-800">Request Received</h3>
            <p className="mt-2 text-sm text-green-700">
              Your account deletion request for <strong>{mobile}</strong> has been received. Our team will process the deletion of your personal data within 30 days. You will receive an SMS confirmation once the process is complete.
            </p>
            <div className="mt-6">
              <a href="/" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                Return to Home
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
