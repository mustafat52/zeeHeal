import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "zeeheal",
  description: "Your skin. Your weight. Your hormones. One root cause.",
  // Fix: app/manifest.ts (Next's built-in manifest convention) is served
  // at /manifest.webmanifest, not /manifest.json — this was pointing at a
  // path nothing actually serves, so the <link rel="manifest"> tag likely
  // 404'd silently, breaking "Add to Home Screen" icon/name/theme-color
  // behavior even though the manifest content itself was correct.
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "zeeheal",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-ivory">
        <div className="max-w-md mx-auto min-h-screen bg-ivory relative">
          {children}
        </div>
      </body>
    </html>
  );
}