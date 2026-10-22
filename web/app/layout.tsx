import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/vt323/400.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hydro-scan-six.vercel.app"),
  title: "HydroScan – Making Microplastic Pollution Visible",
  description:
    "HydroScan is a portable, offline, low-cost optical device that screens water for microplastic contamination on-site. No lab, no chemicals, no internet.",
  openGraph: {
    title: "HydroScan – Making Microplastic Pollution Visible",
    description:
      "A portable, offline device that screens water for microplastics on-site. Conrad Challenge 2025–26.",
    images: ["/prototype-exterior.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#031420",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
