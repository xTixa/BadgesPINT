import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import User from '../models/User.js';
import Badge from '../models/Badge.js';
import LearningPath from '../models/LearningPath.js';
import ConsultorBadge from '../models/ConsultorBadge.js';
import database from '../config/database.js';
import { QueryTypes, Op } from 'sequelize';

/**
 * Export dados para Excel
 */
export async function exportToExcel(req, res) {
  try {
    const { scope, startDate, endDate } = req.body;
    const start = startDate ? new Date(startDate) : new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const workbook = new ExcelJS.Workbook();

    // Sheet: Utilizadores
    if (scope === 'todos' || scope === 'users') {
      const usersSheet = workbook.addWorksheet('Utilizadores');
      usersSheet.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Nome', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Perfil', key: 'role', width: 20 },
        { header: 'Área', key: 'area', width: 15 },
        { header: 'Pontos Totais', key: 'points_total', width: 12 },
        { header: 'Data Criação', key: 'createdAt', width: 15 },
      ];

      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'points_total', 'createdAt'],
        include: [{ association: 'area', attributes: ['name'] }],
        order: [['id', 'ASC']]
      });

      users.forEach(u => {
        usersSheet.addRow({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          area: u.area ? u.area.name : 'N/A',
          points_total: u.points_total,
          createdAt: new Date(u.createdAt).toLocaleDateString('pt-PT')
        });
      });

      usersSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      usersSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF191970' } };
    }

    // Sheet: Badges
    if (scope === 'todos' || scope === 'badges') {
      const badgesSheet = workbook.addWorksheet('Badges');
      badgesSheet.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Nome', key: 'name', width: 25 },
        { header: 'Descrição', key: 'description', width: 35 },
        { header: 'Nível', key: 'level', width: 15 },
        { header: 'Pontos', key: 'points', width: 10 },
        { header: 'Área', key: 'area', width: 15 },
        { header: 'Expira (dias)', key: 'expiry_days', width: 12 },
        { header: 'Data Criação', key: 'createdAt', width: 15 },
      ];

      const badges = await Badge.findAll({
        attributes: ['id', 'description', 'level', 'points', 'expiry_days', 'createdAt'],
        include: [{ association: 'area', attributes: ['name'] }],
        order: [['id', 'ASC']]
      });

      badges.forEach(b => {
        badgesSheet.addRow({
          id: b.id,
          name: b.description,
          description: b.description,
          level: b.level,
          points: b.points,
          area: b.area ? b.area.name : 'N/A',
          expiry_days: b.expiry_days || 'Sem expiração',
          createdAt: new Date(b.createdAt).toLocaleDateString('pt-PT')
        });
      });

      badgesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      badgesSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF20c997' } };
    }

    // Sheet: Learning Paths
    if (scope === 'todos' || scope === 'learning-paths') {
      const lpSheet = workbook.addWorksheet('Learning Paths');
      lpSheet.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Nome', key: 'name', width: 25 },
        { header: 'Descrição', key: 'description', width: 35 },
        { header: 'Data Criação', key: 'createdAt', width: 15 },
      ];

      const lps = await LearningPath.findAll({
        attributes: ['id', 'name', 'description', 'createdAt'],
        order: [['id', 'ASC']]
      });

      lps.forEach(lp => {
        lpSheet.addRow({
          id: lp.id,
          name: lp.name,
          description: lp.description,
          createdAt: new Date(lp.createdAt).toLocaleDateString('pt-PT')
        });
      });

      lpSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      lpSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF191970' } };
    }

    // Sheet: Pedidos de Badges
    if (scope === 'todos' || scope === 'pedidos') {
      const pedidosSheet = workbook.addWorksheet('Pedidos de Badges');
      pedidosSheet.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Consultor', key: 'consultor', width: 25 },
        { header: 'Badge', key: 'badge', width: 25 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Data Pedido', key: 'created_at', width: 15 },
        { header: 'Data Atribuição', key: 'data_atribuicao', width: 15 },
      ];

      const pedidos = await database.query(
        `SELECT cb.id, u.name as consultor, b.description as badge, cb.status, cb.created_at, cb.data_atribuicao
         FROM consultor_badges cb
         JOIN "Users" u ON u.id = cb.consultor_id
         JOIN badges b ON b.id = cb.badge_id
         WHERE cb.created_at BETWEEN :start AND :end
         ORDER BY cb.created_at DESC`,
        { type: QueryTypes.SELECT, replacements: { start, end } }
      );

      pedidos.forEach(p => {
        pedidosSheet.addRow({
          id: p.id,
          consultor: p.consultor,
          badge: p.badge,
          status: p.status,
          created_at: new Date(p.created_at).toLocaleDateString('pt-PT'),
          data_atribuicao: p.data_atribuicao ? new Date(p.data_atribuicao).toLocaleDateString('pt-PT') : 'N/A'
        });
      });

      pedidosSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      pedidosSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC99900' } };
    }

    // Enviar ficheiro
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="export-${new Date().getTime()}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('Erro na exportação Excel:', err);
    res.status(500).json({ message: 'Erro ao exportar dados para Excel' });
  }
}

