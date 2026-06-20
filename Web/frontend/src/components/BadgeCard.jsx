import React from "react";
import { Link } from "react-router-dom";
import BadgeMedal from "./BadgeMedal";

const getBadgeName = (badge) => badge?.name || badge?.nome || badge?.title || "Badge";
const getBadgeLevel = (badge) => badge?.level || badge?.nivel || badge?.level_name || "Junior";
const getBadgeArea = (badge) =>
  badge?.area?.name || badge?.area?.nome || badge?.area_name || badge?.area || "Competencia";
const getBadgeDescription = (badge) =>
  badge?.description ||
  badge?.descricao ||
  "Badge focado no desenvolvimento e validacao de uma competencia profissional.";
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
  const name = getBadgeName(badge);
  const level = getBadgeLevel(badge);
  const areaName = getBadgeArea(badge);
  const description = getBadgeDescription(badge);
  const points = getBadgePoints(badge);
  const imageUrl = badge?.image_url || badge?.imageUrl || "";
  const detailUrl = `/badges/${badge?.id}`;
  const requirementsCount =
    badge?.requirements_count || badge?.requirementsCount || badge?.requisitos_count || 5;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#0F62FE]/10 bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-[#0F62FE]/30 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]">
      <Link to={detailUrl} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-[linear-gradient(135deg,#EAF6FF_0%,#D9F7FF_46%,#BFEFFF_100%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(15,98,254,0.20),transparent_48%)]"></div>
          <div className="flex h-full w-full items-center justify-center transition duration-300 group-hover:scale-105">
            <BadgeMedal imageUrl={imageUrl} name={name} level={level} size="hero" />
          </div>
          <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0F62FE] shadow-sm ring-1 ring-[#0F62FE]/10">
            {level}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#16558C]">
              {areaName}
            </p>
            <h3 className="mt-1 line-clamp-2 text-xl font-extrabold leading-tight text-slate-950">
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
            <p className="text-[11px] font-semibold text-slate-500">pontos</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-2 py-3">
            <p className="text-sm font-extrabold text-slate-950">{requirementsCount}</p>
            <p className="text-[11px] font-semibold text-slate-500">requisitos</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-2 py-3">
            <p className="text-sm font-extrabold text-slate-950">100%</p>
            <p className="text-[11px] font-semibold text-slate-500">validado</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            to={detailUrl}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0F62FE]/20 px-4 py-3 text-sm font-bold text-[#0F62FE] transition hover:bg-[#0F62FE]/10"
          >
            <i className="bi bi-list-check"></i>
            Ver detalhes
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
                  ? applicationStatus || "Candidatura ativa"
                  : applying
                    ? "A candidatar..."
                    : "Candidatar-me"}
              </button>
            ) : (
              <Link
                to={detailUrl}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
              >
                <i className="bi bi-arrow-right"></i>
                Explorar badge
              </Link>
            )
          )}
        </div>
      </div>
    </article>
  );
}
