"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Option, PriceStatus } from "@/app/streamwise-data";

const TOKEN_KEY = "streamwise_catalog_admin_token";

const PRICE_STATUSES: { value: PriceStatus; label: string }[] = [
  { value: "current", label: "Current" },
  { value: "scheduled_change", label: "Scheduled change" },
  { value: "expired", label: "Expired" },
  { value: "needs_verification", label: "Needs verification" },
];

type CatalogResponse = {
  options: Option[];
  services: unknown[];
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminPricingPage() {
  const [browserUrl, setBrowserUrl] = useState("");
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [optionId, setOptionId] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [rememberToken, setRememberToken] = useState(true);

  const [sourceUrl, setSourceUrl] = useState("");
  const [monthly, setMonthly] = useState("");
  const [effectiveMonthly, setEffectiveMonthly] = useState("");
  const [lastChecked, setLastChecked] = useState(todayIsoDate());
  const [notes, setNotes] = useState("");
  const [priceStatus, setPriceStatus] = useState<PriceStatus>("current");

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : null;
    if (stored) setAdminToken(stored);
    if (typeof window !== "undefined") {
      setBrowserUrl(`${window.location.origin}/admin/pricing`);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/catalog");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as CatalogResponse;
        if (!cancelled) {
          setCatalog(data);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) setLoadError("Could not load catalog.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedOptions = useMemo(() => {
    if (!catalog?.options) return [];
    return [...catalog.options].sort((a, b) => a.name.localeCompare(b.name));
  }, [catalog]);

  const applyOptionToForm = useCallback((opt: Option) => {
    setOptionId(opt.id);
    setSourceUrl(opt.sourceUrl ?? "");
    setMonthly(String(opt.monthly));
    setEffectiveMonthly(
      opt.effectiveMonthly !== undefined && opt.effectiveMonthly !== null
        ? String(opt.effectiveMonthly)
        : ""
    );
    setLastChecked(opt.lastChecked?.slice(0, 10) ?? todayIsoDate());
    setNotes(opt.notes ?? "");
    setPriceStatus((opt.priceStatus ?? "current") as PriceStatus);
    setSaveMessage(null);
  }, []);

  const onOptionChange = (id: string) => {
    setOptionId(id);
    const opt = catalog?.options.find((o) => o.id === id);
    if (opt) applyOptionToForm(opt);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);
    const token = adminToken.trim();
    if (!token) {
      setSaveMessage({ type: "err", text: "Enter your admin token." });
      return;
    }
    if (!optionId) {
      setSaveMessage({ type: "err", text: "Choose a plan." });
      return;
    }
    const monthlyNum = Number.parseFloat(monthly);
    if (!Number.isFinite(monthlyNum) || monthlyNum < 0) {
      setSaveMessage({ type: "err", text: "Monthly price must be a valid number." });
      return;
    }

    let eff: number | null | undefined;
    if (effectiveMonthly.trim() === "") {
      eff = null;
    } else {
      const n = Number.parseFloat(effectiveMonthly);
      if (!Number.isFinite(n) || n < 0) {
        setSaveMessage({ type: "err", text: "Effective monthly must be empty or a valid number." });
        return;
      }
      eff = n;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        optionId,
        sourceUrl,
        monthly: monthlyNum,
        lastChecked,
        notes,
        priceStatus,
        effectiveMonthly: eff,
      };

      const res = await fetch("/api/admin/catalog-option", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setSaveMessage({
          type: "err",
          text: data.error ? `Save failed: ${data.error}` : `Save failed (${res.status})`,
        });
        return;
      }
      if (rememberToken && typeof window !== "undefined") {
        sessionStorage.setItem(TOKEN_KEY, token);
      }
      setSaveMessage({ type: "ok", text: "Saved. The main app will show the new price after refresh." });
      const refresh = await fetch("/api/catalog");
      if (refresh.ok) {
        const next = (await refresh.json()) as CatalogResponse;
        setCatalog(next);
        const updated = next.options.find((o) => o.id === optionId);
        if (updated) applyOptionToForm(updated);
      }
    } catch {
      setSaveMessage({ type: "err", text: "Network error while saving." });
    } finally {
      setSaving(false);
    }
  };

  const copyBrowserUrl = () => {
    if (browserUrl && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(browserUrl);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-xl font-semibold text-slate-900">Update plan pricing</h1>
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
        <strong className="font-semibold">Open in a web browser</strong> (Chrome or Safari), not in the Cursor
        editor. Start the app with <code className="rounded bg-amber-100/80 px-1">npm run dev</code>, then go to{" "}
        {browserUrl ? (
          <>
            <a href="/admin/pricing" className="font-mono font-semibold underline underline-offset-2">
              {browserUrl}
            </a>
            <button
              type="button"
              onClick={copyBrowserUrl}
              className="ml-2 rounded-lg border border-amber-400 bg-white px-2 py-0.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
            >
              Copy URL
            </button>
          </>
        ) : (
          <span className="font-mono">http://localhost:3000/admin/pricing</span>
        )}
        . On the home page, use the footer link <strong>Catalog admin (pricing)</strong> in dev, or set{" "}
        <code className="rounded bg-amber-100/80 px-1">NEXT_PUBLIC_SHOW_ADMIN_PRICING_LINK=1</code> to show that
        link in production.
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Pick a catalog plan, set the official <strong>source URL</strong> and <strong>monthly price</strong> you
        verified, then save. Uses the same token as <code className="rounded bg-slate-200 px-1">PUT /api/catalog</code>
        .
      </p>

      {loadError && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {loadError}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">
          Admin token
          <input
            type="password"
            autoComplete="off"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            placeholder="CATALOG_ADMIN_TOKEN"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={rememberToken}
            onChange={(e) => setRememberToken(e.target.checked)}
          />
          Remember token in this browser (session only)
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Plan
          <select
            value={optionId}
            onChange={(e) => onOptionChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            disabled={!sortedOptions.length}
          >
            <option value="">Select…</option>
            {sortedOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.id})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Source URL (official pricing page)
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            placeholder="https://…"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Monthly price (USD)
          <input
            type="text"
            inputMode="decimal"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            placeholder="11.99"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Effective monthly after promo (optional)
          <input
            type="text"
            inputMode="decimal"
            value={effectiveMonthly}
            onChange={(e) => setEffectiveMonthly(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            placeholder="Leave empty to clear"
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            For intro pricing: set the ongoing amount here; leave empty if same as monthly.
          </span>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Verified on (last checked)
          <input
            type="date"
            value={lastChecked}
            onChange={(e) => setLastChecked(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Price status
          <select
            value={priceStatus}
            onChange={(e) => setPriceStatus(e.target.value as PriceStatus)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          >
            {PRICE_STATUSES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          />
        </label>

        {saveMessage && (
          <div
            className={
              saveMessage.type === "ok"
                ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
                : "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
            }
          >
            {saveMessage.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !optionId}
          className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>

      <p className="mt-6 text-xs text-slate-500">
        Short URL: <code className="rounded bg-slate-200 px-1">/admin</code> redirects here.
      </p>
    </div>
  );
}
