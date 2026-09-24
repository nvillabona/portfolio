import { useTranslations } from "next-intl";
import Card from "@/components/common/Card/Card";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <Card className="text-center">
      <p className="text-6xl font-semibold text-tom-thumb-200 mb-2">404</p>
      <h1 className="text-3xl font-semibold mb-4">{t("title")}</h1>
      <p className="mb-6">{t("description")}</p>
      <Link
        href="/"
        className="inline-block bg-tom-thumb-500 hover:bg-tom-thumb-300 font-semibold px-4 py-2 rounded-lg"
      >
        {t("backHome")}
      </Link>
    </Card>
  );
}
