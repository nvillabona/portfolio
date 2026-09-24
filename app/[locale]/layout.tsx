import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { routing } from "@/i18n/routing";
import { OG_LOCALES, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: t("title"),
      title: t("title"),
      description: t("description"),
      locale: OG_LOCALES[locale],
    },
    twitter: {
      card: "summary_large_image",
      creator: "@n_villabona",
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
    },
  };
}

const atkinson = Atkinson_Hyperlegible({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-atkinson",
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className={atkinson.className}>
        <NextIntlClientProvider>
          <Navbar />
          <main className="flex min-h-screen flex-col items-center gap-4 md:px-10 lg:px-24 xl:px-60 xs:px-4 pt-20">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