/**
 * Export dados para PDF
 */
export async function exportToPDF(req, res) {
  try {
    const { scope, startDate, endDate } = req.body;
    const start = startDate ? new Date(startDate) : new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Relatório de Exportação', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#666666').text(`Período: ${start.toLocaleDateString('pt-PT')} a ${end.toLocaleDateString('pt-PT')}`, { align: 'center' });
    doc.moveDown(1);

    // Section: Utilizadores
    if (scope === 'todos' || scope === 'users') {
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#191970').text('UTILIZADORES', { underline: true });
      doc.moveDown(0.5);

      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'points_total'],
        include: [{ association: 'area', attributes: ['name'] }],
        order: [['id', 'ASC']],
        limit: 100
      });

      const tableRows = [
        ['Nome', 'Email', 'Perfil', 'Pontos', 'Área']
      ];

      users.forEach(u => {
        tableRows.push([
          u.name,
          u.email,
          u.role,
          u.points_total.toString(),
          u.area ? u.area.name : 'N/A'
        ]);
      });

      drawTable(doc, tableRows);
      doc.moveDown(1);
    }

    // Section: Badges
    if (scope === 'todos' || scope === 'badges') {
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#20c997').text('BADGES', { underline: true });
      doc.moveDown(0.5);

      const badges = await Badge.findAll({
        attributes: ['id', 'description', 'level', 'points', 'expiry_days'],
        include: [{ association: 'area', attributes: ['name'] }],
        order: [['id', 'ASC']],
        limit: 100
      });

      const tableRows = [
        ['Nome', 'Nível', 'Pontos', 'Expira', 'Área']
      ];

      badges.forEach(b => {
        tableRows.push([
          b.description,
          b.level,
          b.points.toString(),
          b.expiry_days ? `${b.expiry_days}d` : 'Sem expiração',
          b.area ? b.area.name : 'N/A'
        ]);
      });

      drawTable(doc, tableRows);
      doc.moveDown(1);
    }

    // Section: Pedidos de Badges
    if (scope === 'todos' || scope === 'pedidos') {
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#FFC99900').text('PEDIDOS DE BADGES', { underline: true });
      doc.moveDown(0.5);

      const pedidos = await database.query(
        `SELECT cb.id, u.name as consultor, b.description as badge, cb.status, cb.created_at
         FROM consultor_badges cb
         JOIN "Users" u ON u.id = cb.consultor_id
         JOIN badges b ON b.id = cb.badge_id
         WHERE cb.created_at BETWEEN :start AND :end
         ORDER BY cb.created_at DESC
         LIMIT 100`,
        { type: QueryTypes.SELECT, replacements: { start, end } }
      );

      const tableRows = [
        ['Consultor', 'Badge', 'Status', 'Data']
      ];

      pedidos.forEach(p => {
        tableRows.push([
          p.consultor,
          p.badge,
          p.status,
          new Date(p.created_at).toLocaleDateString('pt-PT')
        ]);
      });

      drawTable(doc, tableRows);
      doc.moveDown(1);
    }

    doc.fontSize(8).fillColor('#999999').text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, { align: 'center' });

    // Enviar ficheiro
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="export-${new Date().getTime()}.pdf"`);

    doc.pipe(res);
    doc.end();

  } catch (err) {
    console.error('Erro na exportação PDF:', err);
    res.status(500).json({ message: 'Erro ao exportar dados para PDF' });
  }
}

/**
 * Pré-visualizar dados para exportação (JSON)
 */
export async function exportPreview(req, res) {
  try {
    const { scope, startDate, endDate } = req.body;
    const start = startDate ? new Date(startDate) : new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const buildUsers = async () => {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'points_total', 'createdAt'],
        include: [{ association: 'area', attributes: ['name'] }],
        order: [['id', 'ASC']],
        limit: 5
      });
      return {
        title: 'Utilizadores',
        columns: ['Nome', 'Email', 'Perfil', 'Pontos', 'Área'],
        rows: users.map(u => [
          u.name,
          u.email,
          u.role,
          String(u.points_total ?? 0),
          u.area ? u.area.name : 'N/A'
        ])
      };
    };

    const buildBadges = async () => {
      const badges = await Badge.findAll({
        attributes: ['id', 'description', 'level', 'points', 'expiry_days'],
        include: [{ association: 'area', attributes: ['name'] }],
        order: [['id', 'ASC']],
        limit: 5
      });
      return {
        title: 'Badges',
        columns: ['Nome', 'Nível', 'Pontos', 'Expira', 'Área'],
        rows: badges.map(b => [
          b.description || `Badge #${b.id}`,
          b.level,
          String(b.points ?? 0),
          b.expiry_days ? `${b.expiry_days}d` : 'Sem expiração',
          b.area ? b.area.name : 'N/A'
        ])
      };
    };

    const buildLearningPaths = async () => {
      const lps = await LearningPath.findAll({
        attributes: ['id', 'name', 'description', 'createdAt'],
        order: [['id', 'ASC']],
        limit: 5
      });
      return {
        title: 'Learning Paths',
        columns: ['Nome', 'Descrição', 'Data criação'],
        rows: lps.map(lp => [
          lp.name,
          lp.description,
          new Date(lp.createdAt).toLocaleDateString('pt-PT')
        ])
      };
    };

    const buildPedidos = async () => {
      const pedidos = await database.query(
        `SELECT cb.id, u.name as consultor, b.description as badge, cb.status, cb.created_at
         FROM consultor_badges cb
         JOIN "Users" u ON u.id = cb.consultor_id
         JOIN badges b ON b.id = cb.badge_id
         WHERE cb.created_at BETWEEN :start AND :end
         ORDER BY cb.created_at DESC
         LIMIT 5`,
        { type: QueryTypes.SELECT, replacements: { start, end } }
      );
      return {
        title: 'Pedidos',
        columns: ['Consultor', 'Badge', 'Status', 'Data'],
        rows: pedidos.map(p => [
          p.consultor,
          p.badge,
          p.status,
          new Date(p.created_at).toLocaleDateString('pt-PT')
        ])
      };
    };

    if (scope === 'todos') {
      const sections = await Promise.all([
        buildUsers(),
        buildBadges(),
        buildLearningPaths(),
        buildPedidos()
      ]);
      return res.json({ scope, sections });
    }

    if (scope === 'users') return res.json(await buildUsers());
    if (scope === 'badges') return res.json(await buildBadges());
    if (scope === 'learning-paths') return res.json(await buildLearningPaths());
    if (scope === 'pedidos') return res.json(await buildPedidos());

    return res.status(400).json({ message: 'Âmbito inválido' });
  } catch (err) {
    console.error('Erro na pré-visualização:', err);
    res.status(500).json({ message: 'Erro ao pré-visualizar dados' });
  }
}

