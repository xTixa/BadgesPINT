import React from "react";
import { Link } from "react-router-dom";

export default function BadgeCard({ badge }) {
  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Header / Ícone */}
      <div className="flex items-center justify-center h-40 bg-[#191970] group-hover:bg-[#101050] transition-colors">
        <svg
          className="h-16 w-16 text-white opacity-90"
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

      {/* Conteúdo */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-[#191970] mb-2">
          {badge?.name || "Badge Name"}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {badge?.description ||
            "Este badge representa a conquista de uma competência específica."}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#191970]/10 text-[#191970]">
              Level {badge?.level || 1}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-[#191970]">
              {badge?.points || 100} pts
            </span>
          </div>

          <Link
            to={`/badges/${badge?.id || "1"}/requirements`}
            className="px-4 py-2 rounded-lg bg-[#191970] text-white text-sm font-semibold hover:bg-[#101050] transition-colors"
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}
