import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BadgeMedal from "./BadgeMedal";

const getBadgeName = (badge) => badge?.name || badge?.nome || badge?.title || "Badge";
const getBadgeLevel = (badge) => badge?.level || badge?.nivel || badge?.level_name || "Junior";
const getBadgeArea = (badge, t) =>
  badge?.area?.name || badge?.area?.nome || badge?.area_name || badge?.area || t("components.badgeCard.defaultArea");
const getBadgeDescription = (badge, t) =>
  badge?.description ||
  badge?.descricao ||
  t("components.badgeCard.defaultDescription");
const getBadgePoints = (badge) => Number(badge?.points ?? badge?.pontos ?? badge?.score ?? 0);

export default function BadgeCard({
  badge,
  onApply,
  applying = false,
  applied = false,
  applicationStatus = "",
  canApply = false,
  variant = "catalog",
}) {
  const { t } = useTranslation();
  const name = getBadgeName(badge);
  const level = getBadgeLevel(badge);
  const areaName = getBadgeArea(badge, t);
  const description = getBadgeDescription(badge, t);
  const points = getBadgePoints(badge);
  const imageUrl = badge?.image_url || badge?.imageUrl || "";
  const detailUrl = `/badges/${badge?.id}`;
  const requirementsCount =
    badge?.requirements_count || badge?.requirementsCount || badge?.requisitos_count || 5;
  const isSpecial = Boolean(badge?.special_deadline);
  const isSpecialClosed = isSpecial && new Date(badge.special_deadline) < new Date();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#0F62FE]/10 bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-[#0F62FE]/30 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]">
      <Link to={detailUrl} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          <div className="h-full w-full transition duration-300 group-hover:scale-105">
            <BadgeMedal imageUrl={imageUrl} name={name} level={level} className="h-full w-full" rounded="rounded-none" />
          </div>
          <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0F62FE] shadow-sm ring-1 ring-[#0F62FE]/10">
            {level}
          </div>
          {badge?.is_premium && (
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-1 text-xs font-bold text-white shadow-sm">
              <i className="bi bi-star-fill text-[10px]"></i>Premium
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-4 pt-10">
            {isSpecial && (
              <div className={`mb-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isSpecialClosed ? "bg-slate-600 text-white" : "bg-amber-400 text-amber-950"}`}>
                <i className="bi bi-hourglass-split text-[10px]"></i>
                {isSpecialClosed ? t("components.badgeCard.specialClosed") : t("requirements.card.specialBadge")}
              </div>
            )}
            <p className="text-xs font-bold uppercase tracking-wide text-white/90">
              {areaName}
            </p>
            <h3 className="mt-1 line-clamp-2 text-xl font-extrabold leading-tight text-white">
              {name}
            </h3>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-relaxed text-slate-600">
          {description}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-slate-50 px-2 py-3">
            <p className="text-sm font-extrabold text-slate-950">{points}</p>
            <p className="text-[11px] font-semibold text-slate-500">{t("components.badgeCard.points")}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-2 py-3">
            <p className="text-sm font-extrabold text-slate-950">{requirementsCount}</p>
            <p className="text-[11px] font-semibold text-slate-500">{t("components.badgeCard.requirements")}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-2 py-3">
            <p className="text-sm font-extrabold text-slate-950">100%</p>
            <p className="text-[11px] font-semibold text-slate-500">{t("components.badgeCard.validated")}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            to={detailUrl}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0F62FE]/20 px-4 py-3 text-sm font-bold text-[#0F62FE] transition hover:bg-[#0F62FE]/10"
          >
            <i className="bi bi-list-check"></i>
            {t("components.badgeCard.viewDetails")}
          </Link>

          {(canApply || variant === "course") && (
            canApply ? (
              <button
                type="button"
                onClick={() => onApply?.(badge)}
                disabled={applying || applied}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i className="bi bi-send"></i>
                {applied
                  ? applicationStatus || t("components.badgeCard.activeApplication")
                  : applying
                    ? t("components.badgeCard.applying")
                    : t("components.badgeCard.apply")}
              </button>
            ) : (
              <Link
                to={detailUrl}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
              >
                <i className="bi bi-arrow-right"></i>
                {t("components.badgeCard.exploreBadge")}
              </Link>
            )
          )}
        </div>
      </div>
    </article>
  );
}
