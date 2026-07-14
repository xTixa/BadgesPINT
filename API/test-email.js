import dotenv from "dotenv";
dotenv.config();

import { sendMail, isEmailConfigured } from "./src/services/mailService.js";

async function testEmail() {
  console.log("\n📧 Teste de Email SMTP");
  console.log("======================\n");

  // Verificar configuração
  if (!isEmailConfigured()) {
    console.error("  Email NÃO está configurado.");
    console.error("\nVariáveis necessárias no .env:");
    console.error("  - SMTP_HOST");
    console.error("  - SMTP_PORT");
    console.error("  - SMTP_USER");
    console.error("  - SMTP_PASS");
    console.error("  - SMTP_FROM");
    process.exit(1);
  }

  console.log("   Configuração de email detectada");
  console.log(`   Host: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  console.log(`   De: ${process.env.SMTP_FROM}\n`);

  const testEmail = process.argv[2] || "projetopint2526@sapo.pt";

  try {
    console.log(`📤 Enviando email de teste para: ${testEmail}\n`);

    const info = await sendMail({
      to: testEmail,
      subject: "🎉 Teste SMTP - Badges Softinsa",
      text: "Este é um email de teste da plataforma Badges Softinsa. Se recebeste, a configuração SMTP está funcionando!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🎉 Teste de Email</h2>
          <p>Este é um email de teste da plataforma <strong>Badges Softinsa</strong>.</p>
          <p style="background: #f0f0f0; padding: 15px; border-radius: 5px;">
            Se recebeste este email, a configuração SMTP está <strong style="color: green;">✅ funcionando corretamente!</strong>
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            Configuração utilizada:<br>
            Host: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}<br>
            Secure: ${process.env.SMTP_SECURE === "true" ? "Sim" : "Não"}
          </p>
        </div>
      `,
    });

    console.log("Email enviado com SUCESSO!\n");
    console.log("Detalhes:");
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  Para: ${info.accepted?.join(", ")}`);
    if (info.rejected?.length) {
      console.log(`  Rejeitados: ${info.rejected?.join(", ")}`);
    }

  } catch (error) {
    console.error("   Erro ao enviar email:\n");
    console.error(`   Mensagem: ${error.message}`);
    console.error(`   Código: ${error.code || "N/A"}`);
    console.error(`   Comando: ${error.command || "N/A"}`);
    console.error(`   Resposta: ${error.response || "N/A"}`);

    console.error("\n   Possíveis soluções:");
    if (error.message.includes("ECONNREFUSED")) {
      console.error("   - Servidor SMTP indisponível");
    } else if (error.message.includes("authentication")) {
      console.error("   - Credenciais SMTP incorretas (SMTP_USER ou SMTP_PASS)");
    } else if (error.message.includes("550")) {
      console.error("   - Email inválido ou rejeitado pelo servidor");
    }
  }
}

testEmail();
