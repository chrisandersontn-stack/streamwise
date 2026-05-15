import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle, LegalPageTitle } from "@/components/legal-article";
import { getPublicContactEmail } from "@/lib/site-email";

export const metadata: Metadata = {
  title: "Support | StreamWise",
  description: "Help, contact, and how StreamWise works.",
};

const section = "mt-8 space-y-4 text-sm leading-relaxed text-sw-body sm:text-base";

export default function SupportPage() {
  const supportEmail = getPublicContactEmail();

  return (
    <LegalArticle>
      <LegalPageTitle eyebrow="Help">Support</LegalPageTitle>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-sw-body sm:text-base">
        StreamWise is a streaming savings planner. It compares catalog-backed pricing paths so you
        can choose bundles, perks, and direct plans with clearer totals.
      </p>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">Contact</h2>
      <section className={section}>
        <p>
          Email: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
        </p>
        <p>
          Prefer a short form? Use the <Link href="/contact">Contact</Link> page (opens your mail
          app with a draft).
        </p>
        <p className="text-slate-600">
          For privacy or data deletion requests, see the <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">How pricing works</h2>
      <section className={section}>
        <p>
          Recommendations use the hosted pricing catalog and a value engine that prioritizes
          12-month total cost, then starting and ongoing monthly amounts. Offers can include promos,
          bundles, and provider-gated perks.
        </p>
        <p>
          Always confirm the final price and eligibility on the provider&apos;s checkout page before
          you subscribe.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">Affiliate links</h2>
      <section className={section}>
        <p>
          Outbound links may include affiliate or tracking parameters where configured. Recommendation
          ranking does not depend on whether a link is affiliate-supported. Read the full{" "}
          <Link href="/affiliate-disclosure">Affiliate disclosure</Link>.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">Legal</h2>
      <section className={section}>
        <p>
          <Link href="/terms">Terms of Service</Link>
          {" · "}
          <Link href="/privacy">Privacy Policy</Link>
          {" · "}
          <Link href="/about">About</Link>
        </p>
      </section>
    </LegalArticle>
  );
}
