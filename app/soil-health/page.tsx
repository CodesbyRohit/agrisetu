import SoilHealthView from "@/components/SoilHealthView";
import { getDistricts } from "@/lib/data";

export const dynamic = "force-static";

export default function SoilHealthPage() {
  const districts = getDistricts();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-agri-900 dark:text-agri-100">🟢 Soil & Vegetation Health</h1>
        <p className="mt-1 text-agri-800/80 dark:text-agri-200/80">
          A simple, color-coded health indicator for your region — derived from
          vegetation (NDVI) and soil data. Demo layer: live satellite integration
          (Sentinel Hub / GEE / Bhuvan) can be plugged in later.
        </p>
      </div>
      <SoilHealthView districts={districts} />
    </div>
  );
}
