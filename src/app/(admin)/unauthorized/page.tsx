import React from "react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
      <p className="text-gray-400 mb-8 max-w-md">
        You do not have the required permissions to view this page or perform this action. 
        If you believe this is an error, please contact a Super Admin.
      </p>
      <Link 
        href="/admin" 
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
