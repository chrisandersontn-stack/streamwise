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
import { STREAMWISE_HELLO_EMAIL } from "@/lib/site-email";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata = marketingMetadata({
  title: "Terms of Service",
  description:
    "Terms for using StreamWise: informational comparisons only, pricing may change, no accuracy guarantee, and limitation of liability.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalArticle>
      <LegalPageTitle
        eyebrow="Legal"
        lead="By using StreamWise, you agree to these Terms. Please read them before relying on any comparison result."
      >
        Terms of Service
      </LegalPageTitle>

      <LegalMeta>Last updated: May 15, 2026</LegalMeta>

      <LegalSection title="Agreement" id="agreement">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of the StreamWise website,
          mobile experience, and related tools (collectively, the &quot;Service&quot;). If you do not
          agree, do not use the Service.
        </p>
      </LegalSection>

      <LegalHighlight>
        <p className="text-sm font-semibold text-sw-heading sm:text-base">Informational purposes only</p>
        <p className="mt-2 text-sm leading-relaxed text-sw-body sm:text-base">
          StreamWise provides <strong className="font-semibold text-sw-heading">informational</strong>{" "}
          comparisons of streaming offers, bundles, perks, and memberships. It is a planning aid—not
          a subscription checkout, billing system, or provider support channel.
        </p>
      </LegalHighlight>

      <LegalSection title="Pricing, offers, and accuracy" id="pricing">
        <p>
          <strong className="font-semibold text-sw-heading">Prices and offers may change</strong> at
          any time. Promotions, taxes, fees, eligibility, and regional differences are controlled by
          providers, not StreamWise.
        </p>
        <p>
          <strong className="font-semibold text-sw-heading">
            We do not guarantee the accuracy
          </strong>
          , completeness, or timeliness of any price, offer name, or description on the Service.
          Catalog data reflects a point-in-time snapshot and may lag behind provider websites.
        </p>
      </LegalSection>

      <LegalSection title="Your decisions" id="decisions">
        <p>
          <strong className="font-semibold text-sw-heading">
            You are solely responsible for purchase decisions.
          </strong>{" "}
          Before subscribing, canceling, or changing any plan, verify the current price, included
          channels, contract terms, and eligibility on the official provider&apos;s checkout page.
        </p>
        <LegalList>
          <li>StreamWise does not place orders or manage billing on your behalf.</li>
          <li>We are not financial, legal, or tax advisors.</li>
          <li>Consult a qualified professional when you need advice beyond comparison research.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="No warranty" id="warranty">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF
          ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT, TO THE FULLEST EXTENT PERMITTED BY
          LAW.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability" id="liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, STREAMWISE AND ITS OPERATORS, AFFILIATES, AND
          CONTRIBUTORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
          PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING FROM YOUR USE
          OF OR RELIANCE ON THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p>
          IN JURISDICTIONS THAT DO NOT ALLOW CERTAIN LIMITATIONS, OUR LIABILITY IS LIMITED TO THE
          GREATEST EXTENT PERMITTED BY LAW.
        </p>
      </LegalSection>

      <LegalSection title="Outbound links and affiliates" id="links">
        <p>
          The Service may link to third-party websites. We do not control and are not responsible for
          third-party content, pricing, checkout flows, or privacy practices. See our{" "}
          <Link href="/affiliate-disclosure">affiliate disclosure</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use" id="use">
        <p>
          You agree not to interfere with the Service, abuse APIs, attempt unauthorized access, or use
          automation that harms platform stability or other users.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these Terms" id="changes">
        <p>
          We may update these Terms from time to time. Continued use after changes become effective
          constitutes acceptance of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="Contact" id="contact">
        <p>
          Questions about these Terms:{" "}
          <a href={`mailto:${STREAMWISE_HELLO_EMAIL}`}>{STREAMWISE_HELLO_EMAIL}</a>
        </p>
      </LegalSection>

      <LegalPageFooter />
    </LegalArticle>
  );
}
