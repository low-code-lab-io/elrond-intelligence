import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";

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
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
