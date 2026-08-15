import Link from "next/link";

const features = [
  {
    href: "/advisory",
    emoji: "🌦️",
    title: "Get Agro-Advisory",
    desc: "Select your location and crop to receive a plain-language advisory with irrigation, fertilizer, sowing and harvest guidance.",
  },
  {
    href: "/diagnose",
    emoji: "🔬",
    title: "Crop Doctor",
    desc: "Upload a photo of a sick crop or leaf and get an instant disease diagnosis with treatment and prevention tips.",
  },
  {
    href: "/soil-health",
    emoji: "🟢",
    title: "Soil & Vegetation Health",
    desc: "See a simple health indicator for your region — a color-coded view of vegetation and soil condition.",
  },
  {
    href: "/schema",
    emoji: "🔗",
    title: "Interoperable Data Schema",
    desc: "The standardized agro-advisory record format designed for cross-border sharing across BRICS AgriN nodes.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl bg-gradient-to-br from-agri-600 to-agri-800 p-8 text-white sm:p-12">
        <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          BRICS AgriN · Digital Public Good
        </p>
        <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          Data-driven farming advice, in the palm of every farmer's hand.
        </h1>
        <p className="mt-4 max-w-xl text-agri-100">
          AgriSetu combines weather, soil and crop data with AI to give small and
          marginal farmers localized, plain-language guidance — and shares a
          common data format so farming intelligence can flow across borders.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/advisory"
            className="rounded-full bg-white px-5 py-2.5 font-semibold text-agri-800 transition-transform hover:scale-105"
          >
            Get Advice →
          </Link>
          <Link
            href="/diagnose"
            className="rounded-full border border-white/40 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-white/10"
          >
            Diagnose a Crop
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-agri-900 dark:text-agri-100">
          What can you do with AgriSetu?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group rounded-2xl border border-agri-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-agri-300 hover:shadow-lg dark:border-agri-900 dark:bg-black/40 dark:hover:border-agri-700"
            >
              <span className="text-2xl">{f.emoji}</span>
              <h3 className="mt-2 font-semibold text-agri-800 group-hover:text-agri-600 dark:text-agri-100">
                {f.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-agri-800/70 dark:text-agri-200/70">
                {f.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
