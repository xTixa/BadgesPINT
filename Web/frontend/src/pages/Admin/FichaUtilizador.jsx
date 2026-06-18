import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";

const roleLabels = {
  admin: "Administrador",
  consultant: "Consultor",
  talent_manager: "Talent Manager",
  service_line_leader: "Service Line Leader",
};

const roleStyles = {
  admin: "bg-rose-50 text-rose-700 ring-rose-200",
  consultant: "bg-sky-50 text-sky-700 ring-sky-200",
  talent_manager: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  service_line_leader: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

function getRoleLabel(role) {
  return roleLabels[role] || role || "Sem perfil";
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDate(value) {
  if (!value) return "N/D";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/D";
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FichaUtilizador() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "consultant",
    area_id: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUser();
    fetchAreas();
  }, [id]);

  async function fetchUser() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/api/admin/users/${id}`);
      setUser(response.data);
      setForm({
        name: response.data?.name || "",
        email: response.data?.email || "",
        role: response.data?.role || "consultant",
        area_id: response.data?.area_id ? String(response.data.area_id) : "",
        password: "",
      });
    } catch (err) {
      console.error("Erro ao carregar ficha do utilizador:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Nao foi possivel carregar a ficha do utilizador.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchAreas() {
    try {
      const response = await api.get("/api/areas");
      setAreas(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Erro ao carregar areas:", err);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("Preenche o nome e o email do utilizador.");
      return;
    }

    if (form.role === "service_line_leader" && !form.area_id) {
      setError("Seleciona uma area para o Service Line Leader.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        area_id: form.area_id ? Number(form.area_id) : null,
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      const response = await api.put(`/api/admin/users/${id}`, payload);
      const updatedUser = {
        ...user,
        ...response.data,
        points_total: user?.points_total,
        createdAt: user?.createdAt,
      };

      setUser(updatedUser);
      setForm((current) => ({ ...current, password: "" }));
      setSuccess("Ficha atualizada com sucesso.");
    } catch (err) {
      console.error("Erro ao atualizar ficha:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Nao foi possivel atualizar a ficha.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user) return;

    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.id === user.id) {
      setError("Nao podes apagar o teu proprio utilizador.");
      return;
    }

    if (!window.confirm(`Apagar o utilizador ${user.name || user.email}?`)) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/api/admin/users/${user.id}`);
      navigate("/admin/gestao-utilizadores");
    } catch (err) {
      console.error("Erro ao apagar utilizador:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Nao foi possivel apagar o utilizador.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const areaById = useMemo(
    () => new Map(areas.map((area) => [Number(area.id), area.name])),
    [areas],
  );

  function getAreaName(areaId) {
    return areaById.get(Number(areaId)) || areaId || "N/D";
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main px-4 py-4 sm:px-5 md:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-900"
              onClick={() => navigate("/admin/gestao-utilizadores")}
            >
              <i className="bi bi-arrow-left"></i>
              Voltar a gestao
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Ficha do utilizador</h1>
            <p className="mt-1 text-sm text-slate-500">
              Consulta e edita os dados completos do utilizador.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-sm">
            <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-600 border-r-transparent align-middle"></span>
            A carregar ficha...
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
            {error || "Utilizador nao encontrado."}
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <i className="bi bi-exclamation-triangle mr-2"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <i className="bi bi-check-circle mr-2"></i>
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="space-y-4">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-700">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-bold text-slate-900">
                        {user.name || "Sem nome"}
                      </h2>
                      <p className="truncate text-sm text-slate-500">{user.email || "N/D"}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <RoleBadge role={user.role} />
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      ID {user.id}
                    </span>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-base font-bold text-slate-900">Resumo</h3>
                  <dl className="space-y-3 text-sm">
                    <InfoRow label="Area" value={getAreaName(user.area_id)} />
                    <InfoRow label="Pontos" value={Number(user.points_total || 0)} />
                    <InfoRow label="Criado em" value={formatDate(user.createdAt)} />
                    <InfoRow label="Atualizado em" value={formatDate(user.updatedAt)} />
                  </dl>
                </section>
              </aside>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-slate-900">Dados editaveis</h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Nome">
                      <input
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        value={form.name}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, name: event.target.value }))
                        }
                      />
                    </Field>

                    <Field label="Email">
                      <input
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, email: event.target.value }))
                        }
                      />
                    </Field>

                    <Field label="Perfil">
                      <select
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        value={form.role}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, role: event.target.value }))
                        }
                      >
                        {Object.entries(roleLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Area">
                      <select
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        value={form.area_id}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, area_id: event.target.value }))
                        }
                      >
                        <option value="">Sem area</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Nova password">
                    <input
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, password: event.target.value }))
                      }
                      placeholder="Deixar vazio para manter a password atual"
                    />
                  </Field>

                  <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={handleDelete}
                      disabled={saving || deleting}
                    >
                      <i className="bi bi-trash"></i>
                      {deleting ? "A apagar..." : "Apagar utilizador"}
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={saving || deleting}
                    >
                      <i className="bi bi-save"></i>
                      {saving ? "A guardar..." : "Guardar alteracoes"}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        roleStyles[role] || "bg-slate-50 text-slate-700 ring-slate-200"
      }`}
    >
      {getRoleLabel(role)}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
