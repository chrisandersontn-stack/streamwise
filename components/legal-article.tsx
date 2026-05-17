import type { ReactNode } from "react";
import Link from "next/link";

type LegalArticleProps = {
  children: ReactNode;
};

/** Shared shell for About, legal, and Contact pages. */
export function LegalArticle({ children }: LegalArticleProps) {
  return (
    <main className="flex w-full flex-1 flex-col bg-sw-page">
      <div
        className="h-1.5 bg-gradient-to-r from-sw-heading via-sw-heading/80 to-sw-hero-from"
        aria-hidden
      />
      <article className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14 [&_a]:font-medium [&_a]:text-sw-heading [&_a]:underline [&_a]:decoration-slate-300 [&_a]:underline-offset-2 [&_a]:transition hover:[&_a]:text-slate-900">
        {children}
      </article>
    </main>
  );
}

export function LegalPageTitle({
  children,
  eyebrow,
  lead,
}: {
  children: ReactNode;
  eyebrow?: string;
  lead?: ReactNode;
}) {
  return (
    <header className="border-b border-black/[0.06] pb-8">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{eyebrow}</p>
      ) : null}
      <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-sw-heading sm:text-4xl">
        {children}
      </h1>
      {lead ? (
        <div className="mt-5 text-base leading-relaxed text-sw-body sm:text-lg">{lead}</div>
      ) : null}
    </header>
  );
}

export function LegalMeta({ children }: { children: ReactNode }) {
  return <p className="mt-6 text-sm text-slate-500">{children}</p>;
}

export function LegalSection({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mt-10 scroll-mt-24">
      <h2 className="text-lg font-semibold tracking-tight text-sw-heading sm:text-xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-sw-body sm:text-base">{children}</div>
    </section>
  );
}

export function LegalHighlight({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:px-6 sm:py-5">
      {children}
    </div>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2.5 pl-5">{children}</ul>;
}

export function LegalPageFooter() {
  return (
    <footer className="mt-14 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/[0.06] pt-8 text-sm text-slate-500">
      <Link href="/" className="font-medium text-sw-heading hover:text-slate-900">
        Compare plans
      </Link>
      <span aria-hidden className="text-slate-300">
        ·
      </span>
      <Link href="/contact">Contact</Link>
      <span aria-hidden className="text-slate-300">
        ·
      </span>
      <Link href="/privacy">Privacy</Link>
      <span aria-hidden className="text-slate-300">
        ·
      </span>
      <Link href="/terms">Terms</Link>
    </footer>
  );
}
