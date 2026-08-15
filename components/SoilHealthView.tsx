"use client";

import { useState } from "react";
import type { District } from "@/lib/types";

interface Props {
  districts: District[];
}

function ndviToScore(ndvi: number): number {
  return Math.round(Math.min(100, Math.max(5, ndvi * 100)));
}

function healthColor(score: number): { bg: string; text: string; label: string; dot: string } {
  if (score >= 65)
    return { bg: "bg-lime-100 dark:bg-lime-950/60", text: "text-lime-800 dark:text-lime-200", label: "Healthy", dot: "bg-lime-500" };
  if (score >= 45)
    return { bg: "bg-yellow-100 dark:bg-yellow-950/60", text: "text-yellow-800 dark:text-yellow-200", label: "Moderate", dot: "bg-yellow-500" };
  return { bg: "bg-red-100 dark:bg-red-950/60", text: "text-red-800 dark:text-red-200", label: "At risk", dot: "bg-red-500" };
}

export default function SoilHealthView({ districts }: Props) {
  const [selectedId, setSelectedId] = useState<string>(districts[0]?.id ?? "");

  const selected = districts.find((d) => d.id === selectedId) ?? districts[0];
  if (!selected) return null;

  const score = ndviToScore(selected.ndvi);
  const c = healthColor(score);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-agri-100 bg-white p-5 dark:border-agri-900 dark:bg-black/40">
        <label className="mb-1 block text-sm font-medium text-agri-900 dark:text-agri-100">
          Choose a region
        </label>
        <select
          value={selected.id}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-xl border border-agri-200 bg-white px-3 py-2.5 outline-none focus:border-agri-500 focus:ring-2 focus:ring-agri-200 dark:border-agri-800 dark:bg-black/40"
        >
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}, {d.state}
            </option>
          ))}
        </select>
      </div>

      <div className={`rounded-2xl border p-6 ${c.bg}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-agri-900 dark:text-agri-100">
              {selected.name}, {selected.state}
            </h3>
            <p className="text-sm opacity-80">Vegetation & soil health indicator (NDVI-based)</p>
          </div>
          <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${c.text} bg-white/70 dark:bg-black/40`}>
            <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
            {c.label}
          </span>
        </div>

        <div className="mt-5">
          <div className="mb-1 flex justify-between text-sm font-medium">
            <span>Health score</span>
            <span className={c.text}>{score}/100</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className={`h-full rounded-full transition-all ${c.dot}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="Soil type" value={selected.soil.type} />
          <Metric label="Soil pH" value={String(selected.soil.ph)} />
          <Metric label="Organic carbon" value={`${selected.soil.organicCarbonPct}%`} />
          <Metric label="Avg temperature" value={`${selected.weather.tempC}°C`} />
          <Metric label="Annual rainfall" value={`${selected.weather.rainfallMm} mm`} />
          <Metric label="Humidity" value={`${selected.weather.humidityPct}%`} />
        </div>

        <p className="mt-4 text-sm leading-relaxed opacity-80">
          {score >= 65
            ? "This region shows good vegetation cover and soil condition — a strong base for cropping. Maintain soil organic matter with rotations and residue retention."
            : score >= 45
              ? "Vegetation cover is moderate. Consider green manuring, cover crops and soil testing to strengthen soil health before the next season."
              : "This region shows low vegetation cover and stressed soil. Prioritize soil rehabilitation — compost, mulching, and drought-tolerant varieties."}
        </p>
      </div>

      <div className="rounded-2xl border border-agri-100 bg-white p-5 dark:border-agri-900 dark:bg-black/40">
        <h4 className="mb-2 font-semibold text-agri-900 dark:text-agri-100">Regional overview</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {districts.map((d) => {
            const s = ndviToScore(d.ndvi);
            const dc = healthColor(s);
            return (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                  d.id === selected.id
                    ? "border-agri-500 bg-agri-50 dark:bg-agri-900/40"
                    : "border-agri-100 hover:bg-agri-50 dark:border-agri-900 dark:hover:bg-agri-900/20"
                }`}
              >
                <span className="font-medium text-agri-800 dark:text-agri-100">
                  {d.name}, {d.state}
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${dc.text}`}>
                  <span className={`h-2 w-2 rounded-full ${dc.dot}`} />
                  {s}/100
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/70 p-3 dark:bg-black/30">
      <dt className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
