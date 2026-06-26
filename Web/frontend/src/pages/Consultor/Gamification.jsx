import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
        if (active) setError("Nao foi possivel carregar a gamification.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const nextText = useMemo(() => {
    if (!data.level?.next_points) return "Nivel maximo atingido";
    return `${data.level.points_to_next} pontos para ${data.level.next_points}`;
  }, [data]);

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: user?.name || "Consultor" }} />
      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
          <p className="relative z-10 mb-2 text-sm font-medium text-white/80">
            Area do consultor
          </p>
          <div className="relative z-10 mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Centro de conquistas</h1>
              <p className="mt-2 max-w-2xl text-white/85">
                Acompanha o teu nivel, pontos, ranking, conquistas desbloqueadas
                e proximos marcos de evolucao.
              </p>
            </div>
            <Link
              to="/consultor/ranking"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#0F62FE]"
            >
              Ver ranking
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
                <p className="text-sm font-bold text-slate-500">Nivel atual</p>
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
                <span>{data.points} pontos</span>
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
            ["Pontos", data.points, "bi-stars"],
            ["Ranking", data.ranking ? `#${data.ranking}` : "-", "bi-trophy"],
            ["Conquistas", `${data.unlocked_count}/${data.achievements.length}`, "bi-patch-check"],
            ["Evidencias", data.evidences_submitted, "bi-upload"],
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
            <h2 className="text-xl font-black text-slate-950">Conquistas</h2>
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
            <h2 className="text-xl font-black text-slate-950">Badges</h2>
            <div className="mt-5 space-y-3">
              {[
                ["Obtidos", data.badges.obtained, "bg-emerald-100 text-emerald-700"],
                ["Pendentes", data.badges.pending, "bg-amber-100 text-amber-700"],
                ["Rejeitados", data.badges.rejected, "bg-rose-100 text-rose-700"],
                ["Total", data.badges.total, "bg-slate-100 text-slate-700"],
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
