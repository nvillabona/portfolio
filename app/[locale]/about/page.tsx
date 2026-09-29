import type { Metadata } from "next";
import Card from "@/components/common/Card/Card";
import Experience from "@/components/home/experience/Experience";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { flags } from "@/lib/icons";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Navbar" });
  return { title: t("about") };
}

const spokenLanguages = [
  { key: "spanish", level: "native", flag: flags.colombia, country: "Colombia" },
  { key: "english", level: "advanced", flag: flags.usa, country: "USA" },
  { key: "french", level: "intermediate", flag: flags.france, country: "France" },
  { key: "swedish", level: "basic", flag: flags.sweden, country: "Sweden" },
] as const;

async function page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  return (
    <>
      <Card>
        <div className="grid md:grid-cols-2 xs:grid-cols-1">
          <div>
            <h1 className="text-3xl font-semibold mb-4">{t("heading")}</h1>
            <p className="mb-2">
              {t.rich("bio1", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
            <p>{t("bio2")}</p>
          </div>
          <div className="flex justify-center items-center">
            <Image
              src="/me.webp"
              width={300}
              height={300}
              alt="Nicolás Villabona"
              quality={90}
              priority={true}
            />
          </div>
        </div>
      </Card>
      <Card>
        <h2 className="text-3xl font-semibold mb-4">
          {t("languagesHeading")}
        </h2>
        <div className="grid md:grid-cols-4 xs:grid-cols-2 place-items-center">
          {spokenLanguages.map((language) => (
            <div
              key={language.key}
              className="flex flex-col items-center justify-center mb-2"
            >
              <Image
                src={language.flag}
                width={48}
                height={36}
                alt={language.country}
                quality={90}
              />
              <p>{t(`languages.${language.key}`)}</p>
              <p className="text-tom-thumb-300">
                {t(`languages.${language.level}`)}
              </p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="mb-5">
        <Experience showDetails />
      </Card>
    </>
  );
}

export default page;
