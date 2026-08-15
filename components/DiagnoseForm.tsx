"use client";

import { useRef, useState } from "react";
import type { Diagnosis } from "@/lib/types";

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
      setState({ status: "error", message: "Please choose an image file (JPEG, PNG, WEBP or GIF)." });
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
          setState({ status: "error", message: data.error || "Something went wrong." });
          return;
        }
        setState({ status: "done", diagnosis: data.diagnosis });
      } catch {
        setState({ status: "error", message: "Network error. Please try again." });
      }
    };
    reader.onerror = () => setState({ status: "error", message: "Could not read the image file." });
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-agri-300 bg-white p-8 text-center transition-colors hover:border-agri-500 hover:bg-agri-50 dark:border-agri-700 dark:bg-black/40 dark:hover:bg-agri-900/20"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Crop preview" className="max-h-64 rounded-xl object-contain" />
        ) : (
          <>
            <span className="text-4xl">📷</span>
            <p className="font-medium text-agri-900 dark:text-agri-100">
              Tap to take or upload a photo of the affected leaf / plant
            </p>
            <p className="text-sm text-agri-800/70 dark:text-agri-200/70">
              JPEG, PNG, WEBP or GIF · max 6 MB · clear daylight photo works best
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

      <div>
        <label className="mb-1 block text-sm font-medium text-agri-900 dark:text-agri-100">
          Which crop is this? <span className="font-normal opacity-60">(optional — helps diagnosis)</span>
        </label>
        <input
          type="text"
          value={cropHint}
          onChange={(e) => setCropHint(e.target.value)}
          placeholder="e.g. Rice, Tomato, Cotton…"
          className="w-full rounded-xl border border-agri-200 bg-white px-3 py-2.5 outline-none focus:border-agri-500 focus:ring-2 focus:ring-agri-200 dark:border-agri-800 dark:bg-black/40"
        />
      </div>

      {state.status === "loading" && (
        <div className="flex items-center gap-3 rounded-2xl border border-agri-100 bg-white p-5 dark:border-agri-900 dark:bg-black/40">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-agri-500 border-t-transparent" />
          <p className="text-sm text-agri-800 dark:text-agri-100">
            Examining the photo with our AI crop doctor… (usually under 10 seconds)
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          ⚠️ {state.message}
        </div>
      )}

      {state.status === "done" && <DiagnosisResult diagnosis={state.diagnosis} onRetry={() => {
        setPreview(null);
        setState({ status: "idle" });
        if (fileRef.current) fileRef.current.value = "";
      }} />}
    </div>
  );
}

function DiagnosisResult({ diagnosis, onRetry }: { diagnosis: Diagnosis; onRetry: () => void }) {
  if (!diagnosis.identified) {
    return (
      <div className="rounded-2xl border border-soil-100 bg-soil-50 p-5 dark:border-soil-700/30 dark:bg-soil-700/10">
        <h3 className="font-semibold text-soil-700 dark:text-soil-100">🤔 Could not identify a disease</h3>
        <p className="mt-2 text-sm leading-relaxed text-soil-700/90 dark:text-soil-100/90">
          {diagnosis.message}
        </p>
        <button
          onClick={onRetry}
          className="mt-4 rounded-xl bg-soil-500 px-4 py-2 text-sm font-semibold text-white hover:bg-soil-700"
        >
          Try another photo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-agri-100 bg-white p-5 dark:border-agri-900 dark:bg-black/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-agri-900 dark:text-agri-100">
            🔬 {diagnosis.disease}
          </h3>
          {typeof diagnosis.confidence === "number" && (
            <span className="rounded-full bg-agri-50 px-2.5 py-1 text-xs font-semibold text-agri-700 dark:bg-agri-900 dark:text-agri-200">
              {diagnosis.confidence}% confidence
            </span>
          )}
        </div>
        {diagnosis.crop && (
          <p className="mt-1 text-sm text-agri-800/70 dark:text-agri-200/70">Affects: {diagnosis.crop}</p>
        )}
        {diagnosis.symptoms && (
          <p className="mt-3 text-sm leading-relaxed text-agri-800 dark:text-agri-100">
            <span className="font-semibold">Symptoms: </span>
            {diagnosis.symptoms}
          </p>
        )}
      </div>

      {diagnosis.treatment && (
        <div className="rounded-2xl border border-agri-100 bg-agri-50 p-5 dark:border-agri-900 dark:bg-agri-900/20">
          <h4 className="mb-1.5 font-semibold text-agri-800 dark:text-agri-100">💊 Treatment</h4>
          <p className="text-sm leading-relaxed text-agri-800/90 dark:text-agri-100/90">{diagnosis.treatment}</p>
        </div>
      )}

      {diagnosis.prevention && (
        <div className="rounded-2xl border border-soil-100 bg-soil-50 p-5 dark:border-soil-700/30 dark:bg-soil-700/10">
          <h4 className="mb-1.5 font-semibold text-soil-700 dark:text-soil-100">🛡️ Prevention tip</h4>
          <p className="text-sm leading-relaxed text-soil-700/90 dark:text-soil-100/90">{diagnosis.prevention}</p>
        </div>
      )}

      <p className="text-center text-xs text-agri-800/60 dark:text-agri-200/60">
        AI diagnosis is a first check — confirm with your local extension officer before treatment.
      </p>
    </div>
  );
}
