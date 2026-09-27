import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elrond Intelligence",
  description:
    "A directory of climate, impact and sustainability data sources, organizations, tools and solutions for companies and entrepreneurs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
