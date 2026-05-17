import Link from "next/link";
import {
  LegalArticle,
  LegalHighlight,
  LegalList,
  LegalMeta,
  LegalPageFooter,
  LegalPageTitle,
  LegalSection,
} from "@/components/legal-article";
import { STREAMWISE_HELLO_EMAIL, getPublicContactEmail } from "@/lib/site-email";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata = marketingMetadata({
  title: "Privacy Policy",
  description:
    "How StreamWise handles analytics, anonymous usage data, affiliate links, and your privacy. Contact hello@streamwise.media.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const contactEmail = getPublicContactEmail();

  return (
    <LegalArticle>
      <LegalPageTitle
        eyebrow="Legal"
        lead="We collect only what we need to run comparisons, improve the product, and keep the site secure. We do not sell your personal data."
      >
        Privacy Policy
      </LegalPageTitle>

      <LegalMeta>Last updated: May 15, 2026</LegalMeta>

      <LegalSection title="Overview" id="overview">
        <p>
          StreamWise helps you compare streaming pricing paths. This policy describes what we
          collect, what stays anonymous, and how to reach us at{" "}
          <a href={`mailto:${STREAMWISE_HELLO_EMAIL}`}>{STREAMWISE_HELLO_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection title="Analytics and usage data" id="analytics">
        <p>
          We use <strong className="font-semibold text-sw-heading">analytics</strong> to understand
          how the product is used and where to improve it. This can include:
        </p>
        <LegalList>
          <li>
            <strong className="text-sw-heading">Anonymous usage data</strong> such as page views and
            general traffic patterns (via{" "}
            <a href="https://plausible.io/privacy-focused-web-analytics" rel="noopener noreferrer">
              Plausible
            </a>
            , a privacy-oriented analytics provider without advertising cookies).
          </li>
          <li>
            Product events like recommendation views, outbound offer clicks, selected services,
            timestamps, referrer, and browser user-agent strings.
          </li>
          <li>
            When configured, aggregated metrics may also be sent to providers such as PostHog for
            product analytics.
          </li>
        </LegalList>
        <p>
          Analytics data is used to operate and improve StreamWise—not to build advertising profiles
          about you across unrelated sites.
        </p>
      </LegalSection>

      <LegalSection title="Information you provide" id="account">
        <p>
          Optional sign-in uses our authentication provider (Supabase) to deliver magic-link login.
          If you create an account, we may store preference settings (for example your selected
          streaming services) linked to your email.
        </p>
      </LegalSection>

      <LegalHighlight>
        <p className="text-sm font-semibold text-sw-heading sm:text-base">We do not sell personal data</p>
        <p className="mt-2 text-sm leading-relaxed text-sw-body sm:text-base">
          StreamWise does <strong className="font-semibold text-sw-heading">not sell</strong> your
          personal information. We do not rent or trade contact details to data brokers or marketers.
          Data is used only as described in this policy to run and improve the service.
        </p>
      </LegalHighlight>

      <LegalSection title="What we do not collect" id="not-collected">
        <LegalList>
          <li>Passwords for Netflix, Hulu, or other streaming services.</li>
          <li>Payment card numbers or checkout actions on your behalf.</li>
          <li>
            An account is <strong className="text-sw-heading">not required</strong> to browse
            comparisons.
          </li>
          <li>
            We do not knowingly collect personal information from children under 13.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Cookies and similar technologies" id="cookies">
        <p>
          We may use cookies or local storage for session continuity, authentication, and basic
          analytics behavior. You can control cookies through your browser settings.
        </p>
      </LegalSection>

      <LegalSection title="External links and affiliate disclosures" id="links">
        <p>
          StreamWise links to third-party websites (streaming providers, retailers, and official
          offer pages). Those sites have their own privacy practices.
        </p>
        <p>
          Outbound links may include affiliate or tracking parameters where configured. Affiliate
          compensation does not change recommendation ranking. See our{" "}
          <Link href="/affiliate-disclosure">affiliate disclosure</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Third-party services" id="third-parties">
        <p>
          Depending on configuration, StreamWise may use Supabase (auth and data), Vercel (hosting),
          and analytics providers as described above. Each processes data according to its own
          policies when you interact with those features.
        </p>
      </LegalSection>

      <LegalSection title="Retention and deletion" id="retention">
        <p>
          We retain account preferences and analytics data only as long as needed to operate and
          improve StreamWise. To request deletion of account-associated data, email{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </LegalSection>

      <LegalSection title="Contact" id="contact">
        <p>
          Privacy questions or deletion requests:{" "}
          <a href={`mailto:${STREAMWISE_HELLO_EMAIL}`}>{STREAMWISE_HELLO_EMAIL}</a>
        </p>
      </LegalSection>

      <LegalPageFooter />
    </LegalArticle>
  );
}
