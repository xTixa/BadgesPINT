import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function PerfilConsultor() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [atividade] = useState([
    { id: 1, acao: "Conquistou o badge 'DevOps Intermédio'", data: "Há 2 dias" },
    { id: 2, acao: "Submeteu evidências para 'Outsystems Avançado'", data: "Há 5 dias" },
    { id: 3, acao: "Atualizou perfil profissional", data: "Há 1 semana" },
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:4000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({
          nome: response.data.name,
          cargo: getRoleLabel(response.data.role),
          email: response.data.email,
          localizacao: response.data.localizacao || "Não definida",
          imagem: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          pontos: response.data.points_total || 0,
          badges: response.data.badges || 0,
          progresso: response.data.progresso || 0,
          competencias: ["React", "DevOps", "Outsystems", "SQL"], // TODO: buscar da BD
        });
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        alert("Erro ao carregar perfil. Verifique a autenticação.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getRoleLabel = (role) => {
    const labels = {
      consultant: "Consultor",
      talent_manager: "Talent Manager",
      service_line_leader: "Service Line Leader",
      admin: "Administrador",
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="alert alert-danger">Erro ao carregar perfil</div>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      
      {/* Sidebar */}
      <Sidebar user={{ role: "consultant", name: user.nome }} />

      {/* Conteúdo */}
      <main
        className="flex-grow-1 p-5"
        style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}
      >
        {/* Cabeçalho */}
        <div
          className="rounded-4 p-4 mb-5 shadow-sm text-white d-flex align-items-center justify-content-between flex-wrap"
          style={{ backgroundColor: "#191970" }}
        >
          <div className="d-flex align-items-center">
            <img
              src={user.imagem}
              alt="Foto de perfil"
              className="rounded-circle me-4 border border-white"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
            <div>
              <h3 className="fw-bold mb-1">{user.nome}</h3>
              <p className="mb-0 text-light opacity-75">{user.cargo}</p>
            </div>
          </div>
          <div className="text-end mt-3 mt-md-0">
            <button 
              className="btn btn-light btn-sm fw-semibold"
              onClick={() => window.location.href = "/editar-perfil"}
            >
              <i className="bi bi-pencil-square me-2"></i>Editar Perfil
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 text-center py-3">
              <i className="bi bi-star-fill fs-3 text-warning mb-2"></i>
              <h5 className="fw-semibold text-dark mb-1">{user.pontos}</h5>
              <p className="text-muted small mb-0">Pontos Acumulados</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 text-center py-3">
              <i className="bi bi-award-fill fs-3 text-success mb-2"></i>
              <h5 className="fw-semibold text-dark mb-1">{user.badges}</h5>
              <p className="text-muted small mb-0">Badges Obtidos</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 text-center py-3">
              <i className="bi bi-graph-up-arrow fs-3 text-primary mb-2"></i>
              <h5 className="fw-semibold text-dark mb-1">{user.progresso}%</h5>
              <p className="text-muted small mb-0">Progresso Global</p>
            </div>
          </div>
        </div>

        {/* Informações Pessoais */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-person-lines-fill me-2 text-primary"></i>
              Informações Pessoais
            </h5>
            <div className="row">
              <div className="col-md-6">
                <p className="mb-1 text-muted small">Email</p>
                <p className="fw-semibold">{user.email}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-1 text-muted small">Localização</p>
                <p className="fw-semibold">{user.localizacao}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Competências */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-lightbulb-fill me-2 text-warning"></i>
              Competências
            </h5>
            <div className="d-flex flex-wrap gap-2">
              {user.competencias.map((comp, i) => (
                <span key={i} className="badge rounded-pill text-bg-primary px-3 py-2">
                  {comp}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-clock-history me-2 text-success"></i>
              Atividade Recente
            </h5>
            <ul className="list-group list-group-flush">
              {atividade.map((a) => (
                <li key={a.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-dark">{a.acao}</span>
                    <small className="text-muted">{a.data}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
