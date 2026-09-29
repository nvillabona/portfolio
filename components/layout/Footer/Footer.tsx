import { useTranslations } from "next-intl";
import Social from "@/components/common/Social/Social";

function Footer() {
  const t = useTranslations("Footer");
  return (
    <footer className="mt-12 w-full border-t border-white/10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 md:flex-row md:justify-between">
        <p className="text-sm text-tom-thumb-200">
          © {new Date().getFullYear()} Nicolás Villabona · {t("madeWith")}
        </p>
        <Social className="justify-center" />
      </div>
    </footer>
  );
}

export default Footer;
