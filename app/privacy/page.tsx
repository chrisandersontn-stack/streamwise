import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | StreamWise",
  description: "How StreamWise collects, uses, and protects data.",
};

export default function PrivacyPage() {
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "support@streamwise.app";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm text-slate-600">
        Last updated: May 2, 2026
      </p>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          StreamWise helps users compare streaming pricing paths. This policy
          explains what information we collect, why we collect it, and how we
          handle it.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Information you provide
        </h2>
        <p>
          If you use optional sign-in, your email address is processed by our
          authentication provider (Supabase) to deliver magic-link login.
          StreamWise stores preference settings associated with your account.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Information collected automatically
        </h2>
        <p>
          StreamWise records product analytics events to understand usage and
          improve recommendations. Events can include recommendation views,
          outbound offer clicks, selected service set, timestamp, referrer, and
          a browser user-agent string.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          How we use information
        </h2>
        <p>
          We use collected information to operate the app, save preferences,
          measure product quality, and analyze conversion from recommendation
          views to outbound clicks.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Cookies</h2>
        <p>
          StreamWise may use cookies or similar technologies for session
          continuity, authentication, and basic analytics behavior.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Third-party services
        </h2>
        <p>
          StreamWise currently uses Supabase for authentication and data
          persistence. If enabled, analytics data may also be sent to providers
          configured in the deployment environment.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Data retention and deletion
        </h2>
        <p>
          We retain account preferences and analytics data only as long as
          needed to operate and improve StreamWise. You may request deletion of
          account-associated data by contacting us.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Children&apos;s privacy
        </h2>
        <p>
          StreamWise is not directed to children under 13, and we do not
          knowingly collect personal information from children.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Contact</h2>
        <p>
          Privacy questions or deletion requests:{" "}
          <a className="underline underline-offset-2" href={`mailto:${supportEmail}`}>
            {supportEmail}
          </a>
        </p>
      </section>
    </main>
  );
}
