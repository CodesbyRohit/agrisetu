import DiagnoseForm from "@/components/DiagnoseForm";

export default function DiagnosePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Crop photo check</h1>
        <p className="mt-1.5 text-ink-soft">
          Upload a clear photo of the sick leaf or plant. We’ll tell you the likely
          disease and how to treat it.
        </p>
      </div>
      <DiagnoseForm />
    </div>
  );
}
