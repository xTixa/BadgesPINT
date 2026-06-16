import React from "react";
import { Link } from "react-router-dom";

export default function LearningPathCard({ path }) {
  const progress = Math.max(0, Math.min(100, path?.progress || 0));

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="h-2 w-full bg-gradient-to-r from-[#0F62FE] to-[#00AEEF]"></div>
      <div className="p-6">
        <h3 className="mb-2 text-xl font-bold text-slate-800">
          {path?.name || "Learning Path Name"}
        </h3>
        <p className="mb-4 line-clamp-3 text-sm text-slate-600">
          {path?.description ||
            "Descricao breve do percurso de aprendizagem e dos seus objetivos."}
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-[#0F62FE]/25 bg-[#0F62FE]/10 px-3 py-1 text-xs font-semibold text-[#0F62FE]">
            {path?.badgeCount || 5} Badges
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {path?.duration || 3} Meses
          </span>
        </div>

        <div className="mb-6">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#0F62FE] to-[#00AEEF]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link
            to={`/learning-paths/${path?.id || "1"}/service-lines`}
            className="rounded-lg bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            Começar
          </Link>
        </div>
      </div>
    </article>
  );
}
