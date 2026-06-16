import React from "react";
import { Link } from "react-router-dom";

export default function BadgeCard({ badge, onApply, applying = false, applied = false, canApply = false }) {
  const level = badge?.level || badge?.nivel || badge?.level_name || "Junior";
  const areaName =
    badge?.area?.name || badge?.area?.nome || badge?.area_name || "Badge";
  const description =
    badge?.description ||
    badge?.descricao ||
    "Este badge representa a conquista de uma competência específica.";
  const points = badge?.points ?? badge?.pontos ?? badge?.score ?? 0;
  const imageUrl = badge?.image_url || badge?.imageUrl || "";

  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(15,98,254,0.15)]">
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-r from-[#0F62FE] to-[#00AEEF]">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={description}
            className="relative z-10 h-24 w-24 rounded-3xl object-cover shadow-lg ring-4 ring-white/30"
          />
        ) : (
          <i className="bi bi-award relative z-10 text-7xl text-white"></i>
        )}

        <div className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {level}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900">
            {badge?.name || badge?.nome || badge?.title || areaName}
          </h3>

          <p className="mt-1 text-sm text-slate-500">Badge de Competência</p>
        </div>

        <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-slate-600">
          {description}
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#0F62FE]/10 px-3 py-1 text-xs font-semibold text-[#0F62FE]">
            {level}
          </span>

          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            ⭐ {points} pontos
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Link
            to={`/badges/${badge?.id}/requirements`}
            className="block w-full rounded-2xl border border-[#0F62FE]/20 px-5 py-3 text-center font-semibold text-[#0F62FE] transition hover:bg-[#0F62FE]/10"
          >
            Ver Requisitos
          </Link>

          {canApply && (
            <button
              type="button"
              onClick={() => onApply?.(badge)}
              disabled={applying || applied}
              className="block w-full rounded-2xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-5 py-3 text-center font-semibold text-white shadow-md transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {applied ? "Candidatura criada" : applying ? "A candidatar..." : "Candidatar-me"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
