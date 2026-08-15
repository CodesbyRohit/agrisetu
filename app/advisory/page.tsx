import AdvisoryForm from "@/components/AdvisoryForm";
import { getCrops, getDistricts } from "@/lib/data";

export const dynamic = "force-static";

export default function AdvisoryPage() {
  const districts = getDistricts();
  const crops = getCrops();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-agri-900 dark:text-agri-100">🌦️ Localized Agro-Advisory</h1>
        <p className="mt-1 text-agri-800/80 dark:text-agri-200/80">
          Tell us where you farm and what you grow. We combine your region's soil and
          weather data with AI to give plain-language advice you can act on.
        </p>
      </div>
      <AdvisoryForm districts={districts} crops={crops} />
    </div>
  );
}
