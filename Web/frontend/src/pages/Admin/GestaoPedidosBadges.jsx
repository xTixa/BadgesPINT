import { useEffect, useState } from "react";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";

export default function GestaoPedidosBadges() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("all");
  const [showDetails, setShowDetails] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const currentRole = storedUser ? JSON.parse(storedUser).role : "admin";
  const pedidosBaseUrl = currentRole === "admin" ? "/api/admin/pedidos" : "/api/admin/pedidos";

  // Carregar pedidos do backend
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = filtro === "all" 
          ? pedidosBaseUrl
          : `${pedidosBaseUrl}?status=${filtro === "pending" ? "pendente" : filtro === "approved" ? "obtido" : "rejeitado"}`;

        const response = await api.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Mapear dados do backend para o formato do frontend
        const pedidosFormatados = response.data.map(p => ({
          id: p.id,
          userName: p.user?.name || "Desconhecido",
          userEmail: p.user?.email || "",
          badgeName: p.badge?.name || "Desconhecido",
          badgeLevel: p.badge?.level || "",
          badgePoints: p.badge?.points || 0,
          status: p.status === "obtido" ? "approved" : p.status === "pendente" ? "pending" : "rejected",
          workflowStatus: p.workflow_status || "open",
          tmComment: p.tm_comment || "",
          slComment: p.sl_comment || "",
          dataPedido: new Date(p.created_at).toLocaleDateString("pt-PT"),
          dataAtribuicao: p.data_atribuicao ? new Date(p.data_atribuicao).toLocaleDateString("pt-PT") : "-"
        }));

        setPedidos(pedidosFormatados);
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
        setError("Erro ao carregar pedidos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
    const intervalId = window.setInterval(fetchPedidos, 15000);

    return () => window.clearInterval(intervalId);
  }, [filtro, token, pedidosBaseUrl]);

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === "all") return true;
    return p.status === filtro;
  });

  // Aprovar pedido
  const handleAprovPedido = async (id) => {
    if (!window.confirm("Tem a certeza que deseja aprovar este pedido?")) return;

    try {
      await api.post(`/api/admin/pedidos/${id}/aprovar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
      await api.post(`/api/admin/pedidos/${id}/rejeitar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

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

  const workflowBadge = (status) => {
    switch (status) {
      case "open":
        return { color: "secondary", label: "Open" };
      case "submitted":
        return { color: "warning", label: "Submitted" };
      case "em_validacao":
        return { color: "info", label: "Em Validação" };
      case "fechado":
        return { color: "success", label: "Fechado" };
      default:
        return { color: "secondary", label: "Open" };
    }
  };

  const handleTmValidar = async (id) => {
    const comment = window.prompt("Comentário (opcional):") || "";
    try {
      await api.post(`/api/admin/pedidos/${id}/tm/validar`, { comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, workflowStatus: "em_validacao", tmComment: comment } : p));
    } catch (err) {
      console.error("Erro TM validar pedido:", err);
      alert("Erro ao validar pedido.");
    }
  };

  const handleTmDevolver = async (id) => {
    const comment = window.prompt("Comentário para devolução:") || "";
    if (!comment) return;
    try {
      await api.post(`/api/admin/pedidos/${id}/tm/devolver`, { comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, workflowStatus: "open", tmComment: comment } : p));
    } catch (err) {
      console.error("Erro TM devolver pedido:", err);
      alert("Erro ao devolver pedido.");
    }
  };

  const handleSlAprovar = async (id) => {
    const comment = window.prompt("Comentário (opcional):") || "";
    try {
      await api.post(`/api/admin/pedidos/${id}/sl/aprovar`, { comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, workflowStatus: "fechado", status: "approved", slComment: comment } : p));
    } catch (err) {
      console.error("Erro SL aprovar pedido:", err);
      alert("Erro ao aprovar pedido.");
    }
  };

  const handleSlRejeitar = async (id) => {
    const comment = window.prompt("Comentário (opcional):") || "";
    try {
      await api.post(`/api/admin/pedidos/${id}/sl/rejeitar`, { comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, workflowStatus: "fechado", status: "rejected", slComment: comment } : p));
    } catch (err) {
      console.error("Erro SL rejeitar pedido:", err);
      alert("Erro ao rejeitar pedido.");
    }
  };

  const handleSlDevolver = async (id) => {
    const comment = window.prompt("Comentário para devolução:") || "";
    if (!comment) return;
    try {
      await api.post(`/api/admin/pedidos/${id}/sl/devolver`, { comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, workflowStatus: "open", status: "pending", slComment: comment } : p));
    } catch (err) {
      console.error("Erro SL devolver pedido:", err);
      alert("Erro ao devolver pedido.");
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
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#F2F2F2" }}>
      <Sidebar user={{ role: currentRole, name: currentRole === "talent_manager" ? "Talent Manager" : currentRole === "service_line_leader" ? "Service Line" : "Admin" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        {/* Header */}
        <div className="mb-4">
          <h3 className="fw-bold text-dark mb-0">
            <i className="bi bi-inbox me-2" style={{ color: "#0dcaf0" }}></i>
            Gestão de Pedidos de Badges
          </h3>
          <p className="text-muted small mt-1">Consultar e gerir pedidos de badges (cursos, certificações, atribuições)</p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

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
          ) : pedidos.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: "3rem", color: "#ccc" }}></i>
              <p className="mt-3 text-muted">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "20%" }}>Utilizador</th>
                    <th style={{ width: "20%" }}>Badge</th>
                    <th style={{ width: "12%" }}>Nível</th>
                    <th style={{ width: "12%" }}>Status</th>
                    <th style={{ width: "12%" }}>Workflow</th>
                    <th style={{ width: "14%" }}>Data Pedido</th>
                    <th style={{ width: "22%" }}>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidos.filter(p => filtro === "all" ? true : p.status === filtro).map((pedido) => (
                    <tr key={pedido.id} style={{ borderColor: "#e9ecef" }}>
                      <td className="py-3">
                        <strong>{pedido.userName}</strong>
                        <br />
                        <small className="text-muted">{pedido.userEmail}</small>
                      </td>
                      <td className="py-3">
                        {pedido.badgeName}
                      </td>
                      <td className="py-3">
                        <span className="badge bg-info">{pedido.badgeLevel}</span>
                      </td>
                      <td className="py-3">
                        <span className={`badge bg-${pedido.status === "pending" ? "warning" : pedido.status === "approved" ? "success" : "danger"}`}>
                          {pedido.status === "pending" ? "Pendente" : pedido.status === "approved" ? "Aprovado" : "Rejeitado"}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`badge bg-${workflowBadge(pedido.workflowStatus).color}`}>
                          {workflowBadge(pedido.workflowStatus).label}
                        </span>
                      </td>
                      <td className="py-3">
                        <small>{pedido.dataPedido}</small>
                      </td>
                      <td className="py-3">
                        {currentRole === "admin" && pedido.status === "pending" && (
                          <>
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={() => handleAprovPedido(pedido.id)}
                            >
                              <i className="bi bi-check-circle me-1"></i>Aprovar
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRejectPedido(pedido.id)}
                            >
                              <i className="bi bi-x-circle me-1"></i>Rejeitar
                            </button>
                          </>
                        )}
                        {currentRole === "talent_manager" && pedido.workflowStatus === "submitted" && (
                          <>
                            <button className="btn btn-sm btn-success me-2" onClick={() => handleTmValidar(pedido.id)}>
                              <i className="bi bi-check-circle me-1"></i>Validar
                            </button>
                            <button className="btn btn-sm btn-warning" onClick={() => handleTmDevolver(pedido.id)}>
                              <i className="bi bi-arrow-counterclockwise me-1"></i>Devolver
                            </button>
                          </>
                        )}
                        {currentRole === "service_line_leader" && pedido.workflowStatus === "em_validacao" && (
                          <>
                            <button className="btn btn-sm btn-success me-2" onClick={() => handleSlAprovar(pedido.id)}>
                              <i className="bi bi-check-circle me-1"></i>Aprovar
                            </button>
                            <button className="btn btn-sm btn-danger me-2" onClick={() => handleSlRejeitar(pedido.id)}>
                              <i className="bi bi-x-circle me-1"></i>Rejeitar
                            </button>
                            <button className="btn btn-sm btn-warning" onClick={() => handleSlDevolver(pedido.id)}>
                              <i className="bi bi-arrow-counterclockwise me-1"></i>Devolver
                            </button>
                          </>
                        )}
                        {pedido.status === "approved" && (
                          <span className="text-success"><i className="bi bi-check2-all"></i> Processado</span>
                        )}
                        {pedido.status === "rejected" && (
                          <span className="text-danger"><i className="bi bi-x-lg"></i> Rejeitado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
