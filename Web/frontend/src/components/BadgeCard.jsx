import React from "react";
import { Link } from "react-router-dom";

export default function BadgeCard({ badge }) {
  const level = badge?.level || "Junior";
  const areaName = badge?.area?.name || "Badge";
  const description =
    badge?.description ||
    "Este badge representa a conquista de uma competência específica.";
  const points = badge?.points || 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-[#16558C] to-[#2B6EA8]">
        <div className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
        <svg
          className="h-14 w-14 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.6}
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
      </div>

      <div className="p-6">
        <h3 className="mb-2 text-lg font-bold text-slate-800">
          {areaName} - {level}
        </h3>
        <p className="mb-4 line-clamp-3 text-sm text-slate-600">
          {description}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[#16558C]/25 bg-[#16558C]/10 px-3 py-1 text-xs font-semibold text-[#16558C]">
              {level}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {points} pts
            </span>
          </div>

          <Link
            to={`/badges/${badge?.id}/requirements`}
            className="rounded-lg bg-gradient-to-r from-[#16558C] to-[#2B6EA8] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
