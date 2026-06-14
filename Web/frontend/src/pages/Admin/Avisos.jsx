import Sidebar from "../../layout/Sidebar";
import { useMemo, useState } from "react";
import api from "/src/api";

const tipos = {
  info: { label: "Informação", cor: "info" },
  success: { label: "Sucesso", cor: "success" },
  warning: { label: "Aviso", cor: "warning" },
  danger: { label: "Crítico", cor: "danger" },
};

const tipoBadgeClass = {
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

export default function Avisos() {
  const [avisos, setAvisos] = useState([
    {
      id: 1,
      texto: "Manutenção programada para 20/02.",
      tipo: "info",
      publico: "Todos",
      agenda: "2024-02-20",
    },
    {
      id: 2,
      texto: "Novos badges foram adicionados.",
      tipo: "success",
      publico: "Consultores",
      agenda: "2024-02-10",
    },
    {
      id: 3,
      texto: "Learning Path 'DevOps' foi atualizado.",
      tipo: "warning",
      publico: "Service Line",
      agenda: "2024-02-12",
    },
  ]);

  const [form, setForm] = useState({
    texto: "",
    tipo: "info",
    publico: "Todos",
    agenda: "",
  });
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState(false);

  const filtrados = useMemo(() => {
    return avisos.filter((a) =>
      filtro === "todos" ? true : a.tipo === filtro,
    );
  }, [avisos, filtro]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.texto.trim()) return alert("Escreva o aviso.");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Mapear público para roles
      let roles = [];
      if (form.publico === "Consultores") roles = ["consultant"];
      else if (form.publico === "Talent Managers") roles = ["talent_manager"];
      else if (form.publico === "Service Line") roles = ["service_line_leader"];
      // Se "Todos", roles fica vazio (envia para todos)

      // Enviar via API
      await api.post(
        "/api/notifications/broadcast",
        {
          titulo: `${tipos[form.tipo].label}: ${form.texto.substring(0, 30)}...`,
          mensagem: form.texto,
          roles: roles.length > 0 ? roles : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("✅ Aviso enviado com sucesso!");

      // Adicionar à lista local
      const novo = { ...form, id: Date.now() };
      setAvisos((prev) => [novo, ...prev]);
      setForm({ texto: "", tipo: "info", publico: "Todos", agenda: "" });
    } catch (error) {
      console.error("Erro ao enviar aviso:", error);
      alert(
        "Erro ao enviar aviso: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const remover = (id) => {
    if (!window.confirm("Apagar aviso?")) return;
    setAvisos((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main">
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold">Centro de Avisos</h1>

            <p className="mt-2 text-white/80">
              Gere comunicações, alertas e notificações para toda a plataforma.
            </p>
          </div>
        </div>
        <div className="mb-8 grid gap-5 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <p className="text-sm text-slate-500">Total Avisos</p>

            <h3 className="mt-2 text-3xl font-bold text-[#0F62FE]">
              {avisos.length}
            </h3>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <p className="text-sm text-slate-500">Informação</p>

            <h3 className="mt-2 text-3xl font-bold text-sky-600">
              {avisos.filter((a) => a.tipo === "info").length}
            </h3>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <p className="text-sm text-slate-500">Avisos</p>

            <h3 className="mt-2 text-3xl font-bold text-amber-600">
              {avisos.filter((a) => a.tipo === "warning").length}
            </h3>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <p className="text-sm text-slate-500">Críticos</p>

            <h3 className="mt-2 text-3xl font-bold text-rose-600">
              {avisos.filter((a) => a.tipo === "danger").length}
            </h3>
          </div>
        </div>

        <div className="mb-8">
          <div>
            <div className="h-full rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
              <h2 className="mb-5 text-xl font-bold text-slate-900">
                Novo aviso
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <textarea
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  rows="3"
                  placeholder="Mensagem a comunicar"
                  value={form.texto}
                  onChange={(e) => setForm({ ...form, texto: e.target.value })}
                />
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Tipo
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                      value={form.tipo}
                      onChange={(e) =>
                        setForm({ ...form, tipo: e.target.value })
                      }
                    >
                      {Object.keys(tipos).map((t) => (
                        <option key={t} value={t}>
                          {tipos[t].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Público
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                      value={form.publico}
                      onChange={(e) =>
                        setForm({ ...form, publico: e.target.value })
                      }
                    >
                      <option>Todos</option>
                      <option>Consultores</option>
                      <option>Talent Managers</option>
                      <option>Service Line</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Agendar
                  </label>
                  <input
                    type="date"
                    className="w-[200px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    value={form.agenda}
                    onChange={(e) =>
                      setForm({ ...form, agenda: e.target.value })
                    }
                  />
                  <button
                    type="submit"
                    className="ml-auto rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-r-transparent"></span>
                        A enviar...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill mr-1" /> Guardar e enviar
                        aviso
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>

          <input
            type="text"
            placeholder="Pesquisar aviso..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-4 p-4">
            {filtrados.map((a) => (
              <div
                key={a.id}
                className="rounded-3xl border border-slate-100 bg-white p-5 transition hover:shadow-md"
              >
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${tipoBadgeClass[a.tipo]}`}
                >
                  {tipos[a.tipo].label}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">
                    {a.texto}
                  </div>
                  <div className="text-xs text-slate-500">
                    {a.publico} · {a.agenda || "Imediato"}
                  </div>
                </div>
                <div className="flex gap-2" role="group">
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() =>
                      setForm({
                        texto: a.texto,
                        tipo: a.tipo,
                        publico: a.publico,
                        agenda: a.agenda,
                      })
                    }
                  >
                    Editar
                  </button>
                  <button
                    className="rounded-lg border border-rose-500 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                    onClick={() => remover(a.id)}
                  >
                    Apagar
                  </button>
                </div>
              </div>
            ))}
            {!filtrados.length && (
              <div className="rounded-3xl border border-slate-100 bg-white p-5 transition hover:shadow-md">
                Nenhum aviso neste filtro.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
