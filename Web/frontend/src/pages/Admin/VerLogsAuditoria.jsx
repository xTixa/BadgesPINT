import Sidebar from "../../layout/Sidebar";
import React from "react";
import LogsAuditoria from "./LogsAuditoria";

export default function VerLogsAuditoria() {
  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />
      
      <main className="admin-main">
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <LogsAuditoria />
        </div>
      </main>
    </div>
  );
}


