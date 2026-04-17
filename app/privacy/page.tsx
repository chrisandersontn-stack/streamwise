import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | StreamWise",
  description: "How StreamWise handles data and privacy.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm text-slate-600">
        Last updated: April 17, 2026
      </p>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          StreamWise helps you compare streaming subscription pricing paths. This
          page explains what information the product may collect and how it is
          used.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Information you provide
        </h2>
        <p>
          If you sign in with email, your email address is processed by your
          authentication provider (Supabase) to deliver sign-in links.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Information collected automatically
        </h2>
        <p>
          When you click outbound links to official sources, StreamWise may log a
          basic analytics event to improve the product (for example: which offer
          was clicked, referrer, and browser user agent string).
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Cookies</h2>
        <p>
          StreamWise may use cookies or similar technologies for session
          continuity and authentication.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Contact</h2>
        <p>
          Replace this section with your business contact email and mailing
          address before publishing broadly.
        </p>
      </section>
    </main>
  );
}
