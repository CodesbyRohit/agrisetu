"use client";

import { useRef, useState } from "react";
import type { Diagnosis } from "@/lib/types";
import {
  AlertTriangleIcon,
  CameraIcon,
  CheckIcon,
  LeafIcon,
  RefreshIcon,
  ShieldIcon,
} from "@/components/Icons";

const CROP_CHIPS = ["Rice", "Wheat", "Tomato", "Cotton", "Maize", "Potato"];

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; diagnosis: Diagnosis };

export default function DiagnoseForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [cropHint, setCropHint] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setState({
        status: "error",
        message: "That file isn’t a photo. Please choose a JPEG, PNG or WEBP image.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      const [meta, base64] = result.split(",");
      setPreview(result);
      setState({ status: "loading" });
      try {
        const res = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: meta.match(/data:(.*?);/)?.[1] || file.type,
            cropHint: cropHint || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setState({
            status: "error",
            message: data.error || "We couldn't check this photo. Please try again in a moment.",
          });
          return;
        }
        setState({ status: "done", diagnosis: data.diagnosis });
      } catch {
        setState({
          status: "error",
          message: "No connection to the crop doctor. Check your network and try again.",
        });
      }
    };
    reader.onerror = () =>
      setState({
        status: "error",
        message: "We couldn't read that photo. Please try another one.",
      });
    reader.readAsDataURL(file);
  }

  function reset() {
    setPreview(null);
    setState({ status: "idle" });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {/* Camera tile */}
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-leaf-300 bg-white px-6 py-10 text-center transition-colors hover:border-leaf-500 hover:bg-leaf-50/50"
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Crop preview" className="max-h-64 rounded-2xl object-contain" />
        ) : (
          <>
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf-100 text-leaf-700">
              <CameraIcon className="h-8 w-8" />
            </span>
            <p className="text-lg font-semibold text-ink">Take or upload a photo of the sick leaf or plant</p>
            <p className="max-w-sm text-sm text-ink-soft">
              A clear photo in daylight works best · under 6 MB
            </p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {/* Crop hint chips */}
      <div>
        <label htmlFor="crop-hint" className="mb-2 block text-sm font-semibold text-ink">
          Which crop is this? <span className="font-normal text-ink-soft">(optional — helps the check)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CROP_CHIPS.map((c) => {
            const selected = cropHint === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCropHint(selected ? "" : c)}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 text-sm font-semibold transition-colors ${
                  selected
                    ? "border-leaf-600 bg-leaf-50 text-leaf-800"
                    : "border-soil-200 bg-white text-ink hover:border-leaf-300"
                }`}
              >
                {selected && <CheckIcon className="h-3.5 w-3.5" />}
                {c}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={cropHint}
          onChange={(e) => setCropHint(e.target.value)}
          placeholder="Or type another crop…"
          id="crop-hint"
          className="mt-2.5 min-h-11 w-full rounded-2xl border-2 border-soil-200 bg-white px-4 outline-none transition-colors focus:border-leaf-500"
        />
      </div>

      {state.status === "loading" && (
        <div className="flex flex-col gap-3 rounded-3xl border border-soil-100 bg-white p-5">
          <p className="text-sm font-medium text-ink">Examining your photo — this takes a few seconds…</p>
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-soil-100" />
          <div className="h-4 w-full animate-pulse rounded-full bg-soil-100" />
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-soil-100" />
        </div>
      )}

      {state.status === "error" && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">The photo didn’t upload.</p>
            <p className="mt-0.5 text-sm">{state.message}</p>
            <button
              onClick={reset}
              className="mt-2 rounded-xl border-2 border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {state.status === "done" && <DiagnosisReport diagnosis={state.diagnosis} onRetry={reset} />}
    </div>
  );
}

function DiagnosisReport({ diagnosis, onRetry }: { diagnosis: Diagnosis; onRetry: () => void }) {
  if (!diagnosis.identified) {
    return (
      <div className="flex items-start gap-3 rounded-3xl border border-soil-200 bg-soil-50 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soil-200 text-soil-700">
          <AlertTriangleIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-soil-800">No clear match from this photo</h3>
          <p className="mt-1 text-sm leading-relaxed text-soil-700">{diagnosis.message}</p>
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-soil-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-soil-700"
          >
            <RefreshIcon className="h-4 w-4" />
            Try another photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-3xl border border-soil-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-soil-100 bg-paper px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-soil-600">Crop Report</p>
          {typeof diagnosis.confidence === "number" && (
            <span className="rounded-full bg-leaf-100 px-2.5 py-1 text-xs font-semibold text-leaf-700">
              {diagnosis.confidence}% confidence
            </span>
          )}
        </div>

        <div className="px-5 py-4">
          <h3 className="font-display text-2xl font-semibold text-ink">{diagnosis.disease}</h3>
          {diagnosis.crop && <p className="mt-1 text-sm text-ink-soft">Affects: {diagnosis.crop}</p>}
          {diagnosis.symptoms && (
            <div className="mt-4 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                <AlertTriangleIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">What you may see</h4>
                <p className="mt-1 text-[15px] leading-relaxed text-ink">{diagnosis.symptoms}</p>
              </div>
            </div>
          )}
        </div>

        {diagnosis.treatment && (
          <div className="border-t border-soil-100 px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf-100 text-leaf-700">
                <LeafIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">Treatment</h4>
                <p className="mt-1 text-[15px] leading-relaxed text-ink">{diagnosis.treatment}</p>
              </div>
            </div>
          </div>
        )}

        {diagnosis.prevention && (
          <div className="border-t border-soil-100 bg-paper px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <ShieldIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">To stop it spreading</h4>
                <p className="mt-1 text-[15px] leading-relaxed text-ink">{diagnosis.prevention}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs leading-relaxed text-ink-soft">
        This is a first check from a photo, not a lab test — confirm with your local
        extension officer before applying any treatment.
      </p>
    </div>
  );
}
