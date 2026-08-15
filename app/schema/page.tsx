import { readFileSync } from "fs";
import path from "path";

export const dynamic = "force-static";

export default function SchemaPage() {
  const schemaPath = path.join(process.cwd(), "docs", "agro-advisory-schema.json");
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  const prettySchema = JSON.stringify(schema, null, 2);
  const example = schema.examples[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-agri-900 dark:text-agri-100">🔗 Interoperable Data Schema</h1>
        <p className="mt-1 text-agri-800/80 dark:text-agri-200/80">
          The digital public good layer: one standard record format any AgriN node
          can emit and consume — enabling cross-border data sharing and cooperation.
        </p>
      </div>

      <div className="rounded-2xl border border-agri-100 bg-white p-5 dark:border-agri-900 dark:bg-black/40">
        <h2 className="font-semibold text-agri-900 dark:text-agri-100">
          The Agro-Advisory Record — why it enables cooperation
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <CoopCard title="🌍 Shareable by design" desc="Any node — ICAR, EMBRAPA, or a partner agency — can emit records in this format. Consumers don't care who produced it; they just read the schema." />
          <CoopCard title="📊 Comparable across borders" desc="Two advisories for 'rice, kharif' from different countries can be compared field-by-field, enabling cooperative model evaluation." />
          <CoopCard title="🛡️ Trust via provenance" desc="Every record records its model and data sources, so partners can decide whose advice to trust without a central authority." />
          <CoopCard title="🔖 Versioned for adoption" desc="schemaVersion uses semver. A shared registry lets each node declare 'I speak version 1.x', so old nodes keep working as the network evolves." />
        </div>
      </div>

      <div className="rounded-2xl border border-agri-100 bg-white p-5 dark:border-agri-900 dark:bg-black/40">
        <h2 className="font-semibold text-agri-900 dark:text-agri-100">Example record</h2>
        <p className="mt-1 text-sm text-agri-800/70 dark:text-agri-200/70">
          This is the exact shape the app emits for every advisory.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-100">
          {JSON.stringify(example, null, 2)}
        </pre>
      </div>

      <div className="rounded-2xl border border-agri-100 bg-white p-5 dark:border-agri-900 dark:bg-black/40">
        <h2 className="font-semibold text-agri-900 dark:text-agri-100">Full schema (v{schema.schemaVersion ?? "1.0.0"})</h2>
        <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-100">
          {prettySchema}
        </pre>
      </div>
    </div>
  );
}

function CoopCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-agri-100 bg-agri-50/60 p-4 dark:border-agri-900 dark:bg-agri-900/30">
      <h3 className="font-semibold text-agri-800 dark:text-agri-100">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-agri-800/80 dark:text-agri-200/80">{desc}</p>
    </div>
  );
}
