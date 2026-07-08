import { useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";

const STORAGE_KEY = "celebrated_badge_ids";

export function getCelebratedIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function markAsCelebrated(id) {
  const ids = getCelebratedIds();
  if (!ids.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, id]));
  }
}

export default function BadgeCelebration({ badge, onClose }) {
  const { t } = useTranslation();
  const burstRef = useRef(null);

  const fireConfetti = useCallback(() => {
    const duration = 3500;
    const end = Date.now() + duration;

    const colors = ["#0F62FE", "#00AEEF", "#16558C", "#FFD700", "#FF6B6B", "#4CAF50"];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) {
        burstRef.current = requestAnimationFrame(frame);
      }
    };

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors,
    });

    burstRef.current = requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!badge) return;
    fireConfetti();
    return () => {
      if (burstRef.current) cancelAnimationFrame(burstRef.current);
    };
  }, [badge, fireConfetti]);

  if (!badge) return null;

  const handleClose = () => {
    if (burstRef.current) cancelAnimationFrame(burstRef.current);
    markAsCelebrated(badge.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "celebrationPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
      >
        {/* Gradient header */}
        <div className="relative bg-gradient-to-r from-[#0F62FE] via-[#0F62FE] to-[#00AEEF] px-8 py-10 text-center text-white">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -left-8 bottom-0 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 ring-4 ring-white/30 backdrop-blur-sm">
              {badge.image_url ? (
                <img src={badge.image_url} alt="" className="h-16 w-16 rounded-2xl object-contain" />
              ) : (
                <i className="bi bi-award-fill text-5xl text-white"></i>
              )}
            </div>
            <div className="mb-1 text-4xl font-black tracking-tight">{t("components.badgeCelebration.congrats")}</div>
            <p className="text-white/85">{t("components.badgeCelebration.subtitle")}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 text-center">
          <h2 className="mb-1 text-xl font-bold text-slate-900">
            {badge.description || badge.nome || t("components.badgeCelebration.badgeFallback", { id: badge.id })}
          </h2>

          {badge.level && (
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {badge.level}
            </span>
          )}

          {badge.points > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2">
                <i className="bi bi-star-fill text-amber-500"></i>
                <span className="text-sm font-bold text-amber-700">{t("components.badgeCelebration.pointsEarned", { count: badge.points })}</span>
              </div>
            </div>
          )}

          <p className="mt-4 text-sm text-slate-500">
            {t("components.badgeCelebration.encouragement")}
          </p>

          <button
            onClick={handleClose}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] py-3.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95"
          >
            <i className="bi bi-trophy-fill mr-2"></i>
            {t("components.badgeCelebration.viewMyBadges")}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes celebrationPop {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
