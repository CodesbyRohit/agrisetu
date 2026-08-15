import DiagnoseForm from "@/components/DiagnoseForm";

export default function DiagnosePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-agri-900 dark:text-agri-100">🔬 Crop Doctor</h1>
        <p className="mt-1 text-agri-800/80 dark:text-agri-200/80">
          Upload a clear photo of the affected crop or leaf. Our AI identifies the likely
          disease and suggests an affordable treatment and prevention plan.
        </p>
      </div>
      <DiagnoseForm />
    </div>
  );
}
