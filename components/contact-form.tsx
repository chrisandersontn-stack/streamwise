"use client";

import { useState } from "react";
import { STREAMWISE_HELLO_EMAIL } from "@/lib/site-email";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`StreamWise support${name ? ` — ${name}` : ""}`);
    const body = encodeURIComponent(
      [
        name ? `Name: ${name}` : null,
        email ? `Reply-to: ${email}` : null,
        "",
        message || "(no message)",
      ]
        .filter(Boolean)
        .join("\n")
    );
    window.location.href = `mailto:${STREAMWISE_HELLO_EMAIL}?subject=${subject}&body=${body}`;
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-sw-heading shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sw-heading/25 focus:ring-2 focus:ring-sw-heading/15";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:p-8"
      aria-labelledby="contact-form-heading"
    >
      <h2 id="contact-form-heading" className="text-base font-semibold text-sw-heading sm:text-lg">
        Send a message
      </h2>
      <p className="text-sm leading-relaxed text-sw-body">
        This opens your email app with a draft addressed to{" "}
        <a className="font-semibold underline underline-offset-2" href={`mailto:${STREAMWISE_HELLO_EMAIL}`}>
          {STREAMWISE_HELLO_EMAIL}
        </a>
        .
      </p>
      <div>
        <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Name <span className="font-normal normal-case text-slate-400">(optional)</span>
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Your email <span className="font-normal normal-case text-slate-400">(optional)</span>
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(ev) => setMessage(ev.target.value)}
          className={`${inputClass} min-h-[120px] resize-y`}
          placeholder="What can we help with?"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-sw-heading px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sw-heading/90 sm:w-auto sm:min-w-[12rem]"
      >
        Open email app
      </button>
    </form>
  );
}
