import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from "../../components/sidebar/sidebar";
import LogsAuditoria from "./LogsAuditoria";

export default function VerLogsAuditoria() {
  return (
    <div style={{ display: "flex", backgroundColor: "#e8eef5", minHeight: "100vh" }}>
      <Sidebar user={{ role: "admin", name: "Admin" }} />
      
      <main style={{ flex: 1, padding: "2rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <LogsAuditoria />
        </div>
      </main>
    </div>
  );
}
