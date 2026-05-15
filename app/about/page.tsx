import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle, LegalPageTitle } from "@/components/legal-article";

export const metadata: Metadata = {
  title: "About | StreamWise",
  description:
    "How StreamWise compares streaming subscriptions, bundles, carrier perks, and memberships—with transparent rankings.",
};

const section = "mt-8 space-y-4 text-sm leading-relaxed text-sw-body sm:text-base";

export default function AboutPage() {
  return (
    <LegalArticle>
      <LegalPageTitle eyebrow="StreamWise">About</LegalPageTitle>
      <p className="mt-6 text-sm text-slate-500">Last updated: May 11, 2026</p>

      <section className={section}>
        <p>
          StreamWise is an independent comparison tool. We model how you could pay for the streaming
          services you want by comparing{" "}
          <strong className="font-semibold text-sw-heading">standalone subscriptions</strong>,{" "}
          <strong className="font-semibold text-sw-heading">official bundles</strong>,{" "}
          <strong className="font-semibold text-sw-heading">carrier and provider perks</strong>, and{" "}
          <strong className="font-semibold text-sw-heading">included memberships</strong> (for
          example retail or warehouse memberships that bundle streaming). The goal is simple: help
          you see plausible totals side by side and spot a cheaper overall setup.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">Transparency</h2>
      <section className={section}>
        <p>
          Some outbound links may be affiliate links.{" "}
          <strong className="font-semibold text-sw-heading">
            Affiliate relationships do not determine recommendation order.
          </strong>{" "}
          Rankings follow the same rules for every option in the catalog. Read our full{" "}
          <Link href="/affiliate-disclosure">affiliate disclosure</Link>.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">
        Estimated 12-month costs
      </h2>
      <section className={section}>
        <p>
          StreamWise highlights <strong className="font-semibold text-sw-heading">estimated</strong>{" "}
          costs over a typical <strong className="font-semibold text-sw-heading">12-month</strong>{" "}
          window so short promos and ongoing rates are easier to compare at a glance. These figures
          are projections from our catalog and rules—not a quote or checkout total.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">
        Comparison methodology
      </h2>
      <section className={section}>
        <p>
          Offer details are normalized from public plan pages, bundle disclosures, and provider
          marketing copy into a structured catalog. The app combines your selected services with
          eligible options (direct plans, bundles, included perks, and similar) and ranks paths
          using the same scoring rules for everyone. When something is uncertain—promos, scheduled
          price changes, eligibility—we call that out in the UI where we can.
        </p>
        <p>
          The live site loads its catalog from StreamWise&apos;s dataset (via the catalog API).
          Updates ship when the dataset is refreshed, not necessarily in real time, so{" "}
          <strong className="font-semibold text-sw-heading">
            always confirm the current price and terms on the provider&apos;s checkout page
          </strong>{" "}
          before you subscribe.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">Who runs this</h2>
      <section className={section}>
        <p>
          StreamWise is built and maintained as a consumer utility for subscription pricing
          research—not a bank, insurer, or streaming provider.
        </p>
      </section>

      <p className="mt-12 text-sm text-slate-500">
        <Link href="/">Back to StreamWise</Link>
      </p>
    </LegalArticle>
  );
}
