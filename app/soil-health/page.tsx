import SoilHealthView from "@/components/SoilHealthView";
import { getDistricts } from "@/lib/data";

export const dynamic = "force-static";

export default function SoilHealthPage() {
  const districts = getDistricts();
  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Your region’s soil health
        </h1>
        <p className="mt-1.5 text-ink-soft">
          A simple green–yellow–red score for each region’s vegetation and soil — derived
          from NDVI satellite data. Demo layer: live satellite integration can be plugged in later.
        </p>
      </div>
      <SoilHealthView districts={districts} />
    </div>
  );
}
