import React from "react";
import { Link } from "react-router-dom";

export default function BadgeCard({ badge }) {
  // Função para determinar a cor do badge baseado no nível
  const getLevelColor = (level) => {
    const colors = {
      Junior: "bg-[#2AA4BF]",
      Intermedio: "bg-[#2AA4BF]",
      Senior: "bg-[#013440]",
      Especialista: "bg-[#2AA4BF]",
      Lider: "bg-[#013440]",
    };
    return colors[level] || "bg-[#013440]";
  };

  const getLevelBadgeColor = (level) => {
    const colors = {
      Junior: "bg-[#F2F2F2] text-[#013440] border border-[#2AA4BF]",
      Intermedio: "bg-[#F2F2F2] text-[#013440] border border-[#2AA4BF]",
      Senior: "bg-[#F2F2F2] text-[#013440] border border-[#2AA4BF]",
      Especialista: "bg-[#F2F2F2] text-[#013440] border border-[#2AA4BF]",
      Lider: "bg-[#F2F2F2] text-[#013440] border border-[#2AA4BF]",
    };
    return colors[level] || "bg-[#F2F2F2] text-[#013440] border border-[#2AA4BF]";
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#2AA4BF]">
      {/* Header / Ícone com cor dinâmica */}
      <div className={`flex items-center justify-center h-28 ${getLevelColor(badge?.level)}`}>
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

      {/* Conteúdo */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-[#013440] mb-2">
          {badge?.area?.name || "Badge"} - {badge?.level || "Junior"}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {badge?.description || "Este badge representa a conquista de uma competência específica."}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelBadgeColor(badge?.level)}`}>
              {badge?.level || "Junior"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F2F2F2] text-[#013440] border border-[#2AA4BF]">
              {badge?.points || 0} pts
            </span>
          </div>

          <Link
            to={`/badges/${badge?.id}/requirements`}
            className="px-4 py-2 rounded-lg bg-[#013440] text-white text-sm font-semibold"
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}
