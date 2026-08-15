"use client";

import { useState } from "react";
import type { District } from "@/lib/types";
import { MapPinIcon } from "@/components/Icons";
import SoilGauge from "@/components/SoilGauge";

interface Props {
  districts: District[];
}

function ndviToScore(ndvi: number): number {
  return Math.round(Math.min(100, Math.max(5, ndvi * 100)));
}

function healthColor(score: number): { badge: string; text: string; dot: string; note: string } {
  if (score >= 65)
    return {
      badge: "bg-leaf-50 text-leaf-800",
      text: "text-leaf-800",
      dot: "bg-leaf-500",
      note: "This region shows good vegetation cover and soil condition — a strong base for cropping. Maintain soil organic matter with rotations and residue retention.",
    };
  if (score >= 45)
    return {
      badge: "bg-gold-100 text-gold-800",
      text: "text-gold-800",
      dot: "bg-gold-500",
      note: "Vegetation cover is moderate. Consider green manuring, cover crops and soil testing to strengthen soil health before the next season.",
    };
  return {
    badge: "bg-red-100 text-red-800",
    text: "text-red-800",
    dot: "bg-red-500",
    note: "This region shows low vegetation cover and stressed soil. Prioritize soil rehabilitation — compost, mulching, and drought-tolerant varieties.",
  };
}

export default function SoilHealthView({ districts }: Props) {
  const [selectedId, setSelectedId] = useState<string>(districts[0]?.id ?? "");

  const selected = districts.find((d) => d.id === selectedId) ?? districts[0];
  if (!selected) return null;

  const score = ndviToScore(selected.ndvi);
  const c = healthColor(score);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="rounded-3xl border border-soil-100 bg-white p-5">
        <label htmlFor="region" className="flex items-center gap-2 text-sm font-semibold text-ink">
          <MapPinIcon className="h-4.5 w-4.5 text-leaf-600" />
          Choose a region
        </label>
        <select
          id="region"
          value={selected.id}
          onChange={(e) => setSelectedId(e.target.value)}
          className="mt-2 w-full appearance-none rounded-2xl border-2 border-soil-200 bg-paper px-4 py-3.5 text-base font-medium text-ink outline-none transition-colors focus:border-leaf-500"
        >
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}, {d.state}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-3xl border border-soil-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-ink">
              {selected.name}, {selected.state}
            </h3>
            <p className="text-sm text-ink-soft">Vegetation & soil health (NDVI-based)</p>
          </div>
          <span className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${c.badge}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
            {score >= 65 ? "Healthy" : score >= 45 ? "Moderate" : "At risk"}
          </span>
        </div>

        <SoilGauge score={score} className="mx-auto mt-3 h-28 w-56" />

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <Metric label="Soil type" value={selected.soil.type} />
          <Metric label="Soil pH" value={String(selected.soil.ph)} />
          <Metric label="Organic carbon" value={`${selected.soil.organicCarbonPct}%`} />
          <Metric label="Avg temperature" value={`${selected.weather.tempC}°C`} />
          <Metric label="Annual rainfall" value={`${selected.weather.rainfallMm} mm`} />
          <Metric label="Humidity" value={`${selected.weather.humidityPct}%`} />
        </div>

        <p className="mt-4 rounded-2xl bg-paper px-4 py-3 text-sm leading-relaxed text-ink">{c.note}</p>
      </div>

      <div className="rounded-3xl border border-soil-100 bg-white p-5">
        <h4 className="mb-2 font-semibold text-ink">All regions</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {districts.map((d) => {
            const s = ndviToScore(d.ndvi);
            const dc = healthColor(s);
            return (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`flex items-center justify-between rounded-2xl border-2 px-3.5 py-3 text-left transition-colors ${
                  d.id === selected.id
                    ? "border-leaf-500 bg-leaf-50"
                    : "border-soil-100 bg-white hover:bg-leaf-50/50"
                }`}
              >
                <span className="text-sm font-semibold text-ink">
                  {d.name}, {d.state}
                </span>
                <span className={`flex items-center gap-1.5 text-sm font-semibold ${dc.text}`}>
                  <span className={`h-2 w-2 rounded-full ${dc.dot}`} />
                  {s}
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
    <div className="rounded-2xl bg-paper px-3.5 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
