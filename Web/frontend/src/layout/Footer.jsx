import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative z-10 mt-auto border-t border-[#0F62FE]/15 bg-white text-slate-800">
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-800">{t("footer.brand")}</h3>
            <p className="text-sm text-slate-600">{t("footer.description")}</p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-800">{t("footer.quickLinks")}</h3>
            <ul className="m-0 list-none p-0">
              <li className="mb-2">
                <Link className="text-sm text-slate-700 transition hover:text-[#0F62FE]" to="/learning-paths">
                  {t("navbar.links.learningPaths")}
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-sm text-slate-700 transition hover:text-[#0F62FE]" to="/badges">
                  {t("footer.badgesCatalog")}
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-sm text-slate-700 transition hover:text-[#0F62FE]" to="/areas">
                  {t("navbar.links.areas")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-800">{t("footer.contact")}</h3>
            <p className="text-sm text-slate-600">{t("footer.contactText")}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-[#0F62FE]/15 pt-6 text-center text-sm text-slate-500">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
