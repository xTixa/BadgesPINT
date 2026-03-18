import Sidebar from "../../layout/Sidebar";
import { useMemo, useState } from "react";
import axios from "axios";

const tipos = {
  info: { label: "Informação", cor: "info" },
  success: { label: "Sucesso", cor: "success" },
  warning: { label: "Aviso", cor: "warning" },
  danger: { label: "Crítico", cor: "danger" }
};

const tipoBadgeClass = {
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

export default function Avisos() {
  const [avisos, setAvisos] = useState([
    { id: 1, texto: "Manutenção programada para 20/02.", tipo: "info", publico: "Todos", agenda: "2024-02-20" },
    { id: 2, texto: "Novos badges foram adicionados.", tipo: "success", publico: "Consultores", agenda: "2024-02-10" },
    { id: 3, texto: "Learning Path 'DevOps' foi atualizado.", tipo: "warning", publico: "Service Line", agenda: "2024-02-12" },
  ]);

  const [form, setForm] = useState({ texto: "", tipo: "info", publico: "Todos", agenda: "" });
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState(false);

  const filtrados = useMemo(() => {
    return avisos.filter((a) => (filtro === "todos" ? true : a.tipo === filtro));
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
      await axios.post(
        "http://localhost:4000/api/notifications/broadcast",
        {
          titulo: `${tipos[form.tipo].label}: ${form.texto.substring(0, 30)}...`,
          mensagem: form.texto,
          roles: roles.length > 0 ? roles : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Aviso enviado com sucesso!");
      
      // Adicionar à lista local
      const novo = { ...form, id: Date.now() };
      setAvisos((prev) => [novo, ...prev]);
      setForm({ texto: "", tipo: "info", publico: "Todos", agenda: "" });
    } catch (error) {
      console.error("Erro ao enviar aviso:", error);
      alert("Erro ao enviar aviso: " + (error.response?.data?.message || error.message));
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="m-0 text-xl font-bold text-slate-900 sm:text-2xl">
            <i className="bi bi-megaphone-fill mr-2 text-rose-600"></i>
            Avisos
          </h3>
          <div className="flex flex-wrap gap-2" role="group">
            <button
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition sm:text-sm ${
                filtro === "todos" ? "bg-slate-600 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setFiltro("todos")}
            >
              Todos
            </button>
            {Object.keys(tipos).map((t) => (
              <button
                key={t}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition sm:text-sm ${
                  filtro === t ? tipoBadgeClass[t] : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setFiltro(t)}
              >
                {tipos[t].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h6 className="mb-3 text-sm font-semibold text-slate-900 sm:text-base">Novo aviso</h6>
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
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Tipo</label>
                      <select
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                        value={form.tipo}
                        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                      >
                        {Object.keys(tipos).map((t) => (
                          <option key={t} value={t}>{tipos[t].label}</option>
                        ))}
                      </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Público</label>
                      <select
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                        value={form.publico}
                        onChange={(e) => setForm({ ...form, publico: e.target.value })}
                      >
                        <option>Todos</option>
                        <option>Consultores</option>
                        <option>Talent Managers</option>
                        <option>Service Line</option>
                      </select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-sm font-semibold text-slate-700">Agendar</label>
                    <input
                      type="date"
                    className="w-[200px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                      value={form.agenda}
                      onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                    />
                  <button type="submit" className="ml-auto rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60" disabled={loading}>
                      {loading ? (
                        <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-r-transparent"></span>
                          A enviar...
                        </>
                      ) : (
                        <>
                        <i className="bi bi-send-fill mr-1" /> Guardar e enviar aviso
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          <div>
            <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h6 className="mb-3 text-sm font-semibold text-slate-900 sm:text-base">Resumo</h6>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {Object.keys(tipos).map((t) => (
                  <div key={t} className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="mb-1 text-xs text-slate-500">{tipos[t].label}</p>
                    <h5 className="m-0 text-lg font-bold text-slate-900">{avisos.filter((a) => a.tipo === t).length}</h5>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {filtrados.map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${tipoBadgeClass[a.tipo]}`}>{tipos[a.tipo].label}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">{a.texto}</div>
                  <div className="text-xs text-slate-500">{a.publico} · {a.agenda || "Imediato"}</div>
                </div>
                <div className="flex gap-2" role="group">
                  <button className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setForm({ texto: a.texto, tipo: a.tipo, publico: a.publico, agenda: a.agenda })}>
                    Editar
                  </button>
                  <button className="rounded-lg border border-rose-500 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50" onClick={() => remover(a.id)}>Apagar</button>
                </div>
              </li>
            ))}
            {!filtrados.length && (
              <li className="px-4 py-4 text-center text-sm text-slate-500">Nenhum aviso neste filtro.</li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}


