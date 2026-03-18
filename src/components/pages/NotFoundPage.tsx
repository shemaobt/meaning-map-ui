import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-branco px-4">
      <h1 className="text-5xl sm:text-6xl font-bold text-telha">{t("errors.notFound.code")}</h1>
      <p className="mt-2 text-base sm:text-lg text-verde">{t("errors.notFound.message")}</p>
      <Button asChild className="mt-6">
        <Link to="/app/dashboard">{t("errors.notFound.backLink")}</Link>
      </Button>
    </div>
  );
}
