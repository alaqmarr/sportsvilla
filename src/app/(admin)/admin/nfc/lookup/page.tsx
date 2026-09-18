import { Metadata } from "next";
import LookupClient from "./LookupClient";

export const metadata: Metadata = {
  title: "NFC Member Lookup | Admin",
};

export default function NfcLookupPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white dark:text-white">NFC Member Lookup</h1>
      <LookupClient />
    </div>
  );
}
