import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import styles from "./page.module.css";
import Card from "@/components/common/Card/Card";
import Skills from "@/components/home/skills/Skills";
import Experience from "@/components/home/experience/Experience";
import { socialNetworks } from "@/components/common/Social/Social";
import { Link } from "@/i18n/navigation";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const tJobs = await getTranslations("Experience.jobs");
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Nicolás Villabona",
    jobTitle: tJobs("perficient.title"),
    worksFor: { "@type": "Organization", name: "Perficient" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cali",
      addressCountry: "CO",
    },
    sameAs: socialNetworks.map((network) => network.url),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Card>
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div className="xs:text-center lg:text-start">
            <p className="mb-3 text-lg text-tom-thumb-200">{t("greeting")}</p>
            <h1
              className={`
                sm:text-6xl xs:text-3xl
                font-bold
                mb-4
                xs:mx-auto lg:mx-0
                xs:max-w-72 sm:max-w-xl
                ${styles.typewriter}`}
            >
              Nicolás Villabona
            </h1>
            <p className="text-xl font-bold text-orange-300 sm:text-2xl">{t("headline")}</p>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/85 xs:mx-auto lg:mx-0">
              {t("tagline")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 xs:justify-center lg:justify-start">
              <Link
                href="/contact"
                className="rounded-lg bg-orange-400 px-5 py-2.5 font-bold text-tom-thumb-950 transition-colors hover:bg-orange-300"
              >
                {t("ctaContact")}
              </Link>
              <Link
                href="/about"
                className="rounded-lg border border-white/25 px-5 py-2.5 font-bold transition-colors hover:bg-white/10"
              >
                {t("ctaAbout")}
              </Link>
            </div>
            <p className="mt-5 text-sm text-tom-thumb-200">📍 {t("location")}</p>
          </div>
          <div className="relative flex justify-center xs:order-first lg:order-none">
            {/* Soft glow behind the memoji so it sits on something instead of floating */}
            <div aria-hidden="true" className="absolute inset-6 rounded-full bg-tom-thumb-400/30 blur-3xl" />
            <Image
              className="relative xs:w-40 sm:w-56 lg:w-[280px]"
              src="/memoji.webp"
              width={280}
              height={280}
              alt="Nicolás Villabona memoji"
              quality={90}
              priority={true}
            />
          </div>
        </div>
      </Card>
      <div className="grid md:grid-cols-2 xs:grid-cols-1 w-full gap-6">
        <Card className="card w-full">
          <Skills />
        </Card>
        <Card className="card w-full">
          <Experience />
        </Card>
      </div>
    </>
  );
}
