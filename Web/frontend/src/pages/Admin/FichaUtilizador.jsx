import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";
import AdminPageTitle from "../../components/ui/AdminPageTitle";

const roleKeys = {
  admin: "admin.fichaUtilizador.roles.admin",
  consultant: "admin.fichaUtilizador.roles.consultant",
  talent_manager: "admin.fichaUtilizador.roles.talentManager",
  service_line_leader: "admin.fichaUtilizador.roles.serviceLineLeader",
};

const roleStyles = {
  admin: "bg-rose-50 text-rose-700 ring-rose-200",
  consultant: "bg-sky-50 text-sky-700 ring-sky-200",
  talent_manager: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  service_line_leader: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDate(value, naLabel) {
  if (!value) return naLabel;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return naLabel;
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FichaUtilizador() {
  const { t } = useTranslation();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          t("admin.fichaUtilizador.errors.loadFailed"),
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
      setError(t("admin.fichaUtilizador.errors.fillNameAndEmail"));
      return;
    }

    if (form.role === "service_line_leader" && !form.area_id) {
      setError(t("admin.fichaUtilizador.errors.selectAreaForLeader"));
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
      setSuccess(t("admin.fichaUtilizador.success.updated"));
    } catch (err) {
      console.error("Erro ao atualizar ficha:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          t("admin.fichaUtilizador.errors.updateFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user) return;

    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.id === user.id) {
      setError(t("admin.fichaUtilizador.errors.cannotDeleteSelf"));
      return;
    }

    if (!window.confirm(t("admin.fichaUtilizador.confirmDelete", { name: user.name || user.email }))) {
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
          t("admin.fichaUtilizador.errors.deleteFailed"),
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
    return areaById.get(Number(areaId)) || areaId || t("admin.common.notAvailable");
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main bg-[#F6F8FA]">
        <AdminPageTitle title={t("admin.fichaUtilizador.title")} subtitle={t("admin.fichaUtilizador.subtitle")}>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => navigate("/admin/gestao-utilizadores")}
          >
            <i className="bi bi-arrow-left"></i>
            {t("admin.fichaUtilizador.backToManagement")}
          </button>
        </AdminPageTitle>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500">
            <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-600 border-r-transparent align-middle"></span>
            {t("admin.fichaUtilizador.loading")}
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
            {error || t("admin.fichaUtilizador.notFound")}
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
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-semibold text-slate-900">
                        {user.name || t("admin.fichaUtilizador.noName")}
                      </h2>
                      <p className="truncate text-sm text-slate-500">{user.email || t("admin.common.notAvailable")}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <RoleBadge role={user.role} t={t} />
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      ID {user.id}
                    </span>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-semibold text-slate-900">{t("admin.fichaUtilizador.summary")}</h3>
                  <dl className="space-y-3 text-sm">
                    <InfoRow label={t("admin.fichaUtilizador.areaLabel")} value={getAreaName(user.area_id)} />
                    <InfoRow label={t("admin.fichaUtilizador.pointsLabel")} value={Number(user.points_total || 0)} />
                    <InfoRow label={t("admin.fichaUtilizador.createdAtLabel")} value={formatDate(user.createdAt, t("admin.common.notAvailable"))} />
                    <InfoRow label={t("admin.fichaUtilizador.updatedAtLabel")} value={formatDate(user.updatedAt, t("admin.common.notAvailable"))} />
                  </dl>
                </section>
              </aside>

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">{t("admin.fichaUtilizador.editableData")}</h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label={t("admin.fichaUtilizador.nameLabel")}>
                      <input
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        value={form.name}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, name: event.target.value }))
                        }
                      />
                    </Field>

                    <Field label={t("admin.fichaUtilizador.emailLabel")}>
                      <input
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, email: event.target.value }))
                        }
                      />
                    </Field>

                    <Field label={t("admin.fichaUtilizador.roleLabel")}>
                      <select
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        value={form.role}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, role: event.target.value }))
                        }
                      >
                        {Object.entries(roleKeys).map(([value, key]) => (
                          <option key={value} value={value}>
                            {t(key)}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label={t("admin.fichaUtilizador.areaLabel")}>
                      <select
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        value={form.area_id}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, area_id: event.target.value }))
                        }
                      >
                        <option value="">{t("admin.fichaUtilizador.noArea")}</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label={t("admin.fichaUtilizador.newPasswordLabel")}>
                    <input
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, password: event.target.value }))
                      }
                      placeholder={t("admin.fichaUtilizador.newPasswordPlaceholder")}
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
                      {deleting ? t("admin.fichaUtilizador.deleting") : t("admin.fichaUtilizador.deleteUser")}
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={saving || deleting}
                    >
                      <i className="bi bi-save"></i>
                      {saving ? t("admin.common.saving") : t("admin.fichaUtilizador.saveChanges")}
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

function RoleBadge({ role, t }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        roleStyles[role] || "bg-slate-50 text-slate-700 ring-slate-200"
      }`}
    >
      {roleKeys[role] ? t(roleKeys[role]) : role || t("admin.fichaUtilizador.roles.none")}
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
