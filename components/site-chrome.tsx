import Link from "next/link";
import { getPublicContactEmail } from "@/lib/site-email";

const navLinkClass =
  "rounded-md px-2 py-1.5 text-[13px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white sm:text-sm";

const footerLinkClass =
  "text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-sw-heading";

export function SiteHeaderNav() {
  return (
    <nav
      className="flex max-w-[min(100%,22rem)] flex-wrap justify-end gap-x-1 gap-y-0.5 sm:max-w-none sm:gap-x-1"
      aria-label="Primary"
    >
      <Link href="/about" className={navLinkClass}>
        About
      </Link>
      <Link href="/support" className={navLinkClass}>
        Support
      </Link>
      <Link href="/contact" className={navLinkClass}>
        Contact
      </Link>
      <Link href="/privacy" className={navLinkClass}>
        Privacy
      </Link>
      <Link href="/terms" className={navLinkClass}>
        Terms
      </Link>
    </nav>
  );
}

export function SiteFooter() {
  const contactEmail = getPublicContactEmail();
  const showAdminPricingEditor =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_SHOW_ADMIN_PRICING_LINK === "1" ||
    process.env.NEXT_PUBLIC_SHOW_ADMIN_PRICING_LINK === "true";

  return (
    <footer className="mt-auto border-t border-black/5 bg-sw-page px-4 py-10 text-sm text-sw-body sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="max-w-2xl leading-relaxed text-sw-body">
          StreamWise compares streaming options using pricing data, provider terms, and estimated
          12-month cost.
        </p>
        <p className="mt-2 max-w-2xl leading-relaxed text-slate-500">
          Prices and offers can change. Always confirm final terms with the provider before
          subscribing.
        </p>
        <nav
          className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5 text-[13px] sm:text-sm"
          aria-label="Site and legal"
        >
          <Link className={footerLinkClass} href="/about">
            About
          </Link>
          <Link className={footerLinkClass} href="/contact">
            Contact
          </Link>
          <Link className={footerLinkClass} href="/support">
            Support
          </Link>
          <Link className={footerLinkClass} href="/privacy">
            Privacy
          </Link>
          <Link className={footerLinkClass} href="/terms">
            Terms
          </Link>
          <Link className={footerLinkClass} href="/affiliate-disclosure">
            Affiliate disclosure
          </Link>
          <Link className={footerLinkClass} href="/app-privacy-details">
            App privacy details
          </Link>
          <a className={footerLinkClass} href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          {showAdminPricingEditor ? (
            <Link
              className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-sw-heading"
              href="/admin/pricing"
            >
              Catalog admin (pricing)
            </Link>
          ) : null}
        </nav>
      </div>
    </footer>
  );
}
