import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import 'upload_page.dart';
import '../consultor_controller.dart';
import '../consultor_models.dart';
import '../../shared/app_config.dart';

class BadgeDetailPage extends StatefulWidget {
  final CatalogBadgeItem badge;
  final ConsultorController controller;

  const BadgeDetailPage({
    super.key,
    required this.badge,
    required this.controller,
  });

  @override
  State<BadgeDetailPage> createState() => _BadgeDetailPageState();
}

class _BadgeDetailPageState extends State<BadgeDetailPage> {
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _loadBadge();
  }

  Future<void> _loadBadge() async {
    await widget.controller.selectBadge(widget.badge.id);

    if (mounted) {
      setState(() {
        loading = false;
      });
    }
  }

  String _estadoBadge() {
    final pedido = widget.controller.pedidosStatus.where(
      (p) => p.badgeId == widget.badge.id,
    );

    if (pedido.isEmpty) {
      return "Nao Candidatado";
    }

    return pedido.first.workflowStatus;
  }

  String get _publicBadgeUrl =>
      '${AppConfig.apiBaseUrl.replaceAll(RegExp(r'\/$'), '')}/share/badges/${widget.badge.id}';

  bool get _isObtained {
    return widget.controller.badges.any(
      (badge) => badge.id == widget.badge.id && badge.isObtained,
    );
  }

  Future<void> _copyPublicLink(BuildContext context) async {
    await Clipboard.setData(ClipboardData(text: _publicBadgeUrl));
    if (!context.mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Link publico copiado')));
  }

  Future<void> _shareOnLinkedIn() async {
    final uri = Uri.parse(
      'https://www.linkedin.com/sharing/share-offsite/?url=${Uri.encodeComponent(_publicBadgeUrl)}',
    );
    await launchUrl(uri);
  }

  @override
  Widget build(BuildContext context) {
    final controller = widget.controller;
    final badge = widget.badge;
    final requisitos = controller.requirements;
    final estado = _estadoBadge();
    final candidaturaAtiva = estado != "Nao Candidatado";

    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),

      appBar: AppBar(
        elevation: 0,
        backgroundColor: const Color(0xFF0F62FE),
        foregroundColor: Colors.white,
        title: const Text("Detalhes do Badge"),
      ),

      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFF0F62FE),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  badge.name,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  badge.description,
                  style: const TextStyle(color: Colors.white70),
                ),

                const SizedBox(height: 16),

                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _infoChip(Icons.star, "${badge.points} pontos"),
                    _infoChip(Icons.workspace_premium, "Nível ${badge.level}"),
                    _infoChip(Icons.category, badge.areaName ?? "Geral"),
                  ],
                ),

                const SizedBox(height: 12),

                _infoChip(Icons.flag, estado),
                const SizedBox(height: 8),
                InkWell(
                  onTap: () => _copyPublicLink(context),
                  child: _infoChip(Icons.link, "Link publico"),
                ),

                const SizedBox(height: 20),

                if (candidaturaAtiva)
                  LinearProgressIndicator(
                    value:
                        requisitos.isEmpty
                            ? 0
                            : controller.evidences.length / requisitos.length,
                    minHeight: 8,
                    borderRadius: BorderRadius.circular(20),
                    backgroundColor: Colors.white24,
                    valueColor: const AlwaysStoppedAnimation(Colors.white),
                  ),

                const SizedBox(height: 8),

                if (candidaturaAtiva)
                  Text(
                    "${controller.evidences.length}/${requisitos.length} requisitos concluídos",
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          if (!candidaturaAtiva)
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.workspace_premium_outlined,
                        size: 80,
                        color: Colors.grey.shade400,
                      ),

                      const SizedBox(height: 20),

                      const Text(
                        "Ainda não te candidataste a este badge",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      const SizedBox(height: 8),

                      Text(
                        "Candidata-te para desbloquear os requisitos e começar a submeter evidências.",
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          if (candidaturaAtiva)
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(12),
                children: [
                  ...requisitos.map(
                    (req) => _requirementCard(
                      req,
                      controller.latestEvidenceForRequirement(req.id) != null,
                    ),
                  ),
                ],
              ),
            ),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F62FE),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      textStyle: const TextStyle(fontSize: 16),
                    ),
                    onPressed:
                        estado != "Nao Candidatado"
                            ? null
                            : () async {
                              final result = await controller.submitPedido();

                              if (result.success) {
                                await controller.selectBadge(badge.id);

                                if (mounted) {
                                  setState(() {});
                                }
                              }

                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      result.message ??
                                          (result.success
                                              ? "Pedido submetido com sucesso"
                                              : "Erro ao submeter pedido"),
                                    ),
                                  ),
                                );
                              }
                            },
                    icon: const Icon(Icons.workspace_premium),
                    label: Text(
                      estado == "Nao Candidatado"
                          ? "Candidatar-me"
                          : "Em Progresso",
                    ),
                  ),
                ),

                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _copyPublicLink(context),
                        icon: const Icon(Icons.verified_outlined),
                        label: const Text("Link publico"),
                      ),
                    ),
                    if (_isObtained) ...[
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _shareOnLinkedIn,
                          icon: const Icon(Icons.share),
                          label: const Text("LinkedIn"),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 12),
                if (candidaturaAtiva)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => UploadPage(controller: controller),
                          ),
                        );
                      },
                      icon: const Icon(Icons.upload_file),
                      label: const Text("Fazer Upload"),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _requirementCard(RequirementItem requirement, bool completed) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor:
                  completed ? Colors.green.shade100 : Colors.orange.shade100,
              child: Icon(
                completed ? Icons.check : Icons.pending,
                color: completed ? Colors.green : Colors.orange,
              ),
            ),

            const SizedBox(width: 12),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    requirement.title,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  if (requirement.description.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      requirement.description,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: Colors.grey.shade700),
                    ),
                  ],
                  const SizedBox(height: 6),
                  Text(
                    requirement.code,
                    style: const TextStyle(
                      color: Color(0xFF0F62FE),
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white24,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.white),
          const SizedBox(width: 6),
          Text(text, style: const TextStyle(color: Colors.white)),
        ],
      ),
    );
  }
}
