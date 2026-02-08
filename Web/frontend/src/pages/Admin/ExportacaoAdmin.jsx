import { useState } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/sidebar";

export default function ExportacaoAdmin() {
  const [format, setFormat] = useState("excel");
  const [scope, setScope] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [lastExport, setLastExport] = useState(null);
  const [dateRange, setDateRange] = useState("ultimo-mes");
  const [error, setError] = useState(null);

  const getDateRange = () => {
    const end = new Date();
    let start = new Date();

    switch (dateRange) {
      case "ultima-semana":
        start.setDate(start.getDate() - 7);
        break;
      case "ultimo-mes":
        start.setMonth(start.getMonth() - 1);
        break;
      case "ultimo-trimestre":
        start.setMonth(start.getMonth() - 3);
        break;
      case "ano-atual":
        start = new Date(new Date().getFullYear(), 0, 1);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }

    return { start, end };
  };

  const handleExport = async () => {
    if (!scope) {
      setError("Por favor, selecione um âmbito de exportação.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const { start, end } = getDateRange();

      const endpoint = format === "excel" 
        ? "http://localhost:4000/api/admin/export/excel"
        : "http://localhost:4000/api/admin/export/pdf";

      const response = await axios.post(
        endpoint,
        {
          scope,
          startDate: start.toISOString(),
          endDate: end.toISOString()
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob"
        }
      );

      // Criar download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `export-${scope}-${new Date().getTime()}.${format === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setLastExport({
        formato: format,
        abrangencia: scope,
        data: new Date().toLocaleString("pt-PT"),
        ficheiro: `export-${scope}-${new Date().getTime()}.${format === "excel" ? "xlsx" : "pdf"}`
      });

    } catch (err) {
      console.error("Erro na exportação:", err);
      setError(err.response?.data?.message || "Erro ao exportar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: "Tudo", desc: "Todos os dados disponíveis", icon: "bi-database-fill", value: "todos" },
    { title: "Utilizadores", desc: "Dados completos e perfis", icon: "bi-people-fill", value: "users" },
    { title: "Badges", desc: "Catálogo e requisitos", icon: "bi-award-fill", value: "badges" },
    { title: "Pedidos", desc: "Fluxos de aprovação", icon: "bi-hourglass-split", value: "pedidos" },
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-0">
              <i className="bi bi-file-earmark-arrow-down text-success me-2" />
              Exportação de Dados
            </h3>
            <p className="text-muted small mt-1">Gerar relatórios para Excel ou PDF com um clique.</p>
          </div>
          <div className="btn-group" role="group">
            <input
              type="radio"
              className="btn-check"
              name="format"
              id="fmtExcel"
              value="excel"
              checked={format === "excel"}
              onChange={(e) => setFormat(e.target.value)}
            />
            <label className="btn btn-outline-success" htmlFor="fmtExcel">Excel</label>

            <input
              type="radio"
              className="btn-check"
              name="format"
              id="fmtPdf"
              value="pdf"
              checked={format === "pdf"}
              onChange={(e) => setFormat(e.target.value)}
            />
            <label className="btn btn-outline-danger" htmlFor="fmtPdf">PDF</label>
          </div>
        </div>

        <div className="row g-3 mb-4">
          {cards.map((card) => (
            <div key={card.value} className="col-md-3">
              <div
                className={`card h-100 shadow-sm border-0 ${scope === card.value ? "border border-success" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => setScope(card.value)}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{ width: 40, height: 40, backgroundColor: "#e8f5e9" }}>
                      <i className={`bi ${card.icon} text-success`}></i>
                    </div>
                    <h6 className="mb-0 fw-semibold">{card.title}</h6>
                  </div>
                  <p className="text-muted small mb-0">{card.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body">
            <h6 className="fw-semibold mb-3">Detalhes da exportação</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Intervalo temporal</label>
                <select 
                  className="form-select" 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="ultima-semana">Última semana</option>
                  <option value="ultimo-mes">Último mês</option>
                  <option value="ultimo-trimestre">Último trimestre</option>
                  <option value="ano-atual">Ano atual</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger mt-3 mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            <div className="d-flex justify-content-end mt-4 gap-2">
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => {
                  setLastExport(null);
                  setError(null);
                }}
              >
                Limpar histórico
              </button>
              <button
                className="btn btn-success"
                disabled={loading}
                onClick={handleExport}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    A gerar...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-arrow-down me-2" />
                    Exportar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {lastExport && (
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            <div>
              Exportação pronta ({lastExport.formato.toUpperCase()}) | Âmbito: {lastExport.abrangencia} | Ficheiro: {lastExport.ficheiro} | {lastExport.data}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
