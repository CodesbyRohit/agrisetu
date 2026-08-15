"use client";

import { useState } from "react";
import type { Advisory, Crop, District, Season } from "@/lib/types";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  DropletIcon,
  LeafIcon,
  MapPinIcon,
  SearchIcon,
  ShieldIcon,
  SproutIcon,
  SunIcon,
  WheatIcon,
} from "@/components/Icons";
import SoilGauge from "@/components/SoilGauge";

interface Props {
  districts: District[];
  crops: Crop[];
}

const seasons: { value: Season; label: string; short: string; months: string }[] = [
  { value: "kharif", label: "Kharif (Monsoon)", short: "Kharif", months: "Jun–Oct" },
  { value: "rabi", label: "Rabi (Winter)", short: "Rabi", months: "Nov–Mar" },
  { value: "zaid", label: "Zaid (Summer)", short: "Zaid", months: "Apr–May" },
];

const CROP_ICONS: Record<string, typeof WheatIcon> = {
  Cereal: WheatIcon,
  Millet: WheatIcon,
  "Cash Crop": LeafIcon,
  Oilseed: SunIcon,
  Pulse: SproutIcon,
  Vegetable: LeafIcon,
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; advisory: Advisory; source: "ai" | "demo" };

export default function AdvisoryForm({ districts, crops }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [districtId, setDistrictId] = useState("");
  const [cropId, setCropId] = useState("");
  const [cropSearch, setCropSearch] = useState("");
  const [season, setSeason] = useState<Season>("kharif");
  const [state, setState] = useState<State>({ status: "idle" });

  const district = districts.find((d) => d.id === districtId);
  const crop = crops.find((c) => c.id === cropId);

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
        setState({
          status: "error",
          message: data.error || "We couldn't prepare your advisory right now. Please try again.",
        });
        return;
      }
      setState({ status: "done", advisory: data.advisory, source: data.source });
    } catch {
      setState({
        status: "error",
        message: "No connection to the advisory service. Check your network and try again.",
      });
    }
  }

  const filteredCrops = cropSearch.trim()
    ? crops.filter((c) => c.name.toLowerCase().includes(cropSearch.trim().toLowerCase()))
    : crops;

  const stepLabel = step === 1 ? "Where do you farm?" : step === 2 ? "What do you grow?" : "Which season is it?";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="rounded-3xl border border-soil-100 bg-white p-5 shadow-sm sm:p-6">
        {/* Progress */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">{stepLabel}</p>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`h-2 rounded-full transition-all ${n === step ? "w-6 bg-leaf-600" : "w-2 bg-soil-200"}`}
              />
            ))}
            <span className="ml-2 text-xs font-medium text-ink-soft">Step {step} of 3</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <label htmlFor="district" className="flex items-center gap-2 text-base font-semibold text-ink">
                <MapPinIcon className="h-5 w-5 text-leaf-600" />
                Choose your district
              </label>
              <select
                id="district"
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full appearance-none rounded-2xl border-2 border-soil-200 bg-paper px-4 py-4 text-lg font-medium text-ink outline-none transition-colors focus:border-leaf-500"
              >
                <option value="">Tap to choose…</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}, {d.state}
                  </option>
                ))}
              </select>
              {district && (
                <p className="rounded-xl bg-leaf-50 px-3 py-2 text-sm text-leaf-800">
                  {district.name}, {district.state} — {district.soil.type} soil · about{" "}
                  {district.weather.tempC}°C and {district.weather.rainfallMm} mm rain this season
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-base font-semibold text-ink">
                <LeafIcon className="h-5 w-5 text-leaf-600" />
                Tap your crop
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-soft" />
                <input
                  type="search"
                  value={cropSearch}
                  onChange={(e) => setCropSearch(e.target.value)}
                  placeholder="Search crops…"
                  className="w-full rounded-2xl border-2 border-soil-200 bg-paper py-3 pl-10 pr-4 text-base outline-none transition-colors focus:border-leaf-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {filteredCrops.map((c) => {
                  const Icon = CROP_ICONS[c.type] ?? LeafIcon;
                  const selected = cropId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCropId(c.id)}
                      className={`relative flex items-center gap-3 rounded-2xl border-2 px-3.5 py-3.5 text-left transition-all ${
                        selected
                          ? "border-leaf-600 bg-leaf-50"
                          : "border-soil-200 bg-white hover:border-leaf-300 hover:bg-leaf-50/50"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          selected ? "bg-leaf-600 text-white" : "bg-leaf-100 text-leaf-700"
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <span className="text-sm font-semibold leading-tight text-ink">{c.name}</span>
                      {selected && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-leaf-600 text-white">
                          <CheckIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
                {filteredCrops.length === 0 && (
                  <p className="col-span-2 rounded-xl bg-soil-50 px-3 py-3 text-sm text-ink-soft">
                    No crop matches “{cropSearch}”. Try another word.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-base font-semibold text-ink">
                <CalendarIcon className="h-5 w-5 text-leaf-600" />
                Which season is it?
              </label>
              <div className="grid gap-2.5">
                {seasons.map((s) => {
                  const selected = season === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSeason(s.value)}
                      className={`flex items-center justify-between rounded-2xl border-2 px-4 py-4 text-left transition-all ${
                        selected
                          ? "border-leaf-600 bg-leaf-50"
                          : "border-soil-200 bg-white hover:border-leaf-300 hover:bg-leaf-50/50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                            selected ? "bg-leaf-600 text-white" : "bg-gold-100 text-gold-700"
                          }`}
                        >
                          <SunIcon className="h-4.5 w-4.5" />
                        </span>
                        <span>
                          <span className="block text-base font-semibold text-ink">{s.short}</span>
                          <span className="block text-sm text-ink-soft">{s.months}</span>
                        </span>
                      </span>
                      {selected && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf-600 text-white">
                          <CheckIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-ink-soft">
                {district ? `${district.name}, ${district.state} · ` : ""}
                {crop ? crop.name : "your crop"} — we’ll use local soil and weather for this season.
              </p>
            </div>
          )}

          {/* Bottom actions */}
          <div className="mt-1 flex items-center gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="inline-flex h-14 items-center gap-1.5 rounded-2xl border-2 border-soil-200 bg-white px-4 font-semibold text-ink transition-colors hover:border-soil-300"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                Back
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                disabled={step === 1 ? !districtId : !cropId}
                className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-leaf-600 px-4 text-base font-semibold text-white transition-colors hover:bg-leaf-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={state.status === "loading"}
                className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-leaf-600 px-4 text-base font-semibold text-white transition-colors hover:bg-leaf-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state.status === "loading" ? "Getting your advisory…" : "Get my advisory"}
              </button>
            )}
          </div>
        </form>
      </div>

      {state.status === "loading" && (
        <div className="flex flex-col gap-3 rounded-3xl border border-soil-100 bg-white p-5">
          <p className="text-sm font-medium text-ink">Checking your field data — this takes a few seconds…</p>
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-soil-100" />
          <div className="h-4 w-full animate-pulse rounded-full bg-soil-100" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-soil-100" />
        </div>
      )}

      {state.status === "error" && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Something went wrong.</p>
            <p className="mt-0.5 text-sm">{state.message}</p>
            <button
              onClick={() => setState({ status: "idle" })}
              className="mt-2 rounded-xl border-2 border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {state.status === "done" && (
        <FieldBulletin
          advisory={state.advisory}
          source={state.source}
          district={district}
          crop={crop}
          season={season}
        />
      )}
    </div>
  );
}

function FieldBulletin({
  advisory,
  source,
  district,
  crop,
  season,
}: {
  advisory: Advisory;
  source: "ai" | "demo";
  district?: District;
  crop?: Crop;
  season: Season;
}) {
  const seasonLabel = seasons.find((s) => s.value === season)?.short ?? season;
  const context = [district ? `${district.name}, ${district.state}` : null, crop?.name, seasonLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="overflow-hidden rounded-3xl border border-soil-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-soil-100 bg-paper px-5 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-soil-600">Field Bulletin</p>
        <span className="rounded-full bg-leaf-100 px-2.5 py-1 text-xs font-semibold text-leaf-700">
          {source === "ai" ? "AI checked" : "Demo data"}
        </span>
      </div>

      <div className="flex items-center gap-2 px-5 pt-4 text-sm font-medium text-ink">
        <MapPinIcon className="h-4 w-4 shrink-0 text-leaf-600" />
        <span className="truncate">{context}</span>
      </div>

      <div className="px-5 pt-3">
        <p className="rounded-2xl bg-leaf-50 px-4 py-3.5 text-[15px] leading-relaxed text-leaf-900">
          {advisory.summary}
        </p>
      </div>

      <div className="flex flex-col gap-4 px-5 py-5">
        <BulletinSection
          icon={<DropletIcon className="h-5 w-5" />}
          tint="bg-sky-100 text-sky-700"
          title="Water & irrigation"
          body={advisory.irrigation}
        />
        <BulletinSection
          icon={<LeafIcon className="h-5 w-5" />}
          tint="bg-leaf-100 text-leaf-700"
          title="Fertilizer"
          body={advisory.fertilizer}
        />
        <BulletinSection
          icon={<CalendarIcon className="h-5 w-5" />}
          tint="bg-gold-100 text-gold-700"
          title="Sowing window"
          body={advisory.sowingWindow}
        />
        <BulletinSection
          icon={<CalendarIcon className="h-5 w-5" />}
          tint="bg-gold-100 text-gold-700"
          title="Harvest window"
          body={advisory.harvestWindow}
        />
        <BulletinSection
          icon={<ShieldIcon className="h-5 w-5" />}
          tint="bg-red-100 text-red-700"
          title="Top risks to watch"
          bullets={advisory.risks}
        />
        <BulletinSection
          icon={<SproutIcon className="h-5 w-5" />}
          tint="bg-leaf-100 text-leaf-700"
          title="Regenerative tips"
          bullets={advisory.regenerativeTips}
        />
      </div>

      <div className="border-t border-soil-100 bg-paper px-5 py-5">
        <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-soil-600">
          Soil health
        </p>
        <SoilGauge score={advisory.soilHealth.score} className="mx-auto mt-2 h-28 w-56" />
        <p className="mx-auto mt-2 max-w-sm text-center text-sm text-ink-soft">
          {advisory.soilHealth.note}
        </p>
      </div>
    </div>
  );
}

function BulletinSection({
  icon,
  tint,
  title,
  body,
  bullets,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  body?: string;
  bullets?: string[];
}) {
  return (
    <div className="flex items-start gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">{title}</h4>
        {body && <p className="mt-1 text-[15px] leading-relaxed text-ink">{body}</p>}
        {bullets && (
          <ul className="mt-1 space-y-1">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-[15px] leading-relaxed text-ink">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-500" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
