import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function GestaoPedidosBadges() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("all");
  const [showDetails, setShowDetails] = useState(null);

  const token = localStorage.getItem("token");

  // Simular dados de pedidos de badges
  const mockPedidos = [
    {
      id: 1,
      userName: "João Silva",
      badgeName: "Certificação Azure",
      area: "Cloud",
      status: "pending",
      dataPedido: "2024-01-10",
      prazo: "2024-01-17",
      descricao: "Certificação AZ-900 Microsoft Azure",
      evidencia: "https://example.com/cert1.pdf"
    },
    {
      id: 2,
      userName: "Maria Santos",
      badgeName: "React Advanced",
      area: "Frontend",
      status: "approved",
      dataPedido: "2024-01-08",
      prazo: "2024-01-15",
      descricao: "Certificação React Advanced",
      evidencia: "https://example.com/cert2.pdf"
    },
    {
      id: 3,
      userName: "Pedro Costa",
      badgeName: "DevOps Master",
      area: "DevOps",
      status: "rejected",
      dataPedido: "2024-01-12",
      prazo: "2024-01-19",
      descricao: "Certificação DevOps",
      evidencia: "https://example.com/cert3.pdf"
    },
    {
      id: 4,
      userName: "Ana Oliveira",
      badgeName: "Java Specialist",
      area: "Backend",
      status: "pending",
      dataPedido: "2024-01-11",
      prazo: "2024-01-18",
      descricao: "Certificação Java Specialist",
      evidencia: "https://example.com/cert4.pdf"
    },
    {
      id: 5,
      userName: "Carlos Mendes",
      badgeName: "SQL Expert",
      area: "Database",
      status: "approved",
      dataPedido: "2024-01-07",
      prazo: "2024-01-14",
      descricao: "Certificação SQL Expert",
      evidencia: "https://example.com/cert5.pdf"
    },
  ];

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setPedidos(mockPedidos);
      setLoading(false);
    }, 500);
  }, []);

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === "all") return true;
    return p.status === filtro;
  });

  // Aprovar pedido
  const handleAprovPedido = async (id) => {
    if (!window.confirm("Tem a certeza que deseja aprovar este pedido?")) return;

    try {
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p));
      setShowDetails(null);
      alert("Pedido aprovado com sucesso!");
    } catch (err) {
      console.error("Erro ao aprovar pedido:", err);
      alert("Erro ao aprovar pedido.");
    }
  };

  // Rejeitar pedido
  const handleRejectPedido = async (id) => {
    if (!window.confirm("Tem a certeza que deseja rejeitar este pedido?")) return;

    try {
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: "rejected" } : p));
      setShowDetails(null);
      alert("Pedido rejeitado com sucesso!");
    } catch (err) {
      console.error("Erro ao rejeitar pedido:", err);
      alert("Erro ao rejeitar pedido.");
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case "pending":
        return { color: "warning", label: "Pendente", icon: "bi-hourglass-split" };
      case "approved":
        return { color: "success", label: "Aprovado", icon: "bi-check-circle" };
      case "rejected":
        return { color: "danger", label: "Rejeitado", icon: "bi-x-circle" };
      default:
        return { color: "secondary", label: "Desconhecido", icon: "bi-question-circle" };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        {/* Header */}
        <div className="mb-4">
          <h3 className="fw-bold text-dark mb-0">
            <i className="bi bi-inbox me-2" style={{ color: "#0dcaf0" }}></i>
            Gestão de Pedidos de Badges
          </h3>
          <p className="text-muted small mt-1">Consultar e gerir pedidos de badges (cursos, certificações, atribuições)</p>
        </div>

        {/* Filtros e Estatísticas */}
        <div className="row mb-4 g-3">
          <div className="col-auto">
            <div className="btn-group" role="group">
              <input
                type="radio"
                className="btn-check"
                name="filtroPedidos"
                id="filtroAll"
                value="all"
                checked={filtro === "all"}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <label className="btn btn-outline-secondary" htmlFor="filtroAll">
                Todos ({pedidos.length})
              </label>

              <input
                type="radio"
                className="btn-check"
                name="filtroPedidos"
                id="filtroPending"
                value="pending"
                checked={filtro === "pending"}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <label className="btn btn-outline-warning" htmlFor="filtroPending">
                <i className="bi bi-hourglass-split me-1"></i>
                Pendentes ({pedidos.filter(p => p.status === "pending").length})
              </label>

              <input
                type="radio"
                className="btn-check"
                name="filtroPedidos"
                id="filtroApproved"
                value="approved"
                checked={filtro === "approved"}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <label className="btn btn-outline-success" htmlFor="filtroApproved">
                <i className="bi bi-check-circle me-1"></i>
                Aprovados ({pedidos.filter(p => p.status === "approved").length})
              </label>

              <input
                type="radio"
                className="btn-check"
                name="filtroPedidos"
                id="filtroRejected"
                value="rejected"
                checked={filtro === "rejected"}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <label className="btn btn-outline-danger" htmlFor="filtroRejected">
                <i className="bi bi-x-circle me-1"></i>
                Rejeitados ({pedidos.filter(p => p.status === "rejected").length})
              </label>
            </div>
          </div>
        </div>

        {/* Tabela de Pedidos */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">A carregar pedidos...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "20%" }}>Utilizador</th>
                    <th style={{ width: "20%" }}>Badge</th>
                    <th style={{ width: "15%" }}>Área</th>
                    <th style={{ width: "15%" }}>Status</th>
                    <th style={{ width: "15%" }}>Data Pedido</th>
                    <th style={{ width: "15%" }}>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosFiltrados.map((pedido) => {
                    const status = statusBadge(pedido.status);
                    return (
                      <tr key={pedido.id} style={{ borderColor: "#e9ecef" }}>
                        <td className="py-3">
                          <strong>{pedido.userName}</strong>
                        </td>
                        <td className="py-3">
                          {pedido.badgeName}
                        </td>
                        <td className="py-3">
                          <span style={{ color: "#6b8cae" }}>
                            {pedido.area}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`badge bg-${getStatusColor(pedido.status)}`}>
                            <i className={`bi ${status.icon} me-1`}></i>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <small>{new Date(pedido.dataPedido).toLocaleDateString('pt-PT')}</small>
                        </td>
                        <td className="py-3">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setShowDetails(pedido)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {pedidosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        Nenhum pedido encontrado com esses critérios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalhes do Pedido */}
      {showDetails && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050
          }}
        >
          <div className="modal-dialog" style={{ maxWidth: "600px" }}>
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header border-0 bg-light">
                <div>
                  <h5 className="modal-title fw-bold mb-0">Detalhes do Pedido</h5>
                  <small className="text-muted">ID: {showDetails.id}</small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetails(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* Informações do Pedido */}
                <div className="mb-4 p-3 bg-light rounded-3">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <small className="text-muted fw-semibold">Utilizador</small>
                      <p className="mb-0"><strong>{showDetails.userName}</strong></p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted fw-semibold">Badge Solicitado</small>
                      <p className="mb-0"><strong>{showDetails.badgeName}</strong></p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <small className="text-muted fw-semibold">Área</small>
                      <p className="mb-0">{showDetails.area}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted fw-semibold">Status</small>
                      <p className="mb-0">
                        <span className={`badge bg-${getStatusColor(showDetails.status)}`}>
                          {statusBadge(showDetails.status).label}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted fw-semibold">Data do Pedido</small>
                      <p className="mb-0">{new Date(showDetails.dataPedido).toLocaleDateString('pt-PT')}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted fw-semibold">Prazo (SLA)</small>
                      <p className="mb-0" style={{ color: new Date(showDetails.prazo) < new Date() ? "#dc3545" : "#198754" }}>
                        {new Date(showDetails.prazo).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Descrição e Evidência */}
                <div className="mb-4">
                  <label className="fw-semibold mb-2">Descrição</label>
                  <p style={{ color: "#6b8cae" }}>{showDetails.descricao}</p>
                </div>

                <div className="mb-4">
                  <label className="fw-semibold mb-2">Evidência/Documento</label>
                  <div className="p-3 bg-light rounded-3 text-center">
                    <a href={showDetails.evidencia} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-file-pdf me-1"></i>
                      Ver Documento
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer com Ações */}
              {showDetails.status === "pending" && (
                <div className="modal-footer border-0 bg-light">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleRejectPedido(showDetails.id)}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Rejeitar
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => handleAprovPedido(showDetails.id)}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    Aprovar
                  </button>
                </div>
              )}

              {showDetails.status !== "pending" && (
                <div className="modal-footer border-0 bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDetails(null)}
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
