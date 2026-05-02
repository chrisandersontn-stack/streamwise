import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support | StreamWise",
  description: "Help, contact, and how StreamWise works.",
};

export default function SupportPage() {
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "support@streamwise.app";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold tracking-tight">Support</h1>
      <p className="mt-3 text-sm text-slate-600">
        StreamWise is a streaming savings planner. It compares catalog-backed
        pricing paths so you can choose bundles, perks, and direct plans with
        clearer totals.
      </p>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
        <p>
          Email:{" "}
          <a className="underline underline-offset-2" href={`mailto:${supportEmail}`}>
            {supportEmail}
          </a>
        </p>
        <p className="text-slate-600">
          For privacy or data deletion requests, see the{" "}
          <Link className="font-medium underline underline-offset-2" href="/privacy">
            Privacy Policy
          </Link>
          .
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">How pricing works</h2>
        <p>
          Recommendations use the hosted pricing catalog and a value engine that
          prioritizes 12-month total cost, then starting and ongoing monthly
          amounts. Offers can include promos, bundles, and provider-gated perks.
        </p>
        <p>
          Always confirm the final price and eligibility on the provider&apos;s
          checkout page before you subscribe.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Affiliate links</h2>
        <p>
          Outbound links may include affiliate or tracking parameters where
          configured. Recommendation ranking does not depend on whether a link is
          affiliate-supported. Read the full{" "}
          <Link
            className="font-medium underline underline-offset-2"
            href="/affiliate-disclosure"
          >
            Affiliate disclosure
          </Link>
          .
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Legal</h2>
        <p>
          <Link className="underline underline-offset-2" href="/terms">
            Terms of Service
          </Link>
          {" · "}
          <Link className="underline underline-offset-2" href="/privacy">
            Privacy Policy
          </Link>
        </p>
      </section>
    </main>
  );
}
