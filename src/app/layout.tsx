import "./globals.css";
import { AlertProvider } from "@/components/AlertProvider";

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
        </AlertProvider>
      </body>
    </html>
  );
}
