import Card from "@/components/common/Card/Card";
import Experience from "@/components/home/experience/Experience";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

async function page() {
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
              alt="me"
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
          <div className="flex flex-col items-center justify-center mb-2">
            <Image
              src="https://img.icons8.com/?size=100&id=15495&format=png&color=000000"
              width={50}
              height={50}
              alt="Colombia"
              quality={90}
              priority={true}
            />
            <p>{t("languages.spanish")}</p>
            <p className="text-tom-thumb-400">{t("languages.native")}</p>
          </div>
          <div className="flex flex-col items-center justify-center mb-2">
            <Image
              src="https://img.icons8.com/?size=100&id=15532&format=png&color=000000"
              width={50}
              height={50}
              alt="Usa"
              quality={90}
              priority={true}
            />
            <p>{t("languages.english")}</p>
            <p className="text-tom-thumb-400">{t("languages.advanced")}</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Image
              src="https://img.icons8.com/?size=100&id=15497&format=png&color=000000"
              width={50}
              height={50}
              alt="France"
              quality={90}
              priority={true}
            />
            <p>{t("languages.french")}</p>
            <p className="text-tom-thumb-400">{t("languages.intermediate")}</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Image
              src="https://img.icons8.com/?size=100&id=15527&format=png&color=000000"
              width={50}
              height={50}
              alt="Sweden"
              quality={90}
              priority={true}
            />
            <p>{t("languages.swedish")}</p>
            <p className="text-tom-thumb-400">{t("languages.basic")}</p>
          </div>
        </div>
      </Card>
      <Card className="mb-5">
        <Experience />
      </Card>
    </>
  );
}

export default page;
