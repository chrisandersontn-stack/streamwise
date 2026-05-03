import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
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
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
