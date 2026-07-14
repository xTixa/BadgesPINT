// Shared PDF renderer for badge certificates
// Design: institutional navy + gold palette, A4, editorial layout

const P = {
  navy:   "#1A2F5E",
  navyMd: "#2D4A8A",
  gold:   "#C4962A",
  goldLt: "#F0DCA0",
  goldBg: "#FBF6E8",
  bg:     "#FDFCF8",
  bgCard: "#F8F5EC",
  dark:   "#1C2331",
  mid:    "#4A5568",
  gray:   "#94A3B8",
  white:  "#FFFFFF",
};

function drawDiamond(doc, cx, cy, r) {
  doc
    .moveTo(cx, cy - r)
    .lineTo(cx + r, cy)
    .lineTo(cx, cy + r)
    .lineTo(cx - r, cy)
    .closePath()
    .fill(P.gold);
}

/**
 * Renders a complete certificate onto an existing PDFDocument.
 * The document must be created with margin: 0.
 *
 * @param {object} params
 * @param {{ name: string }} params.consultor
 * @param {{ level?: string, points?: number, area?: { name: string } }} params.badge
 * @param {string} params.badgeName
 * @param {Date}   params.awardedAt
 * @param {string|null} params.certificateCode
 * @param {string|null} params.verificationUrl
 * @param {Buffer|null} params.badgeImageBuffer
 */
