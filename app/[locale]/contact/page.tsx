import type { Metadata } from "next";
import Card from "@/components/common/Card/Card";
import SectionTitle from "@/components/common/SectionTitle";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { socialIcons } from "@/lib/icons";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Navbar" });
    return { title: t("contact") };
}

async function page({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("Contact");
    const methods = [
        { label: "LinkedIn", value: "in/nvillabona", href: "https://www.linkedin.com/in/nvillabona/", icon: socialIcons.linkedin },
        { label: "GitHub", value: "@nvillabona", href: "https://github.com/nvillabona/", icon: socialIcons.github },
    ];
    return (
        <Card>
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
                <div>
                    <SectionTitle as="h1">{t("heading")}</SectionTitle>
                    <p className="mb-6 max-w-lg text-lg leading-relaxed text-white/85">{t("intro")}</p>
                    <ul className="flex max-w-lg flex-col gap-3">
                        {methods.map((method) => (
                            <li key={method.label}>
                                <a
                                    href={method.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-4 rounded-xl border border-white/15 bg-white/5 p-4 transition-colors hover:border-white/30 hover:bg-white/10"
                                >
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tom-thumb-600 text-xl">
                                        <Image src={method.icon} alt="" width={22} height={22} />
                                    </span>
                                    <span className="flex flex-col">
                                        <span className="text-sm text-tom-thumb-200">{method.label}</span>
                                        <span className="font-bold">{method.value}</span>
                                    </span>
                                    <span aria-hidden="true" className="ml-auto text-white/50 transition-transform group-hover:translate-x-1">→</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="relative flex justify-center xs:order-first md:order-none">
                    <div aria-hidden="true" className="absolute inset-6 rounded-full bg-tom-thumb-400/30 blur-3xl" />
                    <Image className="relative xs:w-36 md:w-[280px]" src="/contact.webp" width={280} height={280} alt="" quality={90} priority={true} />
                </div>
            </div>
        </Card>
    );
}

export default page;
