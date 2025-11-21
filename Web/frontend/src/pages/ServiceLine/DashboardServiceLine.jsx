import { useEffect, useState } from "react";
import axios from "axios";
import SidebarSL from "../../components/SidebarSL";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function DashboardServiceLine() {
  const [sl, setSL] = useState(null);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Carregar saudação guardada no login
    const msg = localStorage.getItem("greeting");
    if (msg) setGreeting(msg);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function load() {
      try {
        const me = await axios.get(
          "http://localhost:4000/api/sl/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const stats = await axios.get(
          "http://localhost:4000/api/sl/estatisticas",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSL(me.data);
        setDados(stats.data);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="p-4">A carregar...</div>;
  if (!sl) return <div className="p-4">Erro ao carregar dados.</div>;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <SidebarSL />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>

        {/* Cabeçalho com saudação */}
        <div
          className="rounded-4 p-4 mb-4 shadow-sm"
          style={{ backgroundColor: "#191970", color: "#fff" }}
        >
          <h3 className="fw-bold mb-1">
            {greeting} {sl.name?.split(" ")[0]}!
          </h3>
          <p className="mb-0">Estatísticas da tua Service Line.</p>
        </div>

        <div className="row g-4 mb-4">

          <div className="col-md-4">
            <div className="card p-4 shadow-sm rounded-4 text-center">
              <i className="bi bi-person-badge-fill fs-3 text-primary mb-2"></i>
              <h3>{dados.totalConsultores}</h3>
              <p className="text-muted">Consultores</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-4 shadow-sm rounded-4 text-center">
              <i className="bi bi-book-fill fs-3 text-info mb-2"></i>
              <h3>{dados.cursosAtivos}</h3>
              <p className="text-muted">Cursos Ativos</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-4 shadow-sm rounded-4 text-center">
              <i className="bi bi-patch-exclamation-fill fs-3 text-warning mb-2"></i>
              <h3>{dados.badgesPendentes}</h3>
              <p className="text-muted">Badges Pendentes</p>
            </div>
          </div>

        </div>

        {/* Progresso Global */}
        <div className="card p-4 mb-4 shadow-sm rounded-4">
          <h5 className="fw-bold text-dark mb-2">Progresso Global</h5>

          <div className="progress" style={{ height: "8px" }}>
            <div
              className="progress-bar"
              style={{ width: `${dados.progressoMedio}%`, backgroundColor: "#191970" }}
            ></div>
          </div>

          <p className="text-muted small mt-2">
            Progresso médio de todos os consultores.
          </p>
        </div>

      </main>
    </div>
  );
}
