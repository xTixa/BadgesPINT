import React from "react";
import { useTranslation } from "react-i18next";

const sizeClasses = {
  sm: "h-20 w-20",
  md: "h-28 w-28",
  lg: "h-40 w-40",
  hero: "h-48 w-48",
};

export default function BadgeMedal({
  imageUrl = "",
  name,
  level,
  size = "md",
  className = "",
}) {
  const { t } = useTranslation();
  const fallbackLabel = t("components.badgeMedal.badge");
  const label = String(level || fallbackLabel).slice(0, 16);
  const altText = name || fallbackLabel;

  return (
    <div className={`relative inline-flex ${sizeClasses[size] || sizeClasses.md} ${className}`}>
      <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
        <span className="h-10 w-5 -skew-x-12 rounded-b-sm bg-[#0F62FE] shadow-md"></span>
        <span className="h-10 w-5 skew-x-12 rounded-b-sm bg-[#00AEEF] shadow-md"></span>
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 via-amber-400 to-yellow-700 p-2 shadow-2xl ring-4 ring-white/75">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-yellow-100 bg-gradient-to-br from-slate-950 via-[#0F62FE] to-[#00AEEF]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={altText}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center px-3 text-center text-white">
              <i className="bi bi-star-fill text-4xl text-yellow-200 drop-shadow"></i>
              <span className="mt-2 text-[11px] font-black uppercase tracking-wide">
                {label}
              </span>
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-3 rounded-full border border-white/50"></div>
      </div>
    </div>
  );
}
