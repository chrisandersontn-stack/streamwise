import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
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
  title: "Contact",
  description:
    "Get help with StreamWise comparisons, pricing questions, or feedback. Email hello@streamwise.media.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <LegalArticle>
      <LegalPageTitle
        eyebrow="Support"
        lead="We read every message. Tell us what confused you, what broke, or what you wish StreamWise compared next."
      >
        Contact
      </LegalPageTitle>

      <LegalMeta>Typical reply time: a few business days</LegalMeta>

      <LegalHighlight>
        <p className="text-sm font-semibold text-sw-heading sm:text-base">Email us directly</p>
        <p className="mt-2 text-sm leading-relaxed text-sw-body sm:text-base">
          <a
            href={`mailto:${STREAMWISE_HELLO_EMAIL}`}
            className="text-base font-semibold sm:text-lg"
          >
            {STREAMWISE_HELLO_EMAIL}
          </a>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Best for pricing feedback, bug reports, partnership notes, and privacy requests.
        </p>
      </LegalHighlight>

      <LegalSection title="How we can help">
        <ul className="space-y-3 text-sm leading-relaxed text-sw-body sm:text-base">
          <li>
            <strong className="text-sw-heading">Using StreamWise</strong> — questions about
            comparisons, bundles, or how totals are calculated.
          </li>
          <li>
            <strong className="text-sw-heading">Something looks wrong</strong> — a price, offer, or
            link that does not match the provider&apos;s site.
          </li>
          <li>
            <strong className="text-sw-heading">Privacy</strong> — see also our{" "}
            <Link href="/privacy">Privacy Policy</Link> for data deletion requests.
          </li>
        </ul>
        <p className="mt-4 text-sm text-slate-600">
          For quick answers about how pricing works, visit{" "}
          <Link href="/support">Support</Link>.
        </p>
      </LegalSection>

      <ContactForm />

      <LegalPageFooter />
    </LegalArticle>
  );
}
