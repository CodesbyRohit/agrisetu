"use client";

import { useEffect, useState } from "react";
import type { District, DataProvenance, SoilInfo, WeatherInfo } from "@/lib/types";
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

/** Small, quiet provenance badges — transparency, not a warning. */
function SourceBadge({
  live,
  liveLabel,
  estimateLabel,
  liveTone,
  estimateTone,
}: {
  live: boolean;
  liveLabel: string;
  estimateLabel: string;
  liveTone: string;
  estimateTone: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        live ? liveTone : estimateTone
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-leaf-500" : "bg-gold-500"}`} />
      {live ? liveLabel : estimateLabel}
    </span>
  );
}

export default function SoilHealthView({ districts }: Props) {
  const [selectedId, setSelectedId] = useState<string>(districts[0]?.id ?? "");
  const [live, setLive] = useState<
    { weather: WeatherInfo; soil: SoilInfo; provenance: DataProvenance } | null
  >(null);
  const [liveLoading, setLiveLoading] = useState(false);

  // Fetch live weather/soil for the selected region so the page labels are honest.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!selectedId) return;
      setLiveLoading(true);
      try {
        const res = await fetch(`/api/soil?districtId=${encodeURIComponent(selectedId)}`);
        const data = await res.json();
        if (!cancelled && !data.error) setLive(data);
      } catch {
        // Keep static values; labels fall back to estimate below.
      } finally {
        if (!cancelled) setLiveLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selected = districts.find((d) => d.id === selectedId) ?? districts[0];
  if (!selected) return null;

  const weather = live?.weather ?? selected.weather;
  const soil = live?.soil ?? selected.soil;
  const provenance = live?.provenance ?? { weather: "estimated", soil: "reference" };

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
            <h2 className="font-display text-xl font-semibold text-ink">
              {selected.name}, {selected.state}
            </h2>
            <p className="text-sm text-ink-soft">Vegetation & soil health (NDVI-based)</p>
          </div>
          <span className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${c.badge}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
            {score >= 65 ? "Healthy" : score >= 45 ? "Moderate" : "At risk"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {liveLoading && (
            <span className="rounded-full bg-soil-100 px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
              Checking live data…
            </span>
          )}
          {!liveLoading && (
            <>
              <SourceBadge
                live={provenance.weather === "live"}
                liveLabel="Live weather"
                estimateLabel="Estimated weather"
                liveTone="bg-sky-100 text-sky-800"
                estimateTone="bg-gold-100 text-gold-800"
              />
              <SourceBadge
                live={provenance.soil === "live"}
                liveLabel="Live soil data"
                estimateLabel={provenance.soil === "regional" ? "Regional estimate" : "Reference estimate"}
                liveTone="bg-leaf-50 text-leaf-800"
                estimateTone="bg-gold-100 text-gold-800"
              />
            </>
          )}
        </div>

        <SoilGauge score={score} className="mx-auto mt-3 h-28 w-56" />

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <Metric label="Soil type" value={soil.type} />
          <Metric label="Soil pH" value={String(soil.ph)} />
          <Metric label="Organic carbon" value={`${soil.organicCarbonPct}%`} />
          <Metric label="Avg temperature" value={`${weather.tempC}°C`} />
          <Metric label="Annual rainfall" value={`${weather.rainfallMm} mm`} />
          <Metric label="Humidity" value={`${weather.humidityPct}%`} />
        </div>

        <p className="mt-4 rounded-2xl bg-paper px-4 py-3 text-sm leading-relaxed text-ink">{c.note}</p>
      </div>

      <div className="rounded-3xl border border-soil-100 bg-white p-5">
        <h3 className="mb-2 font-semibold text-ink">All regions</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {districts.map((d) => {
            const s = ndviToScore(d.ndvi);
            const dc = healthColor(s);
            return (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`flex min-h-12 items-center justify-between rounded-2xl border-2 px-4 text-left transition-colors ${
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
    <dl className="rounded-2xl bg-paper px-3.5 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
    </dl>
  );
}
