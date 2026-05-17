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
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata = marketingMetadata({
  title: "About StreamWise",
  description:
    "StreamWise compares standalone streaming subscriptions, bundles, carrier perks, and memberships to help you find the cheapest setup—with transparent, affiliate-neutral rankings.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <LegalArticle>
      <LegalPageTitle
        eyebrow="About"
        lead={
          <>
            StreamWise is an independent tool built for clarity. We help you compare real ways to
            pay for the streaming services you want—without hidden ranking tricks.
          </>
        }
      >
        About StreamWise
      </LegalPageTitle>

      <LegalMeta>Last updated: May 15, 2026</LegalMeta>

      <LegalSection title="What StreamWise does">
        <p>
          StreamWise helps you compare{" "}
          <strong className="font-semibold text-sw-heading">standalone streaming subscriptions</strong>
          , official <strong className="font-semibold text-sw-heading">bundles</strong>,{" "}
          <strong className="font-semibold text-sw-heading">carrier perks</strong>, and{" "}
          <strong className="font-semibold text-sw-heading">included memberships</strong> (for
          example retail or warehouse plans that bundle streaming).
        </p>
        <p>
          The goal is straightforward: find the{" "}
          <strong className="font-semibold text-sw-heading">
            cheapest way to watch the services you actually want
          </strong>
          , with monthly and annual totals you can understand at a glance.
        </p>
      </LegalSection>

      <LegalHighlight>
        <p className="text-sm font-semibold text-sw-heading sm:text-base">How we rank options</p>
        <p className="mt-2 text-sm leading-relaxed text-sw-body sm:text-base">
          Recommendations prioritize{" "}
          <strong className="font-semibold text-sw-heading">estimated 12-month cost</strong>{" "}
          comparisons, then starting and ongoing monthly amounts. Every path in your results is scored
          with the same rules.
        </p>
      </LegalHighlight>

      <LegalSection title="Transparency and affiliates">
        <p>
          StreamWise values <strong className="font-semibold text-sw-heading">transparency</strong>{" "}
          and <strong className="font-semibold text-sw-heading">simplicity</strong>. Some outbound
          links may be affiliate links, but{" "}
          <strong className="font-semibold text-sw-heading">
            affiliate relationships do not influence rankings
          </strong>
          . Compensation never moves an offer up or down the list.
        </p>
        <p>
          Read our full <Link href="/affiliate-disclosure">affiliate disclosure</Link> for details.
        </p>
      </LegalSection>

      <LegalSection title="How comparisons are built">
        <p>
          Offer details come from public plan pages, bundle disclosures, and provider marketing copy,
          normalized into a structured catalog. You pick the services you care about; StreamWise
          models eligible direct plans, bundles, perks, and memberships side by side.
        </p>
        <LegalList>
          <li>Promos, scheduled price changes, and eligibility limits are flagged when we can.</li>
          <li>
            The live catalog updates on a schedule—not continuously—so always confirm checkout
            pricing with the provider.
          </li>
          <li>StreamWise is a research tool, not a streaming provider or billing system.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Ready to compare?">
        <p>
          Head back to the planner, select your services, and see which combination wins on total
          cost over a year.
        </p>
        <p>
          <Link href="/" className="font-semibold">
            Open StreamWise →
          </Link>
        </p>
      </LegalSection>

      <LegalPageFooter />
    </LegalArticle>
  );
}
