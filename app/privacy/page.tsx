import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle, LegalPageTitle } from "@/components/legal-article";
import { STREAMWISE_HELLO_EMAIL, getPublicContactEmail } from "@/lib/site-email";

export const metadata: Metadata = {
  title: "Privacy Policy | StreamWise",
  description: "What StreamWise collects, what it does not collect, analytics, and affiliate links.",
};

const section = "mt-8 space-y-4 text-sm leading-relaxed text-sw-body sm:text-base";

export default function PrivacyPage() {
  const contactEmail = getPublicContactEmail();

  return (
    <LegalArticle>
      <LegalPageTitle eyebrow="Legal">Privacy Policy</LegalPageTitle>
      <p className="mt-6 text-sm text-slate-500">Last updated: May 11, 2026</p>

      <section className={section}>
        <p>
          StreamWise helps you compare streaming pricing paths. This policy explains what
          information we collect, what we do not collect, and how we use it. Questions:{" "}
          <a href={`mailto:${STREAMWISE_HELLO_EMAIL}`}>{STREAMWISE_HELLO_EMAIL}</a>.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">What we collect</h2>
      <section className={section}>
        <ul>
          <li>
            <strong className="text-sw-heading">Information you provide.</strong> If you use
            optional sign-in, your email address is processed by our authentication provider
            (Supabase) to deliver magic-link login. StreamWise may store preference settings
            associated with your account.
          </li>
          <li>
            <strong className="text-sw-heading">Product usage and analytics.</strong> StreamWise
            records events to understand usage and improve the product. Events can include
            recommendation views, outbound offer clicks, your selected service set, timestamps,
            referrer, and a browser user-agent string. Events may be stored in our database and, when
            configured in the deployment environment, summarized or forwarded to analytics providers
            (for example PostHog) for product metrics. We also use{" "}
            <a href="https://plausible.io/privacy-focused-web-analytics" rel="noopener noreferrer">
              Plausible
            </a>{" "}
            on the public website for privacy-friendly page analytics (no advertising cookies).
          </li>
          <li>
            <strong className="text-sw-heading">Cookies and similar technologies.</strong> We may
            use cookies or local storage for session continuity, authentication, and basic analytics
            behavior.
          </li>
        </ul>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">
        What we do not collect
      </h2>
      <section className={section}>
        <ul>
          <li>
            We do <strong className="text-sw-heading">not</strong> collect passwords for streaming
            services (Netflix, Hulu, etc.) or run checkout on your behalf.
          </li>
          <li>
            We do <strong className="text-sw-heading">not</strong> require an account to browse
            comparisons; sign-in is optional for saving preferences.
          </li>
          <li>
            We do <strong className="text-sw-heading">not</strong> sell your personal information
            as a standalone product. We use data to operate and improve StreamWise as described
            here.
          </li>
          <li>
            StreamWise is <strong className="text-sw-heading">not</strong> directed to children
            under 13, and we do not knowingly collect personal information from children.
          </li>
        </ul>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">
        Affiliate and external links
      </h2>
      <section className={section}>
        <p>
          StreamWise links to third-party websites. Those sites have their own privacy practices.
          Outbound links may include affiliate or tracking parameters where configured.{" "}
          <Link href="/affiliate-disclosure">Read the affiliate disclosure</Link>.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">Third-party services</h2>
      <section className={section}>
        <p>
          StreamWise uses Supabase for authentication and data persistence when enabled. Analytics
          or hosting providers may also process technical data as part of operating the service.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">
        Data retention and deletion
      </h2>
      <section className={section}>
        <p>
          We retain account preferences and analytics data only as long as needed to operate and
          improve StreamWise. You may request deletion of account-associated data by contacting us
          at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">Contact</h2>
      <section className={section}>
        <p>
          Privacy questions or deletion requests:{" "}
          <a href={`mailto:${STREAMWISE_HELLO_EMAIL}`}>{STREAMWISE_HELLO_EMAIL}</a>
        </p>
      </section>
    </LegalArticle>
  );
}
