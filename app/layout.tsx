import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { PlausibleAnalytics } from "@/components/plausible-analytics";
import { SiteFooter, SiteHeaderNav } from "@/components/site-chrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StreamWise | Find Better Streaming Deals",
  description:
    "Compare streaming subscriptions, bundles, and provider perks to find lower monthly and annual costs.",
  verification: {
    other: {
      "fo-verify": "ca91fe57-4835-4fe0-b91d-01d93b7bcdaf",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sw-page text-sw-body">
        <PlausibleAnalytics />
        <header className="sticky top-0 z-50 border-b border-white/10 bg-sw-heading shadow-[0_6px_20px_-6px_rgba(0,0,0,0.35)]">
          <div className="mx-auto flex min-h-14 w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:min-h-16 sm:px-6 sm:py-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-white no-underline transition hover:opacity-90"
            >
              <Image
                src="/streamwise-logo.png"
                alt=""
                width={40}
                height={40}
                className="h-9 w-9 shrink-0 object-contain"
                priority
              />
              <span className="text-[15px] font-semibold tracking-tight sm:text-base">StreamWise</span>
            </Link>
            <SiteHeaderNav />
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
