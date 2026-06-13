import React from "react";
import { Link } from "react-router-dom";

export default function BadgeCard({ badge }) {
  const level = badge?.level || badge?.nivel || badge?.level_name || "Junior";
  const areaName =
    badge?.area?.name || badge?.area?.nome || badge?.area_name || "Badge";
  const description =
    badge?.description ||
    badge?.descricao ||
    "Este badge representa a conquista de uma competência específica.";
  const points = badge?.points ?? badge?.pontos ?? badge?.score ?? 0;

  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(15,98,254,0.15)]">
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-r from-[#0F62FE] to-[#00AEEF]">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>

        <svg
          className="h-20 w-20 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806
          3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806
          3.42 3.42 0 013.138 3.138 3.42 3.42 0
          .806 1.946 3.42 3.42 0 010 4.438
          3.42 3.42 0 00-.806 1.946 3.42 3.42
          0 01-3.138 3.138 3.42 3.42 0 00-1.946.806
          3.42 3.42 0 01-4.438 0 3.42 3.42 0
          00-1.946-.806 3.42 3.42 0
          01-3.138-3.138 3.42 3.42 0
          00-.806-1.946 3.42 3.42 0
          010-4.438 3.42 3.42 0
          00.806-1.946 3.42 3.42 0
          013.138-3.138z"
          />
        </svg>

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

        <Link
          to={`/badges/${badge?.id}/requirements`}
          className="block w-full rounded-2xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-5 py-3 text-center font-semibold text-white shadow-md transition hover:scale-[1.02]"
        >
          Ver Requisitos
        </Link>
      </div>
    </article>
  );
}
