"use client";

import { useState } from "react";
import type { Advisory, Crop, District, Season } from "@/lib/types";

interface Props {
  districts: District[];
  crops: Crop[];
}

const seasons: { value: Season; label: string }[] = [
  { value: "kharif", label: "Kharif (Monsoon, Jun–Oct)" },
  { value: "rabi", label: "Rabi (Winter, Nov–Mar)" },
  { value: "zaid", label: "Zaid (Summer, Apr–May)" },
];

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; advisory: Advisory; source: "ai" | "demo" };

export default function AdvisoryForm({ districts, crops }: Props) {
  const [districtId, setDistrictId] = useState("");
  const [cropId, setCropId] = useState("");
  const [season, setSeason] = useState<Season>("kharif");
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!districtId || !cropId) return;
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ districtId, cropId, season }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ status: "error", message: data.error || "Something went wrong." });
        return;
      }
      setState({ status: "done", advisory: data.advisory, source: data.source });
    } catch {
      setState({ status: "error", message: "Network error. Please try again." });
    }
  }

  const selectClass =
    "w-full rounded-xl border border-agri-200 bg-white px-3 py-2.5 text-foreground outline-none focus:border-agri-500 focus:ring-2 focus:ring-agri-200 dark:border-agri-800 dark:bg-black/40";

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-agri-100 bg-white p-5 dark:border-agri-900 dark:bg-black/40">
        <div>
          <label className="mb-1 block text-sm font-medium text-agri-900 dark:text-agri-100">
            Your location (district)
          </label>
          <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} className={selectClass}>
            <option value="">Select district…</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}, {d.state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-agri-900 dark:text-agri-100">
            Crop
          </label>
          <select value={cropId} onChange={(e) => setCropId(e.target.value)} className={selectClass}>
            <option value="">Select crop…</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-agri-900 dark:text-agri-100">
            Season
          </label>
          <div className="grid grid-cols-3 gap-2">
            {seasons.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSeason(s.value)}
                className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors ${
                  season === s.value
                    ? "border-agri-500 bg-agri-600 text-white"
                    : "border-agri-200 bg-white text-agri-800 hover:bg-agri-50 dark:border-agri-800 dark:bg-black/40 dark:text-agri-100"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!districtId || !cropId || state.status === "loading"}
          className="mt-1 rounded-xl bg-agri-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-agri-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.status === "loading" ? "Generating advisory…" : "Get my advisory"}
        </button>
      </form>

      {state.status === "loading" && (
        <div className="flex items-center gap-3 rounded-2xl border border-agri-100 bg-white p-5 dark:border-agri-900 dark:bg-black/40">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-agri-500 border-t-transparent" />
          <p className="text-sm text-agri-800 dark:text-agri-100">
            Combining weather, soil and crop data with AI… (usually under 10 seconds)
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          ⚠️ {state.message}
        </div>
      )}

      {state.status === "done" && <AdvisoryResult advisory={state.advisory} source={state.source} />}
    </div>
  );
}

function AdvisoryResult({ advisory, source }: { advisory: Advisory; source: "ai" | "demo" }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-agri-100 bg-white p-5 dark:border-agri-900 dark:bg-black/40">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-agri-900 dark:text-agri-100">🌾 Your advisory</h3>
          <span className="rounded-full bg-agri-50 px-2.5 py-1 text-xs font-medium text-agri-700 dark:bg-agri-900 dark:text-agri-200">
            {source === "ai" ? "AI-generated" : "Demo data"}
          </span>
        </div>
        <p className="leading-relaxed text-agri-800 dark:text-agri-200">{advisory.summary}</p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoItem label="💧 Irrigation" value={advisory.irrigation} />
          <InfoItem label="🌱 Fertilizer" value={advisory.fertilizer} />
          <InfoItem label="🌾 Sowing window" value={advisory.sowingWindow} />
          <InfoItem label="🚜 Harvest window" value={advisory.harvestWindow} />
        </dl>
      </div>

      <div className="rounded-2xl border border-soil-100 bg-soil-50 p-5 dark:border-soil-700/30 dark:bg-soil-700/10">
        <h4 className="mb-2 font-semibold text-soil-700 dark:text-soil-100">
          🛡️ Top risks to watch
        </h4>
        <ul className="list-disc space-y-1 pl-5 text-sm text-soil-700/90 dark:text-soil-100/90">
          {advisory.risks.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-agri-100 bg-agri-50 p-5 dark:border-agri-900 dark:bg-agri-900/20">
        <h4 className="mb-2 font-semibold text-agri-800 dark:text-agri-100">
          🌍 Regenerative farming tips
        </h4>
        <ul className="list-disc space-y-1 pl-5 text-sm text-agri-800/90 dark:text-agri-100/90">
          {advisory.regenerativeTips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-agri-100 bg-white p-5 dark:border-agri-900 dark:bg-black/40">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-agri-900 dark:text-agri-100">🟢 Soil health score</h4>
          <span className="text-2xl font-bold text-agri-600">{advisory.soilHealth.score}/100</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-agri-100 dark:bg-agri-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-lime-400 to-agri-600"
            style={{ width: `${advisory.soilHealth.score}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-agri-800/80 dark:text-agri-200/80">{advisory.soilHealth.note}</p>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-agri-50/60 p-3 dark:bg-agri-900/30">
      <dt className="text-xs font-semibold uppercase tracking-wide text-agri-700 dark:text-agri-300">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-agri-800 dark:text-agri-100">{value}</dd>
    </div>
  );
}
