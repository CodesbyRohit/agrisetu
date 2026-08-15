import AdvisoryForm from "@/components/AdvisoryForm";
import { getAllDistricts, getCrops, getDistricts } from "@/lib/data";

export const dynamic = "force-static";

export default function AdvisoryPage() {
  // Full India districts dataset (762 districts, 36 states/UTs) for the
  // searchable dropdown, plus the curated districts that carry real
  // soil/weather demo layers for the context line.
  const districtOptions = getAllDistricts();
  const curatedDistricts = getDistricts();
  const crops = getCrops();

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Get your advisory
        </h1>
        <p className="mt-1.5 text-ink-soft">
          Answer three quick questions and we’ll give you plain-language advice on water,
          fertilizer, and timing for your crop.
        </p>
      </div>
      <AdvisoryForm
        districtOptions={districtOptions}
        curatedDistricts={curatedDistricts}
        crops={crops}
      />
    </div>
  );
}
