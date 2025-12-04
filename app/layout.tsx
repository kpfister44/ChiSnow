// ABOUTME: Root layout component that wraps the entire application
// ABOUTME: Configures global styles, metadata, and provides consistent structure across all pages

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChiSnow - Snowfall Mapping",
  description: "View actual snowfall totals on an interactive map for the Chicagoland area and United States",
  keywords: ["snowfall", "weather", "Chicago", "map", "NOAA"],
  authors: [{ name: "ChiSnow Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
