import Link from "next/link";
import { SproutIcon } from "@/components/Icons";

const links = [
  { href: "/", label: "Home" },
  { href: "/advisory", label: "Get advice" },
  { href: "/diagnose", label: "Crop doctor" },
  { href: "/soil-health", label: "Soil health" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-soil-100 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-600 text-white">
            <SproutIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            AgriSetu
          </span>
        </Link>
        <nav className="flex gap-1 overflow-x-auto text-sm font-medium sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-ink-soft transition-colors hover:bg-leaf-50 hover:text-leaf-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
