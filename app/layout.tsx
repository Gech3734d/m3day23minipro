import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://addiseats.example.com";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Addis Eats | Delivery tracking", template: "%s | Addis Eats" },
  description: "Track Addis Eats orders, follow delivery progress, and export order records.",
  openGraph: { type: "website", siteName: "Addis Eats", title: "Addis Eats Delivery", description: "Track your Ethiopian food delivery in real time.", images: ["/opengraph-image"] }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="header"><Link href="/" className="brand"><span className="brand-icon">A</span><span><b>Addis Eats</b><small>ETHIOPIAN KITCHEN</small></span></Link><nav><Link href="/">Overview</Link><Link href="/delivery/AE-2048">Track delivery</Link></nav></header>
    <div id="main-content">{children}</div>
    <footer className="footer"><b>Addis Eats</b><span>Good food. Warm welcome. Ethiopian roots.</span></footer>
  </body></html>;
}