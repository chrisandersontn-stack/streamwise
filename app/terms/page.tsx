import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | StreamWise",
  description: "Terms for using StreamWise.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-4 text-sm text-slate-600">
        Last updated: April 17, 2026
      </p>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          StreamWise provides informational comparisons. Pricing, bundles, and
          eligibility rules change frequently and vary by region and account.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">No warranty</h2>
        <p>
          StreamWise is provided &quot;as is&quot; without warranties of any
          kind. You are responsible for verifying offers with the official
          provider before purchasing or changing subscriptions.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Limitation of liability
        </h2>
        <p>
          To the maximum extent permitted by law, StreamWise and its operators
          are not liable for any damages arising from use of the service.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Changes</h2>
        <p>
          These terms may be updated. Continued use after changes constitutes
          acceptance of the updated terms.
        </p>
      </section>
    </main>
  );
}