/**
 * Função auxiliar para desenhar tabelas em PDF
 */
function drawTable(doc, rows, columnWidths = null) {
  const TABLE_TOP = doc.y;
  const TABLE_WIDTH = 495;
  const CELL_HEIGHT = 20;
  const PAGE_HEIGHT = doc.page.height;
  const MARGIN_BOTTOM = 50;

  const colCount = rows[0].length;
  if (!columnWidths) {
    columnWidths = Array(colCount).fill(TABLE_WIDTH / colCount);
  }

  let currentY = TABLE_TOP;

  rows.forEach((row, rowIndex) => {
    // Verificar se precisa de página nova
    if (currentY + CELL_HEIGHT > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      currentY = 50;
    }

    // Header row
    if (rowIndex === 0) {
      doc.fillColor('#191970').rect(50, currentY, TABLE_WIDTH, CELL_HEIGHT).fill();
    }

    // Draw cells
    let xPos = 50;
    row.forEach((cell, colIndex) => {
      doc.fillColor(rowIndex === 0 ? '#FFFFFF' : '#000000');
      doc.fontSize(9).font(rowIndex === 0 ? 'Helvetica-Bold' : 'Helvetica');
      doc.text(cell.toString().substring(0, 20), xPos + 3, currentY + 5, {
        width: columnWidths[colIndex] - 6,
        height: CELL_HEIGHT - 10,
        align: 'left',
        valign: 'center'
      });

      // Desenhar bordas
      doc.strokeColor('#CCCCCC').rect(xPos, currentY, columnWidths[colIndex], CELL_HEIGHT).stroke();
      xPos += columnWidths[colIndex];
    });

    currentY += CELL_HEIGHT;
  });

  doc.y = currentY;
}
