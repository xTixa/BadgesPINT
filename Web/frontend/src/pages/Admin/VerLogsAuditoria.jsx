import Sidebar from "../../layout/Sidebar";
import React from "react";
import LogsAuditoria from "./LogsAuditoria";

export default function VerLogsAuditoria() {
  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />
      
      <main className="admin-main bg-[#F6F8FA]">
        <div className="w-full">
          <LogsAuditoria />
        </div>
      </main>
    </div>
  );
}


