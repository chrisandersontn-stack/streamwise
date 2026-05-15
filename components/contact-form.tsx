"use client";

import { useState } from "react";
import { STREAMWISE_HELLO_EMAIL } from "@/lib/site-email";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`StreamWise contact${name ? ` from ${name}` : ""}`);
    const body = encodeURIComponent(
      [
        name ? `Name: ${name}` : null,
        email ? `Reply email: ${email}` : null,
        "",
        message || "(no message)",
      ]
        .filter(Boolean)
        .join("\n")
    );
    window.location.href = `mailto:${STREAMWISE_HELLO_EMAIL}?subject=${subject}&body=${body}`;
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-sw-heading shadow-sm outline-none ring-sw-heading/20 transition placeholder:text-slate-400 focus:border-sw-heading/25 focus:ring-2";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 space-y-5 rounded-2xl border border-black/[0.06] bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8"
    >
      <p className="text-sm text-sw-body">
        Send a message with your default mail app. If nothing opens, email us directly at{" "}
        <a className="font-semibold text-sw-heading underline underline-offset-2" href={`mailto:${STREAMWISE_HELLO_EMAIL}`}>
          {STREAMWISE_HELLO_EMAIL}
        </a>
        .
      </p>
      <div>
        <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Name <span className="font-normal text-slate-400">(optional)</span>
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
          Your email <span className="font-normal text-slate-400">(optional)</span>
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
          className={`${inputClass} resize-y min-h-[120px]`}
          placeholder="How can we help?"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-sw-heading px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sw-heading/90 sm:w-auto sm:px-8"
      >
        Open in email app
      </button>
    </form>
  );
}
