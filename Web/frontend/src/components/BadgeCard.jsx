import React from "react";
import { Link } from "react-router-dom";

export default function BadgeCard({ badge }) {
  // Função para determinar a cor do badge baseado no nível
  const getLevelColor = (level) => {
    const colors = {
      'Junior': 'bg-green-500',
      'Intermedio': 'bg-blue-500',
      'Senior': 'bg-purple-500',
      'Especialista': 'bg-orange-500',
      'Lider': 'bg-red-500'
    };
    return colors[level] || 'bg-[#191970]';
  };

  const getLevelHoverColor = (level) => {
    const colors = {
      'Junior': 'hover:bg-green-600',
      'Intermedio': 'hover:bg-blue-600',
      'Senior': 'hover:bg-purple-600',
      'Especialista': 'hover:bg-orange-600',
      'Lider': 'hover:bg-red-600'
    };
    return colors[level] || 'hover:bg-[#101050]';
  };

  const getLevelBadgeColor = (level) => {
    const colors = {
      'Junior': 'bg-green-100 text-green-800',
      'Intermedio': 'bg-blue-100 text-blue-800',
      'Senior': 'bg-purple-100 text-purple-800',
      'Especialista': 'bg-orange-100 text-orange-800',
      'Lider': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-[#191970]/10 text-[#191970]';
  };

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Header / Ícone com cor dinâmica */}
      <div className={`flex items-center justify-center h-40 ${getLevelColor(badge?.level)} ${getLevelHoverColor(badge?.level)} transition-colors`}>
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
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-[#191970]">
              {badge?.points || 0} pts
            </span>
          </div>

          <Link
            to={`/badges/${badge?.id}/requirements`}
            className="px-4 py-2 rounded-lg bg-[#191970] text-white text-sm font-semibold hover:bg-[#101050] transition-colors"
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}
