import { getTranslations, setRequestLocale } from "next-intl/server";
import styles from "./page.module.css";
import Card from "@/components/common/Card/Card";
import Skills from "@/components/home/skills/Skills";
import Experience from "@/components/home/experience/Experience";
import Social from "@/components/common/Social/Social";
import Memoji3D from "@/components/home/memoji/Memoji3D";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  return (
    <>
      <Card>
        <div className="grid lg:grid-cols-2 xs:grid-cols-1 gap-4">
          <div>
            <h1
              className={`
                sm:text-5xl xs:text-3xl
                font-semibold
                mb-4
                xs:max-w-72 sm:max-w-md
                ${styles.typewriter}`}
            >
              Nicolás Villabona
            </h1>
            <p className="text-2xl font-normal">{t("role")}</p>
          </div>
          <div className="flex justify-center">
            <Memoji3D alt="Nicolás Villabona memoji" hint={t("memojiHint")} />
          </div>
        </div>
      </Card>
      <div className="grid md:grid-cols-2 xs:grid-cols-1 w-full gap-4">
        <Card className="card w-full">
          <Skills />
        </Card>
        <Card className="card w-full">
          <Experience />
        </Card>
      </div>

      <Social />
    </>
  );
}
