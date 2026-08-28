import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { eventConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `${eventConfig.name} | ${eventConfig.headline}`,
  description: `${eventConfig.description} - ${eventConfig.topic}`,
};

export const viewport: Viewport = {
  themeColor: "#3B124D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans antialiased selection:bg-brand selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
