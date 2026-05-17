import Link from "next/link";
import {
  LegalArticle,
  LegalHighlight,
  LegalMeta,
  LegalPageFooter,
  LegalPageTitle,
  LegalSection,
} from "@/components/legal-article";
import { STREAMWISE_HELLO_EMAIL } from "@/lib/site-email";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata = marketingMetadata({
  title: "iOS App Data Summary",
  description:
    "Plain-language summary of data the StreamWise iOS app and website may collect. For full terms, see the Privacy Policy.",
  path: "/app-privacy-details",
});

type DataSummary = {
  what: string;
  when: string;
  why: string;
  linkedToYou: string;
};

const dataSummary: DataSummary[] = [
  {
    what: "Email address",
    when: "Only if you choose optional sign-in (magic link).",
    why: "To sign you in and save your preferences.",
    linkedToYou: "Yes",
  },
  {
    what: "Your streaming picks and settings",
    when: "When you use the app or site and optionally save preferences.",
    why: "To remember what you selected and show relevant comparisons.",
    linkedToYou: "Yes, if you use an account",
  },
  {
    what: "Usage information (e.g. pages viewed, recommendation clicks)",
    when: "When you use StreamWise.",
    why: "To understand what works and improve the product.",
    linkedToYou: "Generally no",
  },
  {
    what: "Basic technical info (e.g. browser type, time of visit)",
    when: "When you use StreamWise.",
    why: "To keep the service reliable and secure.",
    linkedToYou: "No",
  },
];

export default function AppPrivacyDetailsPage() {
  return (
    <LegalArticle>
      <LegalPageTitle
        eyebrow="StreamWise app"
        lead={
          <>
            A short summary of data the StreamWise <strong className="font-semibold text-sw-heading">iOS app</strong>{" "}
            and website may handle. For the complete policy, read our{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </>
        }
      >
        iOS app data summary
      </LegalPageTitle>

      <LegalMeta>Last updated: May 15, 2026</LegalMeta>

      <LegalHighlight>
        <p className="text-sm font-semibold text-sw-heading sm:text-base">No cross-app advertising tracking</p>
        <p className="mt-2 text-sm leading-relaxed text-sw-body sm:text-base">
          StreamWise does <strong className="font-semibold text-sw-heading">not</strong> use your data to track you
          across other companies&apos; apps or websites for ads. We do{" "}
          <strong className="font-semibold text-sw-heading">not sell</strong> your personal information.
        </p>
      </LegalHighlight>

      <LegalSection title="What we may collect">
        <div className="space-y-4">
          {dataSummary.map((row) => (
            <div
              key={row.what}
              className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:p-6"
            >
              <h3 className="font-semibold text-sw-heading">{row.what}</h3>
              <dl className="mt-3 space-y-2 text-sm text-sw-body">
                <div>
                  <dt className="font-medium text-slate-600">When</dt>
                  <dd>{row.when}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-600">Why</dt>
                  <dd>{row.why}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-600">Linked to you</dt>
                  <dd>{row.linkedToYou}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection title="Optional account">
        <p>
          You can compare streaming options without creating an account. Sign-in is optional and only needed if you
          want preferences saved across devices.
        </p>
      </LegalSection>

      <LegalSection title="Analytics">
        <p>
          We use privacy-oriented analytics on the public website (such as Plausible) and may record product events
          to improve recommendations. We do not use advertising cookies or sell analytics data about you.
        </p>
      </LegalSection>

      <LegalSection title="Questions or deletion">
        <p>
          Contact{" "}
          <a href={`mailto:${STREAMWISE_HELLO_EMAIL}`}>{STREAMWISE_HELLO_EMAIL}</a> or see the{" "}
          <Link href="/privacy">Privacy Policy</Link> for how to request deletion of account data.
        </p>
      </LegalSection>

      <LegalPageFooter />
    </LegalArticle>
  );
}
