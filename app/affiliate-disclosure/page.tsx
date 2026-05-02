import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | StreamWise",
  description: "How StreamWise may earn compensation from outbound links.",
};

export default function AffiliateDisclosurePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold tracking-tight">Affiliate Disclosure</h1>
      <p className="mt-4 text-sm text-slate-600">
        Last updated: May 2, 2026
      </p>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          StreamWise may include outbound links to official streaming providers
          and retailers. Some links may be affiliate links or otherwise
          compensated partnerships.
        </p>
        <p>
          If you purchase or sign up through a compensated link, StreamWise may
          receive a commission or referral fee at no additional cost to you.
        </p>
        <p>
          Recommendation ranking is based on selected services, catalog pricing
          data, and value logic (including 12-month total). Compensation does not
          change ranking order.
        </p>
        <p>
          Some providers may not offer affiliate links in all contexts. In those
          cases, StreamWise may link to a non-affiliate official source.
        </p>
        <p>
          We disclose compensated-link behavior in-product and on this page so
          users can make informed decisions.
        </p>
      </section>
    </main>
  );
}
