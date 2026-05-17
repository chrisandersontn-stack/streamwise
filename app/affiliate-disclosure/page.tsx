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
  title: "Affiliate Disclosure",
  description:
    "How StreamWise uses Amazon Associates, Walmart affiliate links, CJ Affiliate, and official provider links.",
  path: "/affiliate-disclosure",
});

export default function AffiliateDisclosurePage() {
  return (
    <LegalArticle>
      <LegalPageTitle
        eyebrow="Legal"
        lead="StreamWise may earn a commission when you use certain outbound links. Recommendations are ranked by price logic, not by who pays us."
      >
        Affiliate Disclosure
      </LegalPageTitle>

      <LegalMeta>Last updated: May 16, 2026</LegalMeta>

      <LegalHighlight>
        <p className="text-sm font-semibold text-sw-heading sm:text-base">Ranking is not for sale</p>
        <p className="mt-2 text-sm leading-relaxed text-sw-body sm:text-base">
          “Best” and “cheapest” results are based on your selected services, our pricing catalog, and
          estimated <strong className="font-semibold text-sw-heading">12-month total cost</strong>.
          Affiliate or partner compensation does <strong className="font-semibold text-sw-heading">not</strong>{" "}
          change sort order or which combination we recommend.
        </p>
      </LegalHighlight>

      <LegalSection title="What StreamWise does today">
        <p>
          StreamWise links you to official streaming providers, retailers, and related services so
          you can confirm prices and subscribe. Some of those links are monetized; many are not.
        </p>
        <LegalList>
          <li>
            <strong className="text-sw-heading">Amazon Associates.</strong> When configured, outbound
            links to <strong className="text-sw-heading">amazon.com</strong> (for example Amazon Prime
            or Prime Video pages in our catalog) may include your Associates tracking tag. We are
            participants in the Amazon Associates Program.
          </li>
          <li>
            <strong className="text-sw-heading">Walmart affiliate program.</strong> When configured,
            outbound links to <strong className="text-sw-heading">walmart.com</strong> (for example
            Walmart+ streaming benefit help pages) may include Walmart affiliate tracking parameters.
          </li>
          <li>
            <strong className="text-sw-heading">CJ Affiliate (Commission Junction).</strong> We use CJ
            for some partner offers. Today this includes a{" "}
            <strong className="text-sw-heading">NordVPN</strong> promotional link shown separately from
            streaming plan rankings. Additional CJ deep links may apply to specific catalog options
            when we configure them (for example live TV services), always as outbound links—not as a
            change to ranking math.
          </li>
          <li>
            <strong className="text-sw-heading">Per-plan affiliate URLs.</strong> Individual catalog
            entries may include a dedicated <code className="text-xs">affiliateUrl</code> when we have
            an approved tracking link for that offer. That URL takes priority over the official source
            page for that button only.
          </li>
          <li>
            <strong className="text-sw-heading">Official (non-affiliate) links.</strong> When we do
            not have an approved tracking link, we send you to the provider&apos;s public plan or help
            page (Netflix, many DTC apps, etc.). We do not claim those are commission links.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="What we do not do">
        <LegalList>
          <li>We do not charge providers to appear higher in “best” or “cheapest” results.</li>
          <li>We do not sell your personal information to advertisers.</li>
          <li>
            We do not complete purchases for you—you always subscribe on the provider&apos;s or
            retailer&apos;s site.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Cost to you">
        <p>
          Using an affiliate or tracked link should not increase the price you pay. Providers set
          their own prices; always confirm the final amount at checkout.
        </p>
      </LegalSection>

      <LegalSection title="In the app and on the site">
        <p>
          Compensated links may be labeled in context (for example “Affiliate-supported link” on the
          NordVPN card, or “Some links may be affiliate-supported” near recommendations). Outbound
          plan buttons open in a new tab when appropriate.
        </p>
      </LegalSection>

      <LegalSection title="Program policies">
        <p>
          Each network has its own terms (Amazon Associates Operating Agreement, Walmart affiliate
          terms, CJ publisher terms). We aim to follow those programs&apos; disclosure requirements on
          this page and in-product.
        </p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          Contact{" "}
          <a href="mailto:hello@streamwise.media">hello@streamwise.media</a>. See also our{" "}
          <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms of Service</Link>.
        </p>
      </LegalSection>

      <LegalPageFooter />
    </LegalArticle>
  );
}
