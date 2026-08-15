import AdvisoryForm from "@/components/AdvisoryForm";
import { getCrops, getDistricts } from "@/lib/data";

export const dynamic = "force-static";

export default function AdvisoryPage() {
  const districts = getDistricts();
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
      <AdvisoryForm districts={districts} crops={crops} />
    </div>
  );
}
