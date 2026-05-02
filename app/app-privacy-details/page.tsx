import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "App Privacy Details | StreamWise",
  description: "Data collection and usage details for App Store privacy labels.",
};

type PrivacyRow = {
  dataType: string;
  collected: "Yes" | "No";
  linkedToUser: "Yes" | "No";
  tracking: "Yes" | "No";
  purposes: string;
  notes: string;
};

const rows: PrivacyRow[] = [
  {
    dataType: "Contact Info (Email Address)",
    collected: "Yes",
    linkedToUser: "Yes",
    tracking: "No",
    purposes: "App functionality, Account management",
    notes:
      "Collected only if user uses optional magic-link sign-in. Processed via Supabase auth.",
  },
  {
    dataType: "User Content (Preferences / selected services)",
    collected: "Yes",
    linkedToUser: "Yes",
    tracking: "No",
    purposes: "App functionality, Product personalization",
    notes: "Stored with user profile to persist selected services and provider toggles.",
  },
  {
    dataType: "Usage Data (recommendation views, outbound clicks)",
    collected: "Yes",
    linkedToUser: "No",
    tracking: "No",
    purposes: "Analytics, Product improvement",
    notes:
      "Used to measure recommendation-to-click conversion and improve ranking clarity.",
  },
  {
    dataType: "Diagnostics (basic request metadata)",
    collected: "Yes",
    linkedToUser: "No",
    tracking: "No",
    purposes: "App functionality, Fraud prevention, Security",
    notes:
      "Includes timestamp, referrer, and user-agent style metadata for reliability and abuse prevention.",
  },
  {
    dataType: "Tracking Across Apps/Websites",
    collected: "No",
    linkedToUser: "No",
    tracking: "No",
    purposes: "Not used",
    notes:
      "StreamWise does not currently use third-party cross-app tracking identifiers for advertising.",
  },
];

export default function AppPrivacyDetailsPage() {
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "support@streamwise.app";

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold tracking-tight">App Privacy Details</h1>
      <p className="mt-3 max-w-3xl text-sm text-slate-600">
        This page maps StreamWise&apos;s current data behavior to common Apple App
        Store privacy-label categories. Use this as a release checklist before
        submitting a new build.
      </p>
      <p className="mt-2 text-sm text-slate-500">Last reviewed: May 2, 2026</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Data Type</th>
              <th className="px-4 py-3 font-semibold">Collected</th>
              <th className="px-4 py-3 font-semibold">Linked to User</th>
              <th className="px-4 py-3 font-semibold">Tracking</th>
              <th className="px-4 py-3 font-semibold">Purposes</th>
              <th className="px-4 py-3 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.dataType} className="border-t border-slate-200 align-top">
                <td className="px-4 py-3 font-medium text-slate-900">{row.dataType}</td>
                <td className="px-4 py-3">{row.collected}</td>
                <td className="px-4 py-3">{row.linkedToUser}</td>
                <td className="px-4 py-3">{row.tracking}</td>
                <td className="px-4 py-3">{row.purposes}</td>
                <td className="px-4 py-3 text-slate-600">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-8 space-y-3 text-sm text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">Submission notes</h2>
        <p>
          Privacy labels must match your actual production configuration. If you
          enable additional analytics SDKs, ad tooling, or identifiers, update this
          page and your App Store privacy answers before shipping.
        </p>
        <p>
          For questions or deletion requests, contact{" "}
          <a className="underline underline-offset-2" href={`mailto:${supportEmail}`}>
            {supportEmail}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
