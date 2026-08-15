import { readFileSync } from "fs";
import path from "path";

export const dynamic = "force-static";

export default function SchemaPage() {
  const schemaPath = path.join(process.cwd(), "docs", "agro-advisory-schema.json");
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  const prettySchema = JSON.stringify(schema, null, 2);
  const example = schema.examples[0];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Interoperable data schema
        </h1>
        <p className="mt-1.5 text-ink-soft">
          One standard record format any AgriN node can emit and consume — enabling
          cross-border data sharing and cooperation. This page is for partner agencies
          and developers.
        </p>
      </div>

      <div className="rounded-3xl border border-soil-100 bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          The Agro-Advisory Record — why it enables cooperation
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <CoopCard title="Shareable by design" desc="Any node — ICAR, EMBRAPA, or a partner agency — can emit records in this format. Consumers don't care who produced it; they just read the schema." />
          <CoopCard title="Comparable across borders" desc="Two advisories for 'rice, kharif' from different countries can be compared field-by-field, enabling cooperative model evaluation." />
          <CoopCard title="Trust via provenance" desc="Every record records its model and data sources, so partners can decide whose advice to trust without a central authority." />
          <CoopCard title="Versioned for adoption" desc="schemaVersion uses semver. A shared registry lets each node declare 'I speak version 1.x', so old nodes keep working as the network evolves." />
        </div>
      </div>

      <div className="rounded-3xl border border-soil-100 bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Example record</h2>
        <p className="mt-1 text-sm text-ink-soft">
          This is the exact shape the app emits for every advisory.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-2xl bg-soil-900 p-4 text-xs leading-relaxed text-soil-50">
          {JSON.stringify(example, null, 2)}
        </pre>
      </div>

      <div className="rounded-3xl border border-soil-100 bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Full schema (v{schema.schemaVersion ?? "1.0.0"})
        </h2>
        <pre className="mt-3 max-h-96 overflow-auto rounded-2xl bg-soil-900 p-4 text-xs leading-relaxed text-soil-50">
          {prettySchema}
        </pre>
      </div>
    </div>
  );
}

function CoopCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-soil-100 bg-paper px-4 py-4">
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{desc}</p>
    </div>
  );
}
