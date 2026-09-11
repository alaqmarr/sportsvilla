import WalletClient from "./WalletClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NFC Wallet Management | SportsVilla",
};

export default function NfcWalletPage() {
  return <WalletClient />;
}
