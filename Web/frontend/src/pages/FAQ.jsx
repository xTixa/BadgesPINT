import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../layout/Sidebar";

const FAQ_CATEGORIES = [
  { key: "badges", icon: "bi-award-fill", color: "text-[#0F62FE]", itemCount: 4 },
  { key: "certificates", icon: "bi-file-earmark-text-fill", color: "text-emerald-600", itemCount: 2 },
  { key: "points", icon: "bi-stars", color: "text-amber-500", itemCount: 2 },
  { key: "profile", icon: "bi-person-fill", color: "text-violet-600", itemCount: 2 },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="text-sm font-semibold text-slate-800">{item.q}</span>
        <i
          className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"} shrink-0 text-slate-400`}
        ></i>
      </button>
      {open ? (
        <p className="pb-4 text-sm leading-relaxed text-slate-600">{item.a}</p>
      ) : null}
    </div>
  );
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function FAQ() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const user = getUser();

  const faqs = useMemo(
    () =>
      FAQ_CATEGORIES.map((category) => ({
        ...category,
        category: t(`faq.categories.${category.key}.title`),
        items: Array.from({ length: category.itemCount }, (_, index) => ({
          q: t(`faq.categories.${category.key}.items.${index}.q`),
          a: t(`faq.categories.${category.key}.items.${index}.a`),
        })),
      })),
    [t],
  );

  const filtered = faqs
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          search === "" ||
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="admin-shell">
      {user ? <Sidebar user={user} /> : null}

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <div className="w-full">
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0F62FE]/10 text-[#0F62FE]">
                  <i className="bi bi-question-circle-fill text-xl"></i>
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-[#0F62FE]">
                    {t("faq.eyebrow")}
                  </p>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {t("faq.title")}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    {t("faq.subtitle")}
                  </p>
                </div>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm focus:border-[#0F62FE] focus:outline-none focus:ring-2 focus:ring-[#0F62FE]/20"
                  placeholder={t("faq.searchPlaceholder")}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
          </section>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
              <i className="bi bi-inbox mb-3 block text-3xl"></i>
              {t("faq.noResults", { search })}
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {filtered.map((category) => (
                <section
                  key={category.category}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]"
                >
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                    <i className={`bi ${category.icon} ${category.color}`}></i>
                    {category.category}
                  </h2>
                  {category.items.map((item) => (
                    <FAQItem key={item.q} item={item} />
                  ))}
                </section>
              ))}
            </div>
          )}

          <div className="mt-10 flex items-start gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <i className="bi bi-envelope-fill text-xl text-[#0F62FE]"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {t("faq.contact.title")}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {t("faq.contact.text")}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
