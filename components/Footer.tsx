import Link from "next/link";
import { SproutIcon } from "@/components/Icons";

export default function Footer() {
  return (
    <footer className="border-t border-soil-100 py-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 text-center sm:px-6">
        <SproutIcon className="h-5 w-5 text-leaf-500" />
        <p className="text-sm text-ink-soft">
          AgriSetu — farm advice in plain language · Built with AI — Code for Communities · BRICS AgriN
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-soft/80">
          <Link href="/soil-health" className="transition-colors hover:text-leaf-700">
            Soil health
          </Link>
          <Link href="/schema" className="transition-colors hover:text-leaf-700">
            Data schema
          </Link>
          <span>Demo build: weather and soil layers use sample data.</span>
        </div>
      </div>
    </footer>
  );
}
