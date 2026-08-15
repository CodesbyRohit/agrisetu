// UI strings kept in one place so the app can be localized later
// (English MVP; structure ready for Hindi / other BRICS languages).
// Add a new locale object and switch on the user's language.

export const STRINGS = {
  en: {
    appName: "AgriSetu",
    tagline: "AI-powered agro-advisory for small and marginal farmers",
    nav: {
      home: "Home",
      advisory: "Get Advice",
      diagnose: "Crop Doctor",
      soilHealth: "Soil Health",
      schema: "Data Schema",
    },
    footer: "Built with AI — Code for Communities · BRICS AgriN",
  },
} as const;

export type Locale = keyof typeof STRINGS;

export function t(locale: Locale = "en"): (typeof STRINGS)[typeof locale] {
  return STRINGS[locale];
}
