import dotenv from "dotenv";
dotenv.config();

import {
  sendPasswordResetEmail,
  sendTemporaryPasswordEmail,
  sendBadgeApplicationEmail,
  sendBadgeApprovedEmail,
  sendBadgeRejectedEmail,
  isEmailConfigured,
} from "./src/services/mailService.js";

const testEmail = process.argv[2] || "projetopint2526@sapo.pt";
const testType = process.argv[3] || "all";

const tests = {
  async password_reset() {
    console.log("📧 Enviando: Email de Reset de Password...");
    await sendPasswordResetEmail({
      to: testEmail,
      name: "João Silva",
      token: "abc123def456",
    });
  },

  async temporary_password() {
    console.log("📧 Enviando: Email de Password Temporária...");
    await sendTemporaryPasswordEmail({
      to: testEmail,
      name: "Maria Santos",
      temporaryPassword: "TempPass123!",
    });
  },

  async badge_application() {
    console.log("📧 Enviando: Email de Candidatura a Badge...");
    await sendBadgeApplicationEmail({
      to: testEmail,
      name: "Carlos Costa",
      badgeName: "React Developer",
    });
  },

  async badge_approved() {
    console.log("📧 Enviando: Email de Badge Aprovado...");
    await sendBadgeApprovedEmail({
      to: testEmail,
      name: "Ana Oliveira",
      badgeName: "Node.js Backend",
    });
  },

  async badge_rejected() {
    console.log("📧 Enviando: Email de Badge Rejeitado...");
    await sendBadgeRejectedEmail({
      to: testEmail,
      name: "Pedro Martins",
      badgeName: "DevOps Engineer",
      comment: "Evidências insuficientes para este nível",
    });
  },
};

async function runTests() {
  if (!isEmailConfigured()) {
    console.error("  Email NÃO está configurado no .env\n");
    process.exit(1);
  }

  console.log("\n   Teste de Templates de Email");
  console.log("================================\n");
  console.log(`Para: ${testEmail}\n`);

  const testsToRun = testType === "all" ? Object.keys(tests) : [testType];

  for (const type of testsToRun) {
    if (!tests[type]) {
      console.error(`   Teste desconhecido: ${type}`);
      console.log("\nTestes disponíveis:");
      Object.keys(tests).forEach((t) => console.log(`  - ${t}`));
      process.exit(1);
    }

    try {
      await tests[type]();
      console.log(`   ${type} enviado com sucesso!\n`);
    } catch (error) {
      console.error(`   Erro ao enviar ${type}:`);
      console.error(`   ${error.message}\n`);
    }
  }

  console.log("   Testes concluídos!");
}

console.log(`\nUso: node test-email-templates.js [email] [tipo]\n`);
console.log(`Exemplos:`);
console.log(`  node test-email-templates.js seu-email@example.com all`);
console.log(`  node test-email-templates.js seu-email@example.com password_reset`);
console.log(`  node test-email-templates.js seu-email@example.com badge_approved\n`);

runTests().catch(console.error);
