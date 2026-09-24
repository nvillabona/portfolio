import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const SITE_URL = "https://nvillabona.vercel.app";

export const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  es: "es_CO",
  fr: "fr_FR",
  sv: "sv_SE",
};

// Matches localePrefix "as-needed": the default locale has no prefix
export function localizedPath(locale: string, path: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${prefix}${path}` || "/";
}

export function alternatesFor(
  locale: string,
  path: string
): Metadata["alternates"] {
  return {
    canonical: localizedPath(locale, path),
    languages: {
      ...Object.fromEntries(
        routing.locales.map((l) => [l, localizedPath(l, path)])
      ),
      "x-default": localizedPath(routing.defaultLocale, path),
    },
  };
}
