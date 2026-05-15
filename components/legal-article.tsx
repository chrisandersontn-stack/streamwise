import type { ReactNode } from "react";

type LegalArticleProps = {
  children: ReactNode;
};

/**
 * Shared layout for marketing / legal pages: responsive width, StreamWise colors.
 */
export function LegalArticle({ children }: LegalArticleProps) {
  return (
    <main className="flex w-full flex-1 justify-center bg-sw-page px-4 py-10 sm:px-6 sm:py-14">
      <article className="w-full max-w-3xl [&_a]:font-medium [&_a]:text-sw-heading [&_a]:underline [&_a]:decoration-slate-300 [&_a]:underline-offset-2 [&_a]:hover:text-slate-900">
        {children}
      </article>
    </main>
  );
}

export function LegalPageTitle({
  children,
  eyebrow,
}: {
  children: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="border-b border-black/[0.06] pb-8">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{eyebrow}</p>
      ) : null}
      <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-sw-heading sm:text-4xl">
        {children}
      </h1>
    </header>
  );
}
