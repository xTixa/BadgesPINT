import { useEffect, useState } from "react";
import axios from "axios";
import SidebarTM from "../../components/SidebarTM";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function DashboardTalentManager() {
  const [manager, setManager] = useState(null);
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function loadData() {
      try {
        const me = await axios.get(
          "http://localhost:4000/api/tm/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const stats = await axios.get(
          "http://localhost:4000/api/tm/estatisticas",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setManager(me.data);
        setMetricas(stats.data);

      } catch (err) {
        console.error("Erro ao carregar TM:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <div className="p-4">A carregar...</div>;
  if (!manager) return <div className="p-4">Erro ao carregar dados.</div>;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <SidebarTM />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>

        <div className="rounded-4 p-4 mb-4 shadow-sm"
             style={{ backgroundColor: "#191970", color: "#fff" }}>
          <h3 className="fw-bold mb-1">Olá, {manager.name.split(" ")[0]}</h3>
          <p className="mb-0">Aqui está a visão geral da tua equipa.</p>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card p-4 shadow-sm rounded-4 text-center">
              <i className="bi bi-people-fill fs-3 text-primary mb-2"></i>
              <h3 className="fw-bold">{metricas.totalEquipa}</h3>
              <p className="text-muted">Membros na equipa</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-4 shadow-sm rounded-4 text-center">
              <i className="bi bi-folder-check fs-3 text-warning mb-2"></i>
              <h3 className="fw-bold">{metricas.evidenciasPendentes}</h3>
              <p className="text-muted">Evidências pendentes</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-4 shadow-sm rounded-4 text-center">
              <i className="bi bi-graph-up-arrow fs-3 text-success mb-2"></i>
              <h3 className="fw-bold">{metricas.progressoMedio}%</h3>
              <p className="text-muted">Progresso médio</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
