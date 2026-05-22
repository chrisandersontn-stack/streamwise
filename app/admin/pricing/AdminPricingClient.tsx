"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  IncludedWith,
  Option,
  OptionCategory,
  PriceStatus,
  Provider,
  Requirement,
  Service,
} from "@/app/streamwise-data";

const TOKEN_KEY = "streamwise_catalog_admin_token";
const NEW_PLAN_VALUE = "__new__";

const PRICE_STATUSES: { value: PriceStatus; label: string }[] = [
  { value: "current", label: "Current" },
  { value: "scheduled_change", label: "Scheduled change" },
  { value: "expired", label: "Expired" },
  { value: "needs_verification", label: "Needs verification" },
];

const PROVIDERS: Provider[] = [
  "direct",
  "verizon",
  "walmart_plus",
  "tmobile",
  "xfinity",
  "instacart_plus",
  "apple",
  "amazon",
  "hulu",
  "philo",
  "roku",
];

const CATEGORIES: OptionCategory[] = ["direct", "bundle", "carrier", "membership", "promo"];

const REQUIREMENTS: Requirement[] = [
  "verizon",
  "walmart_plus",
  "tmobile",
  "xfinity",
  "instacart_plus",
  "amazon_prime",
  "att",
  "spectrum_charter",
  "apple_one",
];

const INCLUDED_WITH_OPTIONS: Array<{ value: "" | IncludedWith; label: string }> = [
  { value: "", label: "None" },
  { value: "verizon", label: "Verizon" },
  { value: "walmart_plus", label: "Walmart+" },
  { value: "tmobile", label: "T-Mobile" },
  { value: "xfinity", label: "Xfinity" },
  { value: "instacart_plus", label: "Instacart+" },
  { value: "amazon_prime", label: "Amazon Prime" },
  { value: "att", label: "AT&T" },
  { value: "spectrum_charter", label: "Spectrum / Charter" },
  { value: "apple_one", label: "Apple One" },
];

type CatalogResponse = {
  options: Option[];
  services: Service[];
};

