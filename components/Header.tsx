import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/advisory", label: "Get Advice" },
  { href: "/diagnose", label: "Crop Doctor" },
  { href: "/soil-health", label: "Soil Health" },
  { href: "/schema", label: "Data Schema" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-agri-100 bg-white/90 backdrop-blur dark:border-agri-900 dark:bg-black/70">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-agri-600 text-base text-white">
            🌾
          </span>
          <span className="text-lg font-bold tracking-tight text-agri-800 dark:text-agri-200">
            AgriSetu
          </span>
        </Link>
        <nav className="flex gap-1 overflow-x-auto text-sm font-medium sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-agri-800 transition-colors hover:bg-agri-100 dark:text-agri-200 dark:hover:bg-agri-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
