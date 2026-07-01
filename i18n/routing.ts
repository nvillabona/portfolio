import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "fr", "sv"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
