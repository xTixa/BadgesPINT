import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";

const fallback = {
  points: 0,
  level: { name: "Rookie", progress: 0, points_to_next: 250, next_points: 250 },
  ranking: null,
  badges: { total: 0, obtained: 0, pending: 0, rejected: 0 },
  evidences_submitted: 0,
  achievements: [],
  unlocked_count: 0,
};

function achievementIcon(code) {
  if (code === "top_3") return "bi-trophy-fill";
  if (code === "points_500") return "bi-stars";
  if (code === "evidence_builder") return "bi-folder-check";
  return "bi-award-fill";
}

export default function Gamification() {
  const { t } = useTranslation();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const [meRes, gamificationRes] = await Promise.all([
          api.get("/api/auth/me").catch(() => ({ data: user })),
          api.get("/api/consultor/gamification"),
        ]);
        if (!active) return;
        if (meRes.data) setUser(meRes.data);
        setData({ ...fallback, ...gamificationRes.data });
        setError("");
      } catch (err) {
        console.error(err);
        if (active) setError(t("consultor.gamification.loadError"));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [t]);

  const nextText = useMemo(() => {
    if (!data.level?.next_points) return t("consultor.gamification.maxLevelReached");
    return t("consultor.gamification.pointsToNext", {
      pointsToNext: data.level.points_to_next,
      nextPoints: data.level.next_points,
    });
  }, [data, t]);

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: user?.name || "Consultor" }} />
      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#DECBF5] bg-[#F1EBFB] p-8 text-slate-900">
          <p className="relative z-10 mb-2 text-sm font-medium text-slate-500">
            {t("consultor.common.consultantArea")}
          </p>
          <div className="relative z-10 mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{t("consultor.gamification.title")}</h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                {t("consultor.gamification.subtitle")}
              </p>
            </div>
            <Link
              to="/consultor/ranking"
              className="inline-flex items-center justify-center rounded-2xl bg-[#7C4FD1] px-5 py-3 text-sm font-extrabold text-white"
            >
              {t("consultor.gamification.viewRanking")}
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-4 lg:grid-cols-4">
          <section className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">{t("consultor.gamification.currentLevel")}</p>
                <h2 className="mt-1 text-4xl font-black text-slate-950">
                  {loading ? "..." : data.level?.name}
                </h2>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#0F62FE]/10">
                <i className="bi bi-lightning-charge-fill text-3xl text-[#0F62FE]"></i>
              </div>
            </div>
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm font-bold">
                <span>{t("consultor.gamification.pointsCount", { count: data.points })}</span>
                <span>{data.level?.progress || 0}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0F62FE] to-[#00AEEF]"
                  style={{ width: `${data.level?.progress || 0}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-slate-500">{nextText}</p>
            </div>
          </section>

          {[
            [t("consultor.gamification.stats.points"), data.points, "bi-stars"],
            [t("consultor.gamification.stats.ranking"), data.ranking ? `#${data.ranking}` : "-", "bi-trophy"],
            [t("consultor.gamification.stats.achievements"), `${data.unlocked_count}/${data.achievements.length}`, "bi-patch-check"],
            [t("consultor.gamification.stats.evidences"), data.evidences_submitted, "bi-upload"],
          ].map(([label, value, icon]) => (
            <section key={label} className="rounded-3xl bg-white p-6 shadow-sm">
              <i className={`bi ${icon} text-2xl text-[#0F62FE]`}></i>
              <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
              <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
            </section>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-black text-slate-950">{t("consultor.gamification.achievements")}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {data.achievements.map((achievement) => (
                <article
                  key={achievement.code}
                  className={`rounded-2xl border p-4 ${
                    achievement.unlocked
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        achievement.unlocked
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      <i className={`bi ${achievementIcon(achievement.code)}`}></i>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-950">
                        {achievement.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {achievement.description}
                      </p>
                      <p className="mt-2 text-xs font-bold text-slate-500">
                        {achievement.progress}/{achievement.target}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">{t("consultor.gamification.badges")}</h2>
            <div className="mt-5 space-y-3">
              {[
                [t("consultor.gamification.badgeStatus.obtained"), data.badges.obtained, "bg-emerald-100 text-emerald-700"],
                [t("consultor.gamification.badgeStatus.pending"), data.badges.pending, "bg-amber-100 text-amber-700"],
                [t("consultor.gamification.badgeStatus.rejected"), data.badges.rejected, "bg-rose-100 text-rose-700"],
                [t("consultor.gamification.badgeStatus.total"), data.badges.total, "bg-slate-100 text-slate-700"],
              ].map(([label, value, tone]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className={`rounded-full px-3 py-1 text-sm font-black ${tone}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
