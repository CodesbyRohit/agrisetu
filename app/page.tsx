import Link from "next/link";
import {
  ArrowRightIcon,
  CameraIcon,
  MapPinIcon,
  SproutIcon,
  WheatIcon,
} from "@/components/Icons";

const steps = [
  { n: "1", title: "Tell us your district", desc: "We use its soil and weather data" },
  { n: "2", title: "Pick your crop", desc: "Rice, wheat, cotton, tomato and more" },
  { n: "3", title: "Read your advisory", desc: "Water, fertilizer and timing — in plain words" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-3xl bg-leaf-700 px-6 py-10 text-white sm:px-10 sm:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          aria-hidden
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 22px, rgba(255,255,255,0.7) 22px 23px)",
          }}
        />
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
          <SproutIcon className="h-3.5 w-3.5" />
          Built for small and marginal farmers
        </p>
        <h1 className="font-display max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
          Get farm advice for your crop and soil.
        </h1>
        <p className="mt-3 max-w-lg text-leaf-100">
          Tell us where you farm and what you grow, and AgriSetu gives you plain-language
          advice on water, fertilizer, and timing — plus a photo check when your crop looks sick.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/advisory"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-semibold text-leaf-800 transition-transform hover:scale-[1.02] active:scale-[0.99]"
          >
            Get my advisory
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
          <Link
            href="/diagnose"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-white/20"
          >
            <CameraIcon className="h-5 w-5" />
            Check my crop photo
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/advisory"
          className="group flex items-start gap-4 rounded-2xl border border-soil-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-leaf-600">
            <MapPinIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold text-ink">Advisory for your field</span>
            <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
              Watering, fertilizer, sowing and harvest guidance for your crop and season.
            </span>
          </span>
        </Link>

        <Link
          href="/diagnose"
          className="group flex items-start gap-4 rounded-2xl border border-soil-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <CameraIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold text-ink">Crop photo check</span>
            <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
              Upload a photo of a sick leaf or plant and get a likely disease name plus treatment steps.
            </span>
          </span>
        </Link>

        <Link
          href="/soil-health"
          className="group flex items-start gap-4 rounded-2xl border border-soil-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md sm:col-span-2"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
            <WheatIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold text-ink">Your region’s soil health</span>
            <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
              See a simple green–yellow–red health score for your region’s vegetation and soil.
            </span>
          </span>
        </Link>
      </section>

      <section className="rounded-2xl border border-soil-100 bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-ink">How it works</h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-sm font-bold text-leaf-700">
                {s.n}
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{s.title}</span>
                <span className="block text-sm text-ink-soft">{s.desc}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
