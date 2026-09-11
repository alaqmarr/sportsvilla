import "./globals.css";
import { AlertProvider } from "@/components/AlertProvider";
import { NfcSimulatorPanel } from "@/components/nfc/NfcSimulatorPanel";

export const metadata = {
  title: "Sportsvilla Management",
  description: "Management portal for Sportsvilla",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AlertProvider>
          {children}
          <NfcSimulatorPanel />
        </AlertProvider>
      </body>
    </html>
  );
}