type FormState = {
  id: string;
  name: string;
  provider: Provider;
  category: OptionCategory;
  monthly: string;
  effectiveMonthly: string;
  standardMonthly: string;
  introLengthMonths: string;
  source: string;
  sourceUrl: string;
  affiliateUrl: string;
  notes: string;
  lastChecked: string;
  priceStatus: PriceStatus;
  effectiveDate: string;
  expiresAt: string;
  mutuallyExclusiveGroup: string;
  includedWith: "" | IncludedWith;
  covers: string[];
  requires: Requirement[];
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(): FormState {
  return {
    id: "",
    name: "",
    provider: "direct",
    category: "bundle",
    monthly: "0",
    effectiveMonthly: "",
    standardMonthly: "",
    introLengthMonths: "",
    source: "",
    sourceUrl: "",
    affiliateUrl: "",
    notes: "",
    lastChecked: todayIsoDate(),
    priceStatus: "current",
    effectiveDate: "",
    expiresAt: "",
    mutuallyExclusiveGroup: "",
    includedWith: "",
    covers: [],
    requires: [],
  };
}

function optionToForm(opt: Option): FormState {
  return {
    id: opt.id,
    name: opt.name,
    provider: opt.provider,
    category: opt.category,
    monthly: String(opt.monthly),
    effectiveMonthly:
      opt.effectiveMonthly !== undefined && opt.effectiveMonthly !== null
        ? String(opt.effectiveMonthly)
        : "",
    standardMonthly:
      opt.standardMonthly !== undefined && opt.standardMonthly !== null
        ? String(opt.standardMonthly)
        : "",
    introLengthMonths:
      opt.introLengthMonths !== undefined && opt.introLengthMonths !== null
        ? String(opt.introLengthMonths)
        : "",
    source: opt.source,
    sourceUrl: opt.sourceUrl ?? "",
    affiliateUrl: opt.affiliateUrl ?? "",
    notes: opt.notes ?? "",
    lastChecked: opt.lastChecked?.slice(0, 10) ?? todayIsoDate(),
    priceStatus: (opt.priceStatus ?? "current") as PriceStatus,
    effectiveDate: opt.effectiveDate?.slice(0, 10) ?? "",
    expiresAt: opt.expiresAt?.slice(0, 10) ?? "",
    mutuallyExclusiveGroup: opt.mutuallyExclusiveGroup ?? "",
    includedWith: (opt.includedWith as IncludedWith | undefined) ?? "",
    covers: [...opt.covers],
    requires: opt.requires ? [...opt.requires] : [],
  };
}

function suggestMutexGroup(options: Option[], covers: string[]): string | null {
  const key = [...covers].sort().join("\u0001");
  for (const o of options) {
    if (!o.mutuallyExclusiveGroup) continue;
    if ([...o.covers].sort().join("\u0001") === key) return o.mutuallyExclusiveGroup;
  }
  return null;
}

function isProvider(v: string): v is Provider {
  return (PROVIDERS as readonly string[]).includes(v);
}

function isCategory(v: string): v is OptionCategory {
  return (CATEGORIES as readonly string[]).includes(v);
}

function applyExtractedFields(prev: FormState, fields: Record<string, unknown>): FormState {
  const next = { ...prev };
  if (typeof fields.name === "string") next.name = fields.name;
  if (typeof fields.source === "string") next.source = fields.source;
  if (typeof fields.notes === "string") next.notes = fields.notes;
  if (typeof fields.sourceUrl === "string") next.sourceUrl = fields.sourceUrl;
  if (typeof fields.affiliateUrl === "string") next.affiliateUrl = fields.affiliateUrl;
  if (typeof fields.monthly === "number" && Number.isFinite(fields.monthly)) {
    next.monthly = String(fields.monthly);
  }
  if (fields.effectiveMonthly === null) {
    next.effectiveMonthly = "";
  } else if (typeof fields.effectiveMonthly === "number" && Number.isFinite(fields.effectiveMonthly)) {
    next.effectiveMonthly = String(fields.effectiveMonthly);
  }
  if (fields.standardMonthly === null) {
    next.standardMonthly = "";
  } else if (typeof fields.standardMonthly === "number" && Number.isFinite(fields.standardMonthly)) {
    next.standardMonthly = String(fields.standardMonthly);
  }
  if (fields.introLengthMonths === null) {
    next.introLengthMonths = "";
  } else if (typeof fields.introLengthMonths === "number" && Number.isFinite(fields.introLengthMonths)) {
    next.introLengthMonths = String(Math.round(fields.introLengthMonths));
  }
  if (typeof fields.provider === "string" && isProvider(fields.provider)) {
    next.provider = fields.provider;
  }
  if (typeof fields.category === "string" && isCategory(fields.category)) {
    next.category = fields.category;
  }
  if (typeof fields.priceStatus === "string" && PRICE_STATUSES.some((p) => p.value === fields.priceStatus)) {
    next.priceStatus = fields.priceStatus as PriceStatus;
  }
  if (typeof fields.mutuallyExclusiveGroup === "string") {
    next.mutuallyExclusiveGroup = fields.mutuallyExclusiveGroup;
  } else if (fields.mutuallyExclusiveGroup === null) {
    next.mutuallyExclusiveGroup = "";
  }
  if (typeof fields.effectiveDate === "string") {
    next.effectiveDate = fields.effectiveDate.slice(0, 10);
  } else if (fields.effectiveDate === null) {
    next.effectiveDate = "";
  }
  if (typeof fields.expiresAt === "string") {
    next.expiresAt = fields.expiresAt.slice(0, 10);
  } else if (fields.expiresAt === null) {
    next.expiresAt = "";
  }
  if (Array.isArray(fields.covers)) {
    const c = fields.covers.filter((x): x is string => typeof x === "string");
    if (c.length) next.covers = c;
  }
  if (Array.isArray(fields.requires)) {
    const r = fields.requires.filter(
      (x): x is Requirement => typeof x === "string" && (REQUIREMENTS as readonly string[]).includes(x)
    );
    next.requires = r;
  }
  if (fields.includedWith === null || fields.includedWith === "") {
    next.includedWith = "";
  } else if (
    typeof fields.includedWith === "string" &&
    (REQUIREMENTS as readonly string[]).includes(fields.includedWith)
  ) {
    next.includedWith = fields.includedWith as IncludedWith;
  }
  return next;
}

export function AdminPricingClient() {
  const [browserUrl, setBrowserUrl] = useState("");
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [planKey, setPlanKey] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [rememberToken, setRememberToken] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmCreate, setConfirmCreate] = useState(false);

  const [extractUrl, setExtractUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractWarnings, setExtractWarnings] = useState<string[]>([]);

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
          if (data.options?.length) {
            const first = [...data.options].sort((a, b) => a.name.localeCompare(b.name))[0];
            if (first) {
              setPlanKey((pk) => (pk === "" ? first.id : pk));
              setForm((f) => f ?? optionToForm(first));
            }
          } else {
            setPlanKey(NEW_PLAN_VALUE);
            setForm(emptyForm());
          }
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

  const serviceLabels = useMemo(() => catalog?.services?.map((s) => s.label) ?? [], [catalog]);

  const onPlanChange = useCallback(
    (key: string) => {
      setPlanKey(key);
      setSaveMessage(null);
      setExtractError(null);
      setExtractWarnings([]);
      if (!catalog) return;
      if (key === NEW_PLAN_VALUE) {
        setForm(emptyForm());
        setConfirmCreate(false);
        return;
      }
      const opt = catalog.options.find((o) => o.id === key);
      if (opt) setForm(optionToForm(opt));
    },
    [catalog]
  );

  const toggleCover = (label: string) => {
    setForm((f) => {
      if (!f) return f;
      const has = f.covers.includes(label);
      const covers = has ? f.covers.filter((c) => c !== label) : [...f.covers, label];
      return { ...f, covers };
    });
  };

  const toggleRequire = (req: Requirement) => {
    setForm((f) => {
      if (!f) return f;
      const has = f.requires.includes(req);
      const requires = has ? f.requires.filter((r) => r !== req) : [...f.requires, req];
      return { ...f, requires };
    });
  };

  const onExtract = async () => {
    setExtractError(null);
    setExtractWarnings([]);
    const token = adminToken.trim();
    if (!token) {
      setExtractError("Enter your admin token first.");
      return;
    }
    const url = extractUrl.trim();
    if (!url) {
      setExtractError("Paste a pricing page URL.");
      return;
    }
    setExtracting(true);
    try {
      const res = await fetch("/api/admin/extract-from-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        hint?: string;
        fields?: Record<string, unknown>;
        warnings?: string[];
      };
      if (!res.ok || !data.ok) {
        const msg = data.hint
          ? data.hint
          : (data.error ?? `HTTP ${res.status}`);
        setExtractError(msg);
        return;
      }
      if (rememberToken && typeof window !== "undefined") {
        sessionStorage.setItem(TOKEN_KEY, token);
      }
      setForm((f) => (f && data.fields ? applyExtractedFields(f, data.fields) : f));
      setExtractWarnings(Array.isArray(data.warnings) ? data.warnings : []);
      if (!extractUrl.trim() && typeof data.fields?.sourceUrl === "string") {
        setExtractUrl(String(data.fields.sourceUrl));
      }
    } catch {
      setExtractError("Network error while extracting.");
    } finally {
      setExtracting(false);
    }
  };

  const onSuggestMutex = () => {
    if (!catalog || !form) return;
    const s = suggestMutexGroup(catalog.options, form.covers);
    if (s) setForm((f) => (f ? { ...f, mutuallyExclusiveGroup: s } : f));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);
    const token = adminToken.trim();
    if (!token) {
      setSaveMessage({ type: "err", text: "Enter your admin token." });
      return;
    }
    if (!form) {
      setSaveMessage({ type: "err", text: "Form not ready." });
      return;
    }

    const isNew = planKey === NEW_PLAN_VALUE;
    if (isNew) {
      if (!form.id.trim()) {
        setSaveMessage({ type: "err", text: "Enter a unique plan id (e.g. hulu_disney_bundle_promo)." });
        return;
      }
      if (!confirmCreate) {
        setSaveMessage({ type: "err", text: "Check “I am adding a new plan” to confirm." });
        return;
      }
    }

    const monthlyNum = Number.parseFloat(form.monthly);
    if (!Number.isFinite(monthlyNum) || monthlyNum < 0) {
      setSaveMessage({ type: "err", text: "Monthly price must be a valid number." });
      return;
    }

    let eff: number | null | undefined;
    if (form.effectiveMonthly.trim() === "") {
      eff = null;
    } else {
      const n = Number.parseFloat(form.effectiveMonthly);
      if (!Number.isFinite(n) || n < 0) {
        setSaveMessage({ type: "err", text: "Effective monthly must be empty or a valid number." });
        return;
      }
      eff = n;
    }

    if (!form.covers.length) {
      setSaveMessage({ type: "err", text: "Select at least one service this plan covers." });
      return;
    }

    const optionPayload: Record<string, unknown> = {
      id: isNew ? form.id.trim() : form.id,
      name: form.name.trim(),
      provider: form.provider,
      category: form.category,
      monthly: monthlyNum,
      covers: form.covers,
      notes: form.notes,
      source: form.source.trim(),
      sourceUrl: form.sourceUrl.trim(),
      lastChecked: form.lastChecked,
      priceStatus: form.priceStatus,
    };

    if (eff === null) optionPayload.effectiveMonthly = null;
    else if (eff !== undefined) optionPayload.effectiveMonthly = eff;

    if (form.affiliateUrl.trim()) optionPayload.affiliateUrl = form.affiliateUrl.trim();
    if (form.standardMonthly.trim()) {
      const sm = Number.parseFloat(form.standardMonthly);
      if (Number.isFinite(sm) && sm >= 0) optionPayload.standardMonthly = sm;
    }
    if (form.introLengthMonths.trim()) {
      const im = Number.parseInt(form.introLengthMonths, 10);
      if (Number.isFinite(im) && im >= 0) optionPayload.introLengthMonths = im;
    }
    if (form.effectiveDate.trim()) optionPayload.effectiveDate = form.effectiveDate.trim();
    if (form.expiresAt.trim()) optionPayload.expiresAt = form.expiresAt.trim();
    if (form.mutuallyExclusiveGroup.trim()) {
      optionPayload.mutuallyExclusiveGroup = form.mutuallyExclusiveGroup.trim();
    }
    if (form.requires.length) optionPayload.requires = form.requires;
    if (form.includedWith) optionPayload.includedWith = form.includedWith;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/catalog-option", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({
          kind: "full_option",
          create: isNew,
          option: optionPayload,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; mode?: string };
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
      setSaveMessage({
        type: "ok",
        text:
          data.mode === "create"
            ? "New plan saved. Refresh the main app to see it."
            : "Saved. Refresh the main app to see changes.",
      });
      const refresh = await fetch("/api/catalog");
      if (refresh.ok) {
        const next = (await refresh.json()) as CatalogResponse;
        setCatalog(next);
        const savedId = isNew ? form.id.trim() : form.id;
        setPlanKey(savedId);
        const updated = next.options.find((o) => o.id === savedId);
        if (updated) {
          setForm(optionToForm(updated));
          setConfirmCreate(false);
        }
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

  if (!form || !catalog) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-xl font-semibold text-slate-900">Catalog admin</h1>
        {loadError && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {loadError}
          </div>
        )}
        {!loadError && (
          <p className="mt-4 text-sm text-slate-600">Loading catalog…</p>
        )}
      </div>
    );
  }

  const idLocked = planKey !== NEW_PLAN_VALUE;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-semibold text-slate-900">Catalog admin</h1>
      <p className="mt-1 text-sm text-slate-600">
        Edit an existing plan or add a new one. Use <strong>Extract from URL</strong> to draft fields with Claude,
        then review everything before saving.
      </p>

      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
        <strong className="font-semibold">Use a normal browser</strong> (Chrome or Safari). In dev run{" "}
        <code className="rounded bg-amber-100/80 px-1">npm run dev</code> then open{" "}
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
        . Production needs <code className="rounded bg-amber-100/80 px-1">ANTHROPIC_API_KEY</code> for extraction.
      </div>

      {loadError && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {loadError}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Access</h2>
          <label className="mt-3 block text-sm font-medium text-slate-700">
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
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={rememberToken}
              onChange={(e) => setRememberToken(e.target.checked)}
            />
            Remember token in this browser (session only)
          </label>
        </section>

        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-indigo-950">Extract from URL (Claude)</h2>
          <p className="mt-1 text-xs text-indigo-950/80">
            Fetches the page on the server and asks the model for a JSON draft. It does not know your internal rules:
            always verify prices, coverage, and how you want <strong>starting</strong> vs <strong>ongoing</strong>{" "}
            monthly amounts to behave (see the pricing section below).
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              value={extractUrl}
              onChange={(e) => setExtractUrl(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-300 focus:ring-2"
              placeholder="https://…"
            />
            <button
              type="button"
              onClick={() => void onExtract()}
              disabled={extracting}
              className="shrink-0 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {extracting ? "Extracting…" : "Extract"}
            </button>
          </div>
          {extractError && (
            <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {extractError}
            </div>
          )}
          {extractWarnings.length > 0 && (
            <div className="mt-3 rounded-xl border border-indigo-300 bg-white px-3 py-3 text-sm text-slate-800 shadow-sm">
              <div className="text-xs font-semibold text-indigo-900">Notes from Claude — read before saving</div>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-800">
                {extractWarnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Plan</h2>
          <label className="mt-3 block text-sm font-medium text-slate-700">
            Select plan
            <select
              value={planKey}
              onChange={(e) => onPlanChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
              disabled={!sortedOptions.length}
            >
              {sortedOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.id})
                </option>
              ))}
              <option value={NEW_PLAN_VALUE}>+ Add new plan…</option>
            </select>
          </label>

          {planKey === NEW_PLAN_VALUE && (
            <label className="mt-4 block text-sm font-medium text-slate-700">
              New plan id (lowercase, letters, numbers, underscores)
              <input
                type="text"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none ring-slate-400 focus:ring-2"
                placeholder="e.g. max_netflix_bundle_2026"
                autoComplete="off"
              />
            </label>
          )}

          {idLocked && (
            <p className="mt-2 text-xs text-slate-500">
              Plan id: <span className="font-mono font-medium">{form.id}</span> (change by selecting another plan or
              add new)
            </p>
          )}

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Display name
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Provider
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value as Provider })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
              >
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as OptionCategory })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Coverage</h2>
          <p className="mt-1 text-xs text-slate-500">Services this plan satisfies in the picker (use exact labels).</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {serviceLabels.map((label) => (
              <label
                key={label}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={form.covers.includes(label)}
                  onChange={() => toggleCover(label)}
                />
                {label}
              </label>
            ))}
          </div>

          <h3 className="mt-6 text-sm font-semibold text-slate-800">Requires (qualifiers)</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {REQUIREMENTS.map((req) => (
              <label
                key={req}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
              >
                <input
                  type="checkbox"
                  checked={form.requires.includes(req)}
                  onChange={() => toggleRequire(req)}
                />
                {req}
              </label>
            ))}
          </div>

          <label className="mt-6 block text-sm font-medium text-slate-700">
            Included with (optional)
            <select
              value={form.includedWith}
              onChange={(e) =>
                setForm({
                  ...form,
                  includedWith: e.target.value === "" ? "" : (e.target.value as IncludedWith),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            >
              {INCLUDED_WITH_OPTIONS.map((o) => (
                <option key={o.label + String(o.value)} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="block min-w-0 flex-1 text-sm font-medium text-slate-700">
              Mutually exclusive group (optional)
              <input
                type="text"
                value={form.mutuallyExclusiveGroup}
                onChange={(e) => setForm({ ...form, mutuallyExclusiveGroup: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none ring-slate-400 focus:ring-2"
                placeholder="e.g. prime_video_access"
              />
            </label>
            <button
              type="button"
              onClick={onSuggestMutex}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Suggest from catalog
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Pricing and dates</h2>
          <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm leading-relaxed text-slate-800">
            <p className="font-semibold text-sky-950">How the public site uses these numbers</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-800">
              <li>
                <strong>Starting</strong> (first months): uses <strong>Effective monthly</strong> when that field is
                filled; otherwise uses <strong>Primary monthly</strong>.
              </li>
              <li>
                <strong>Ongoing</strong> (after promo): uses <strong>Ongoing after promo</strong> when filled;
                otherwise falls back to effective, then primary monthly.
              </li>
              <li>
                <strong>Annual total</strong>: if <strong>Intro length</strong> is set and ongoing differs from
                starting, the app blends (starting × intro months) + (ongoing × remaining months up to 12).
                Otherwise it uses starting × 12.
              </li>
              <li>
                There is no separate “annual price” field. If the website only lists <strong>$/year</strong>, put{" "}
                <strong>annual ÷ 12</strong> in Primary monthly (or in Effective if you use that for the promo leg)
                and explain it in <strong>Notes</strong>.
              </li>
            </ul>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Primary monthly (USD)
              <input
                type="text"
                inputMode="decimal"
                value={form.monthly}
                onChange={(e) => setForm({ ...form, monthly: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Baseline in dollars per month. Used for <strong>starting</strong> when effective monthly is empty.
                Annual billing can be entered as yearly price ÷ 12 (say so in Notes).
              </span>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Effective monthly (optional)
              <input
                type="text"
                inputMode="decimal"
                value={form.effectiveMonthly}
                onChange={(e) => setForm({ ...form, effectiveMonthly: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                placeholder="Leave empty to use primary monthly"
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                When filled, <strong>starting</strong> mode uses this instead of primary monthly (e.g. promo price or
                $0 bundled add-on).
              </span>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Ongoing monthly after promo (USD, optional)
              <input
                type="text"
                inputMode="decimal"
                value={form.standardMonthly}
                onChange={(e) => setForm({ ...form, standardMonthly: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Regular list price per month <strong>after</strong> the intro ends. Example: promo in primary/effective,
                then $10.99 here for ongoing.
              </span>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Intro length (months, optional)
              <input
                type="text"
                inputMode="numeric"
                value={form.introLengthMonths}
                onChange={(e) => setForm({ ...form, introLengthMonths: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                How many months the <strong>starting</strong> rate applies (annual math caps at 12). Leave empty if
                there is no intro vs ongoing split.
              </span>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Effective date (optional, YYYY-MM-DD)
              <input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Expires at (optional)
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Verified on
              <input
                type="date"
                value={form.lastChecked}
                onChange={(e) => setForm({ ...form, lastChecked: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Price status
              <select
                value={form.priceStatus}
                onChange={(e) => setForm({ ...form, priceStatus: e.target.value as PriceStatus })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
              >
                {PRICE_STATUSES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Links and notes</h2>
          <label className="mt-3 block text-sm font-medium text-slate-700">
            Source (short label)
            <input
              type="text"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Source URL (official pricing page)
            <input
              type="url"
              value={form.sourceUrl}
              onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Affiliate URL (optional)
            <input
              type="url"
              value={form.affiliateUrl}
              onChange={(e) => setForm({ ...form, affiliateUrl: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Notes
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            />
          </label>
        </section>

        {planKey === NEW_PLAN_VALUE && (
          <label className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <input type="checkbox" checked={confirmCreate} onChange={(e) => setConfirmCreate(e.target.checked)} />
            I am adding a new plan with this id. I have checked prices and coverage.
          </label>
        )}

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
          disabled={saving}
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : planKey === NEW_PLAN_VALUE ? "Create plan" : "Save changes"}
        </button>
      </form>

      <p className="mt-6 text-xs text-slate-500">
        Short URL: <code className="rounded bg-slate-200 px-1">/admin</code> redirects here.
      </p>
    </div>
  );
}
