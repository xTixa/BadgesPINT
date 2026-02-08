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
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Carregar pedidos do backend
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = filtro === "all" 
          ? "http://localhost:4000/api/admin/pedidos"
          : `http://localhost:4000/api/admin/pedidos?status=${filtro === "pending" ? "pendente" : filtro === "approved" ? "obtido" : "rejeitado"}`;

        const response = await axios.get(url, {
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
  }, [filtro, token]);

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === "all") return true;
    return p.status === filtro;
  });

  // Aprovar pedido
  const handleAprovPedido = async (id) => {
    if (!window.confirm("Tem a certeza que deseja aprovar este pedido?")) return;

    try {
      await axios.post(`http://localhost:4000/api/admin/pedidos/${id}/aprovar`, {}, {
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
      await axios.post(`http://localhost:4000/api/admin/pedidos/${id}/rejeitar`, {}, {
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
                        <small>{pedido.dataPedido}</small>
                      </td>
                      <td className="py-3">
                        {pedido.status === "pending" && (
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
