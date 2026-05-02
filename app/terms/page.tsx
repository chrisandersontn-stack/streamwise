import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | StreamWise",
  description: "Terms and conditions for using StreamWise.",
};

export default function TermsPage() {
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "support@streamwise.app";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-4 text-sm text-slate-600">
        Last updated: May 2, 2026
      </p>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          StreamWise provides informational comparisons of streaming offers.
          Pricing, eligibility, and terms can change frequently and vary by
          region and account.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Not financial, legal, or tax advice
        </h2>
        <p>
          StreamWise is a comparison tool. It is not financial, legal, or tax
          advice. Always verify current pricing and provider terms before
          purchasing.
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

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Outbound links and third parties
        </h2>
        <p>
          StreamWise links to third-party websites and services. We are not
          responsible for third-party content, pricing changes, checkout flows,
          or privacy practices.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Acceptable use
        </h2>
        <p>
          You agree not to interfere with service operation, abuse APIs, attempt
          unauthorized access, or use automation that harms platform stability.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Changes</h2>
        <p>
          These terms may be updated. Continued use after changes constitutes
          acceptance of the updated terms.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Contact</h2>
        <p>
          Questions about these terms:{" "}
          <a className="underline underline-offset-2" href={`mailto:${supportEmail}`}>
            {supportEmail}
          </a>
        </p>
      </section>
    </main>
  );
}
