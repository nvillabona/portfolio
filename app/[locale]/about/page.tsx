import type { Metadata } from "next";
import Card from "@/components/common/Card/Card";
import Experience from "@/components/home/experience/Experience";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { flags } from "@/lib/icons";
import SectionTitle from "@/components/common/SectionTitle";
import { getYearsOfExperience } from "@/lib/experience";

// Re-render daily so the years of experience stay current without a redeploy.
export const revalidate = 86400;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Navbar" });
  return { title: t("about") };
}

const spokenLanguages = [
  { key: "spanish", level: "native", score: 4, flag: flags.colombia, country: "Colombia" },
  { key: "english", level: "advanced", score: 3, flag: flags.usa, country: "USA" },
  { key: "french", level: "intermediate", score: 2, flag: flags.france, country: "France" },
  { key: "swedish", level: "basic", score: 1, flag: flags.sweden, country: "Sweden" },
] as const;

async function page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  return (
    <>
      <Card>
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <SectionTitle as="h1">{t("heading")}</SectionTitle>
            <div className="max-w-prose space-y-4 text-lg leading-relaxed text-white/90">
              <p>
                {t.rich("bio1", {
                  strong: (chunks) => <strong>{chunks}</strong>,
                  years: getYearsOfExperience(),
                })}
              </p>
              <p>{t("bio2")}</p>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div aria-hidden="true" className="absolute inset-6 rounded-full bg-tom-thumb-400/30 blur-3xl" />
            <Image
              className="relative"
              src="/me.webp"
              width={260}
              height={260}
              alt="Nicolás Villabona"
              quality={90}
              priority={true}
            />
          </div>
        </div>
      </Card>
      <Card>
        <SectionTitle>{t("languagesHeading")}</SectionTitle>
        <ul className="grid gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {spokenLanguages.map((language) => (
            <li
              key={language.key}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <Image
                className="rounded"
                src={language.flag}
                width={40}
                height={30}
                alt={language.country}
                quality={90}
              />
              <div className="flex-1">
                <p className="font-bold">{t(`languages.${language.key}`)}</p>
                <p className="text-sm text-tom-thumb-200">
                  {t(`languages.${language.level}`)}
                </p>
                {/* Four-segment level meter, decorative since the level is written above */}
                <div aria-hidden="true" className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      key={step}
                      className={`h-1.5 flex-1 rounded-full ${step <= language.score ? "bg-orange-400" : "bg-white/15"}`}
                    />
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <Experience showDetails />
      </Card>
    </>
  );
}

export default page;
