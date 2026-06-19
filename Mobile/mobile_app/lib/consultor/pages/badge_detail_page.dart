import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import 'upload_page.dart';
import '../consultor_controller.dart';
import '../consultor_models.dart';
import '../../shared/app_config.dart';

class BadgeDetailPage extends StatefulWidget {
  const BadgeDetailPage({
    required this.badge,
    required this.controller,
    super.key,
  });

  final CatalogBadgeItem badge;
  final ConsultorController controller;

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
    if (mounted) setState(() => loading = false);
  }

  String _estadoBadge() {
    final pedido = widget.controller.pedidosStatus.where(
      (p) => p.badgeId == widget.badge.id,
    );

    if (pedido.isEmpty) return 'Nao Candidatado';
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
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Link publico copiado')),
    );
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
    final candidaturaAtiva = estado != 'Nao Candidatado';

    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Detalhes do Badge')),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _courseHeader(context, badge, estado),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 18, 16, 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Sobre este badge',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        badge.description.isEmpty
                            ? 'Completa os requisitos definidos e submete evidencias para validacao.'
                            : badge.description,
                        style: TextStyle(
                          color: Colors.grey.shade800,
                          height: 1.45,
                        ),
                      ),
                      const SizedBox(height: 18),
                      Row(
                        children: [
                          Expanded(
                            child: _summaryTile(
                              Icons.star_rounded,
                              '${badge.points}',
                              'pontos',
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _summaryTile(
                              Icons.workspace_premium_rounded,
                              badge.levelLabel,
                              'badge',
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _summaryTile(
                              Icons.fact_check_rounded,
                              '${requisitos.length}',
                              'requisitos',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _softChip(
                            Icons.category_outlined,
                            badge.areaName ?? 'Geral',
                          ),
                          _softChip(Icons.flag_outlined, estado),
                          InkWell(
                            onTap: () => _copyPublicLink(context),
                            borderRadius: BorderRadius.circular(999),
                            child: _softChip(Icons.link, 'Link publico'),
                          ),
                        ],
                      ),
                      if (candidaturaAtiva) ...[
                        const SizedBox(height: 18),
                        LinearProgressIndicator(
                          value: requisitos.isEmpty
                              ? 0
                              : controller.evidences.length / requisitos.length,
                          minHeight: 8,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${controller.evidences.length}/${requisitos.length} requisitos concluidos',
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ],
                      const SizedBox(height: 24),
                      Text(
                        'O que tens de completar',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 10),
                      if (!candidaturaAtiva)
                        _lockedRequirements(context)
                      else
                        ...requisitos.map(
                          (req) => _requirementCard(
                            req,
                            controller.latestEvidenceForRequirement(req.id) !=
                                null,
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          _bottomActions(context, controller, estado, candidaturaAtiva),
        ],
      ),
    );
  }

  Widget _courseHeader(
    BuildContext context,
    CatalogBadgeItem badge,
    String estado,
  ) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      color: const Color(0xFF111827),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _badgeImage(
            badge,
            height: 190,
            width: double.infinity,
            backgroundColor: scheme.primary,
            iconSize: 54,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  badge.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  badge.description.isEmpty
                      ? 'Formacao por requisitos com validacao de evidencias.'
                      : badge.description,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.78),
                    height: 1.35,
                  ),
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _darkChip(Icons.star_rounded, '${badge.points} pontos'),
                    _darkChip(Icons.workspace_premium_rounded, badge.levelLabel),
                    _darkChip(Icons.flag_outlined, estado),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _bottomActions(
    BuildContext context,
    ConsultorController controller,
    String estado,
    bool candidaturaAtiva,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 12,
            offset: const Offset(0, -4),
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
              onPressed: estado != 'Nao Candidatado'
                  ? null
                  : () async {
                      final result = await controller.submitPedido();

                      if (result.success) {
                        await controller.selectBadge(widget.badge.id);
                        if (mounted) setState(() {});
                      }

                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              result.message ??
                                  (result.success
                                      ? 'Pedido submetido com sucesso'
                                      : 'Erro ao submeter pedido'),
                            ),
                          ),
                        );
                      }
                    },
              icon: const Icon(Icons.workspace_premium),
              label: Text(
                estado == 'Nao Candidatado' ? 'Candidatar-me' : 'Em Progresso',
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
                  label: const Text('Link publico'),
                ),
              ),
              if (_isObtained) ...[
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _shareOnLinkedIn,
                    icon: const Icon(Icons.share),
                    label: const Text('LinkedIn'),
                  ),
                ),
              ],
            ],
          ),
          if (candidaturaAtiva) ...[
            const SizedBox(height: 12),
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
                label: const Text('Fazer Upload'),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _lockedRequirements(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black12),
      ),
      child: Column(
        children: [
          Icon(
            Icons.lock_outline_rounded,
            size: 44,
            color: Colors.grey.shade500,
          ),
          const SizedBox(height: 10),
          const Text(
            'Candidata-te para desbloquear os requisitos',
            textAlign: TextAlign.center,
            style: TextStyle(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 6),
          Text(
            'Depois podes submeter evidencias e acompanhar a validacao ate obteres o badge.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade700),
          ),
        ],
      ),
    );
  }

  Widget _requirementCard(RequirementItem requirement, bool completed) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
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
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  if (requirement.description.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      requirement.description,
                      style: TextStyle(color: Colors.grey.shade700),
                    ),
                  ],
                  const SizedBox(height: 8),
                  Text(
                    requirement.code,
                    style: const TextStyle(
                      color: Color(0xFF0F62FE),
                      fontWeight: FontWeight.w800,
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

  Widget _badgeImage(
    CatalogBadgeItem badge, {
    required double height,
    required double width,
    required Color backgroundColor,
    required double iconSize,
  }) {
    final imageUrl = badge.imageUrl;
    if (imageUrl != null && imageUrl.isNotEmpty) {
      return Image.network(
        imageUrl,
        height: height,
        width: width,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => _badgeImageFallback(
          height: height,
          width: width,
          backgroundColor: backgroundColor,
          iconSize: iconSize,
        ),
      );
    }

    return _badgeImageFallback(
      height: height,
      width: width,
      backgroundColor: backgroundColor,
      iconSize: iconSize,
    );
  }

  Widget _badgeImageFallback({
    required double height,
    required double width,
    required Color backgroundColor,
    required double iconSize,
  }) {
    return Container(
      height: height,
      width: width,
      color: backgroundColor.withValues(alpha: 0.12),
      child: Icon(
        Icons.workspace_premium_rounded,
        color: backgroundColor,
        size: iconSize,
      ),
    );
  }

  Widget _summaryTile(IconData icon, String value, String label) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.black12),
      ),
      child: Column(
        children: [
          Icon(icon, color: const Color(0xFF0F62FE)),
          const SizedBox(height: 6),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.w900),
          ),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
          ),
        ],
      ),
    );
  }

  Widget _softChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF4FF),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: const Color(0xFF0F62FE)),
          const SizedBox(width: 6),
          Text(
            text,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }

  Widget _darkChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.white),
          const SizedBox(width: 6),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
