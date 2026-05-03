import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
};

function HeaderLogoMark() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="h-9 w-9 shrink-0 text-white"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g fill="currentColor">
        <rect x="3" y="22" width="6" height="14" rx="1.5" opacity="0.72" />
        <rect x="11" y="16" width="6" height="20" rx="1.5" opacity="0.86" />
        <rect x="19" y="10" width="6" height="26" rx="1.5" />
      </g>
      <path
        d="M25 8.5 34 17.5 21 31.5 14 24.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
        <header className="sticky top-0 z-50 border-b border-white/10 bg-sw-heading shadow-[0_6px_20px_-6px_rgba(0,0,0,0.35)]">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center px-4 sm:h-16 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-white no-underline transition hover:opacity-90"
            >
              <HeaderLogoMark />
              <span className="text-[15px] font-semibold tracking-tight sm:text-base">
                StreamWise
              </span>
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
