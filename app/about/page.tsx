import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | StreamWise",
  description: "What StreamWise is, how pricing is sourced, and how updates work.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold tracking-tight">About StreamWise</h1>
      <p className="mt-4 text-sm text-slate-600">Last updated: April 18, 2026</p>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          StreamWise is an independent tool that compares ways to pay for the
          streaming services you want—direct subscriptions, official bundles,
          memberships that include streaming, and common carrier-style perks—so
          you can see plausible monthly totals side by side.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Who runs this</h2>
        <p>
          StreamWise is built and maintained by Chris Anderson as a focused
          consumer utility for subscription pricing research (not a bank,
          insurer, or streaming provider).
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          How pricing is sourced
        </h2>
        <p>
          Offer details are modeled from official marketing pages, plan pages,
          and bundle disclosures, then normalized into a structured catalog the
          app can search and rank. When something is uncertain, StreamWise marks
          it explicitly (for example: promos, scheduled price changes, or items
          that need verification).
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          How pricing is updated
        </h2>
        <p>
          The live site loads its catalog from StreamWise&apos;s dataset (via the
          catalog API). Updates ship when the dataset is refreshed—typically as
          part of deliberate maintenance, not continuously in real time—so
          always confirm the current price at checkout on the provider&apos;s site.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Affiliate note</h2>
        <p>
          Some outbound links may be monetized. Read the{" "}
          <Link
            className="font-semibold text-slate-900 underline underline-offset-2 hover:text-slate-700"
            href="/affiliate-disclosure"
          >
            affiliate disclosure
          </Link>
          .
        </p>

        <p className="pt-6 text-sm text-slate-600">
          <Link className="underline underline-offset-2 hover:text-slate-900" href="/">
            Back to StreamWise
          </Link>
        </p>
      </section>
    </main>
  );
}