export function renderCertificatePdf(doc, {
  consultor,
  badge,
  badgeName,
  awardedAt,
  certificateCode,
  verificationUrl,
  badgeImageBuffer,
}) {
  // Validações básicas
  if (!doc) throw new Error("PDFDocument é obrigatório");
  if (!consultor || !consultor.name) throw new Error("Consultor sem nome");
  if (!badge) throw new Error("Badge é obrigatório");
  if (!badgeName) throw new Error("badgeName é obrigatório");
  if (!awardedAt) throw new Error("awardedAt é obrigatório");
  const W  = doc.page.width;
  const H  = doc.page.height;
  const BM = 44;

  // ── Background ──────────────────────────────────────────────
  doc.rect(0, 0, W, H).fill(P.bg);

  // ── Double-rule border ──────────────────────────────────────
  doc.rect(BM, BM, W - BM * 2, H - BM * 2)
    .lineWidth(2.2).strokeColor(P.navy).stroke();
  doc.rect(BM + 7, BM + 7, W - BM * 2 - 14, H - BM * 2 - 14)
    .lineWidth(0.7).strokeColor(P.gold).stroke();

  // ── Header band ─────────────────────────────────────────────
  const HH = 106;
  doc.rect(BM + 1, BM + 1, W - BM * 2 - 2, HH).fill(P.navy);

  // Gold diamond ornaments at header corners
  drawDiamond(doc, BM + 22, BM + 22, 7);
  drawDiamond(doc, W - BM - 22, BM + 22, 7);

  // Institution line
  doc.fillColor(P.goldLt).font("Helvetica").fontSize(7.5)
    .text(
      "SOFTINSA  ·  BADGESPINT  ·  PROGRAMA DE CERTIFICAÇÃO",
      BM, BM + 28,
      { width: W - BM * 2, align: "center", characterSpacing: 2 }
    );

  // Main title
  doc.fillColor(P.white).font("Helvetica-Bold").fontSize(25)
    .text(
      "CERTIFICADO DE CONCLUSÃO",
      BM, BM + 54,
      { width: W - BM * 2, align: "center", characterSpacing: 0.8 }
    );

  // Double gold rule below header
  const RY = BM + HH + 13;
  doc.moveTo(BM + 46, RY).lineTo(W - BM - 46, RY)
    .lineWidth(0.9).strokeColor(P.gold).stroke();
  doc.moveTo(BM + 54, RY + 5).lineTo(W - BM - 54, RY + 5)
    .lineWidth(0.3).strokeColor(P.gold).stroke();

  let Y = RY + 24;

  // ── Badge image (circular crop + gold ring) ─────────────────
  if (badgeImageBuffer) {
    const D   = 80;
    const icx = W / 2;
    const icy = Y + D / 2;
    try {
      doc.save().circle(icx, icy, D / 2).clip();
      doc.image(badgeImageBuffer, (W - D) / 2, Y, { width: D, height: D });
      doc.restore();
      doc.circle(icx, icy, D / 2 + 3).lineWidth(1.8).strokeColor(P.gold).stroke();
      Y += D + 22;
    } catch (imgErr) {
      doc.restore();
      console.warn("Aviso: não foi possível desenhar a imagem do badge no certificado:", imgErr.message);
    }
  }

  // ── "Certifica-se que" ──────────────────────────────────────
  doc.fillColor(P.mid).font("Helvetica").fontSize(11)
    .text("Certifica-se que", 0, Y, { width: W, align: "center" });
  Y += 21;

  // ── Recipient name (uppercase, navy, bold) ──────────────────
  doc.fillColor(P.navy).font("Helvetica-Bold").fontSize(24)
    .text(consultor.name.toUpperCase(), BM + 44, Y, {
      width: W - BM * 2 - 88, align: "center",
    });
  Y += 32;

  // Gold double underline beneath name
  const UW = 210, UX = (W - UW) / 2;
  doc.moveTo(UX, Y).lineTo(UX + UW, Y).lineWidth(1.1).strokeColor(P.gold).stroke();
  doc.moveTo(UX + 18, Y + 4).lineTo(UX + UW - 18, Y + 4)
    .lineWidth(0.3).strokeColor(P.gold).stroke();
  Y += 17;

  // ── "concluiu com sucesso..." ────────────────────────────────
  doc.fillColor(P.mid).font("Helvetica").fontSize(11)
    .text("concluiu com sucesso o badge de certificação", 0, Y, {
      width: W, align: "center",
    });
  Y += 22;

  // ── Badge name ───────────────────────────────────────────────
  doc.fillColor(P.navy).font("Helvetica-Bold").fontSize(19)
    .text(badgeName, BM + 32, Y, { width: W - BM * 2 - 64, align: "center" });
  Y += 27;

  // ── Level pill ───────────────────────────────────────────────
  if (badge.level) {
    const PW = 136, PH = 21, PX = (W - PW) / 2;
    doc.roundedRect(PX, Y, PW, PH, 10.5).lineWidth(0.8).fillAndStroke(P.goldBg, P.gold);
    doc.fillColor(P.navy).font("Helvetica-Bold").fontSize(8)
      .text(`NÍVEL  ·  ${badge.level.toUpperCase()}`, PX, Y + 6.5, {
        width: PW, align: "center", characterSpacing: 0.5,
      });
    Y += PH + 26;
  }

  // ── Details card (2-column, cream background) ───────────────
  const CX = BM + 26, CW = W - BM * 2 - 52, CH = 80;
  doc.roundedRect(CX, Y, CW, CH, 9).lineWidth(0.7).fillAndStroke(P.bgCard, P.goldLt);

  // Vertical divider inside card
  doc.moveTo(CX + CW / 2, Y + 12).lineTo(CX + CW / 2, Y + CH - 12)
    .lineWidth(0.5).strokeColor(P.gray).stroke();

  const L1 = CX + 20, L2 = CX + CW / 2 + 18;
  const LY1 = Y + 14, LY2 = Y + 46;

  // Labels (small-caps style, letter-spaced)
  doc.fillColor(P.gray).font("Helvetica").fontSize(7.5);
  doc.text("ÁREA",                  L1, LY1, { characterSpacing: 0.8 });
  doc.text("DATA DE CONCLUSÃO",     L2, LY1, { characterSpacing: 0.8 });
  doc.text("PONTOS ATRIBUÍDOS",     L1, LY2, { characterSpacing: 0.8 });
  doc.text("CÓDIGO DE VERIFICAÇÃO", L2, LY2, { characterSpacing: 0.8 });

  // Values
  doc.fillColor(P.dark).font("Helvetica-Bold").fontSize(10);
  doc.text(badge.area?.name || "—", L1, LY1 + 11);
  doc.text(awardedAt.toLocaleDateString("pt-PT"), L2, LY1 + 11);
  doc.text(`${badge.points || 0} pts`, L1, LY2 + 11);
  doc.fillColor(P.navyMd).font("Helvetica").fontSize(8.5)
    .text(certificateCode || "—", L2, LY2 + 11, { width: CW / 2 - 26 });

  Y += CH + 22;

  // ── Verification URL ─────────────────────────────────────────
  if (verificationUrl) {
    doc.fillColor(P.gray).font("Helvetica").fontSize(7.5)
      .text("VERIFICAÇÃO PÚBLICA", 0, Y, {
        width: W, align: "center", characterSpacing: 1,
      });
    Y += 13;
    doc.fillColor(P.navyMd).font("Helvetica").fontSize(8)
      .text(verificationUrl, BM + 22, Y, {
        width: W - BM * 2 - 44, align: "center", underline: true,
      });
    Y += 19;
  }

  // ── Central ornament (visually bridges whitespace) ───────────
  const SIG_TOP = H - BM - 114;
  const ornY    = Math.round((Y + SIG_TOP) / 2);
  doc.moveTo((W - 60) / 2, ornY).lineTo((W + 60) / 2, ornY)
    .lineWidth(0.5).strokeColor(P.goldLt).stroke();
  drawDiamond(doc, W / 2, ornY, 4);

  // ── Signature zone ───────────────────────────────────────────
  doc.moveTo(BM + 28, SIG_TOP).lineTo(W - BM - 28, SIG_TOP)
    .lineWidth(0.5).strokeColor(P.goldLt).stroke();

  doc.fillColor(P.mid).font("Helvetica").fontSize(9)
    .text(`Emitido em ${new Date().toLocaleDateString("pt-PT")}`, 0, SIG_TOP + 11, {
      width: W, align: "center",
    });

  const SLW  = 140;
  const SL1  = BM + 46;
  const SL2  = W - BM - 46 - SLW;
  const SLLY = SIG_TOP + 55;

  doc.moveTo(SL1, SLLY).lineTo(SL1 + SLW, SLLY).lineWidth(0.7).strokeColor(P.mid).stroke();
  doc.moveTo(SL2, SLLY).lineTo(SL2 + SLW, SLLY).lineWidth(0.7).strokeColor(P.mid).stroke();

  doc.fillColor(P.navy).font("Helvetica-Bold").fontSize(8.5);
  doc.text("Coordenação Pedagógica", SL1, SLLY + 5, { width: SLW, align: "center" });
  doc.text("Direção Técnica",        SL2, SLLY + 5, { width: SLW, align: "center" });

  doc.fillColor(P.gray).font("Helvetica").fontSize(7.5);
  doc.text("Softinsa", SL1, SLLY + 19, { width: SLW, align: "center" });
  doc.text("Softinsa", SL2, SLLY + 19, { width: SLW, align: "center" });

  // ── Footer ───────────────────────────────────────────────────
  const FY = H - BM - 28;
  doc.moveTo(BM + 28, FY).lineTo(W - BM - 28, FY)
    .lineWidth(0.8).strokeColor(P.gold).stroke();
  doc.fillColor(P.gray).font("Helvetica").fontSize(7)
    .text(
      verificationUrl
        ? `Autenticidade verificável em: ${verificationUrl}`
        : "Certificado emitido digitalmente pela plataforma BadgesPINT · Softinsa",
      BM + 16, FY + 8,
      { width: W - BM * 2 - 32, align: "center" }
    );
}
