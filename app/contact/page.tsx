import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { LegalArticle, LegalPageTitle } from "@/components/legal-article";
import { STREAMWISE_HELLO_EMAIL } from "@/lib/site-email";

export const metadata: Metadata = {
  title: "Contact | StreamWise",
  description: "Contact StreamWise at hello@streamwise.media.",
};

export default function ContactPage() {
  return (
    <LegalArticle>
      <LegalPageTitle eyebrow="StreamWise">Contact</LegalPageTitle>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-sw-body sm:text-base">
        Questions about comparisons, partnerships, or the site? Reach us at{" "}
        <a href={`mailto:${STREAMWISE_HELLO_EMAIL}`}>{STREAMWISE_HELLO_EMAIL}</a>
        , or use the form below to open a draft in your mail app.
      </p>

      <ContactForm />

      <p className="mt-10 text-sm text-slate-500">
        <Link href="/privacy">Privacy Policy</Link>
        {" · "}
        <Link href="/support">Support</Link>
        {" · "}
        <Link href="/">Home</Link>
      </p>
    </LegalArticle>
  );
}
