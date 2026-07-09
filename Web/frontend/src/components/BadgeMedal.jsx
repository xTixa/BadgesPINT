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
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl shadow-xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={altText}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-[#0F62FE] to-[#00AEEF] px-3 text-center text-white">
            <i className="bi bi-star-fill text-4xl text-yellow-200 drop-shadow"></i>
            <span className="mt-2 text-[11px] font-black uppercase tracking-wide">
              {label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
