import "./globals.css";
import { AlertProvider } from "@/components/AlertProvider";
import { Navigation } from "@/components/Navigation";

export const metadata = {
  title: "Sportsvilla Management",
  description: "Management portal for Sportsvilla",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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
          <Navigation>
            {children}
          </Navigation>
        </AlertProvider>
      </body>
    </html>
  );
}
