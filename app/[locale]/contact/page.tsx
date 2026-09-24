import type { Metadata } from "next";
import Card from "@/components/common/Card/Card";
import Social from "@/components/common/Social/Social";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alternatesFor } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Navbar" });
    return { title: t("contact"), alternates: alternatesFor(locale, "/contact") };
}

async function page({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("Contact");
    return (
        <Card className="grid md:grid-cols-2 xs:grid-cols-1">
            <div className="flex flex-col xs:text-center md:text-start">
                <h1
                    className="sm:text-5xl xs:text-3xl
                font-semibold
                mb-1 "
                >
                    {t("heading")}
                </h1>
                <p className="text-2xl font-normal">
                    {t("intro")}
                </p>
                <Social />
            </div>
            <div className="flex justify-center">
                <Image src="/contact.webp" width={300} height={300} alt="" quality={90} priority={true} />
            </div>
        </Card>
    );
}

export default page;
