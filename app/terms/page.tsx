import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle, LegalPageTitle } from "@/components/legal-article";
import { STREAMWISE_HELLO_EMAIL } from "@/lib/site-email";

export const metadata: Metadata = {
  title: "Terms of Service | StreamWise",
  description: "Terms for using StreamWise as an informational streaming comparison tool.",
};

const section = "mt-8 space-y-4 text-sm leading-relaxed text-sw-body sm:text-base";

export default function TermsPage() {
  return (
    <LegalArticle>
      <LegalPageTitle eyebrow="Legal">Terms of Service</LegalPageTitle>
      <p className="mt-6 text-sm text-slate-500">Last updated: May 11, 2026</p>

      <section className={section}>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of the StreamWise website and
          related informational tools (collectively, the &quot;Service&quot;). By using the Service,
          you agree to these Terms.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">Informational use only</h2>
      <section className={section}>
        <p>
          StreamWise provides <strong className="font-semibold text-sw-heading">informational</strong>{" "}
          comparisons of streaming offers, bundles, perks, and memberships. It is a planning aid,
          not a subscription checkout, billing system, or provider support channel.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">
        No guarantee of pricing accuracy
      </h2>
      <section className={section}>
        <p>
          Pricing, promotions, eligibility, taxes, and fees can change at any time and vary by
          region, account, and device.{" "}
          <strong className="font-semibold text-sw-heading">
            StreamWise does not guarantee that any price, offer, or description on the Service is
            accurate, complete, or current.
          </strong>{" "}
          You are responsible for verifying all material details with the official provider before
          purchasing or changing subscriptions.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">Prices and offers may change</h2>
      <section className={section}>
        <p>
          The Service reflects a point-in-time catalog and rules. Providers may update plans
          without notice to StreamWise. Continued use of the Service after catalog or UI updates
          constitutes acceptance of the Service as updated.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">
        Not financial, legal, or tax advice
      </h2>
      <section className={section}>
        <p>
          The Service is not financial, legal, or tax advice. If you need professional advice, consult
          a qualified professional.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">No warranty</h2>
      <section className={section}>
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties
          of any kind, whether express or implied, including implied warranties of merchantability,
          fitness for a particular purpose, and non-infringement, to the fullest extent permitted by
          law.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">Limitation of liability</h2>
      <section className={section}>
        <p>
          To the maximum extent permitted by law, StreamWise and its operators shall not be liable
          for any indirect, incidental, special, consequential, or punitive damages, or any loss of
          profits or revenues, whether incurred directly or indirectly, arising from your use of the
          Service or reliance on any information provided through the Service.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">
        Outbound links and third parties
      </h2>
      <section className={section}>
        <p>
          The Service may link to third-party websites and services. We do not control and are not
          responsible for third-party content, pricing, checkout flows, or privacy practices.{" "}
          <Link href="/affiliate-disclosure">Affiliate disclosure</Link>.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">Acceptable use</h2>
      <section className={section}>
        <p>
          You agree not to interfere with the operation of the Service, abuse APIs, attempt
          unauthorized access, or use automation in a way that harms platform stability or other
          users.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">Changes to these Terms</h2>
      <section className={section}>
        <p>
          We may update these Terms from time to time. If we make material changes, we will take
          reasonable steps to notify users where appropriate. Continued use after changes become
          effective constitutes acceptance of the updated Terms.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-sw-heading">Contact</h2>
      <section className={section}>
        <p>
          Questions about these Terms:{" "}
          <a href={`mailto:${STREAMWISE_HELLO_EMAIL}`}>{STREAMWISE_HELLO_EMAIL}</a>
        </p>
      </section>
    </LegalArticle>
  );
}
