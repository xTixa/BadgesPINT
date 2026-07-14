import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import 'upload_page.dart';
import '../consultor_controller.dart';
import '../consultor_models.dart';
import '../widgets/badge_medal.dart';
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

  Future<void> _copyPublicLink(BuildContext context) async {
    await Clipboard.setData(ClipboardData(text: _publicBadgeUrl));
    if (!context.mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Link publico copiado')));
  }

  Future<void> _openInBrowser(BuildContext context) async {
    final uri = Uri.parse(_publicBadgeUrl);
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!context.mounted) return;
    if (!opened) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nao foi possivel abrir o link.')),
      );
    }
  }

  Future<void> _shareOnLinkedIn() async {
    final uri = Uri.parse(
      'https://www.linkedin.com/sharing/share-offsite/?url=${Uri.encodeComponent(_publicBadgeUrl)}',
    );
    await launchUrl(uri, mode: LaunchMode.externalApplication);
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
      body: SafeArea(
        top: false,
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
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    badge.description.isEmpty
                        ? 'Completa os requisitos definidos e submete evidencias para validacao.'
                        : badge.description,
                    style: TextStyle(color: Colors.grey.shade800, height: 1.45),
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
                      value:
                          requisitos.isEmpty
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
                  if (controller.badgeDetail.learningOutcomes.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    Text(
                      'Resultados de aprendizagem',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 10),
                    ...controller.badgeDetail.learningOutcomes.map(
                      (outcome) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(
                              Icons.check_rounded,
                              size: 18,
                              color: Color(0xFF0F62FE),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                outcome,
                                style: TextStyle(
                                  color: Colors.grey.shade800,
                                  height: 1.35,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  Text(
                    'Conteudo do badge',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 10),
                  if (requisitos.isEmpty)
                    Text(
                      'Ainda nao ha requisitos definidos para este badge.',
                      style: TextStyle(color: Colors.grey.shade600),
                    )
                  else
                    ...requisitos.asMap().entries.map(
                      (entry) => _requirementCard(
                        entry.value,
                        entry.key,
                        controller.latestEvidenceForRequirement(
                              entry.value.id,
                            ) !=
                            null,
                        candidaturaAtiva,
                      ),
                    ),
                  if (controller.badgeDetail.sections.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    Text(
                      'Curriculo',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 10),
                    ...controller.badgeDetail.sections.map(_sectionCard),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 8),
            _bottomActions(context, controller, estado, candidaturaAtiva),
          ],
        ),
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
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF0F62FE), Color(0xFF16558C), Color(0xFF00AEEF)],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 0),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: Container(
                color: Colors.white,
                child: _badgeImage(
                  badge,
                  height: 170,
                  width: double.infinity,
                  backgroundColor: scheme.primary,
                  iconSize: 54,
                ),
              ),
            ),
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
                    _darkChip(
                      Icons.workspace_premium_rounded,
                      badge.levelLabel,
                    ),
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
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
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
                  estado != 'Nao Candidatado'
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
                  icon: const Icon(Icons.link_rounded),
                  label: const Text('Copiar link'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _openInBrowser(context),
                  icon: const Icon(Icons.open_in_browser_rounded),
                  label: const Text('Ver na web'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _shareOnLinkedIn,
              icon: const Icon(Icons.share_rounded),
              label: const Text('Partilhar no LinkedIn'),
            ),
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

  Widget _requirementCard(
    RequirementItem requirement,
    int index,
    bool completed,
    bool candidaturaAtiva,
  ) {
    final statusLabel =
        !candidaturaAtiva
            ? 'Obrigatorio'
            : completed
            ? 'Concluido'
            : 'Pendente';
    final statusColor =
        !candidaturaAtiva
            ? Colors.grey
            : completed
            ? Colors.green
            : Colors.orange;

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: ExpansionTile(
        initiallyExpanded: index == 0,
        backgroundColor: Colors.white,
        collapsedBackgroundColor: const Color(0xFFF8FBFF),
        title: Text(
          'Requisito ${index + 1} - ${requirement.code}',
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
        trailing: Wrap(
          spacing: 6,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Icon(
              candidaturaAtiva
                  ? (completed ? Icons.check_circle : Icons.pending)
                  : Icons.info_outline,
              size: 18,
              color: statusColor,
            ),
            const Icon(Icons.expand_more_rounded),
          ],
        ),
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        expandedCrossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            requirement.description.isEmpty
                ? 'Sem descricao adicional para este requisito.'
                : requirement.description,
            style: TextStyle(color: Colors.grey.shade700, height: 1.4),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _softChip(Icons.description_outlined, 'Evidencia pratica'),
              _softChip(Icons.fact_check_outlined, statusLabel),
            ],
          ),
        ],
      ),
    );
  }

  Widget _sectionCard(BadgeSectionItem section) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: ExpansionTile(
        backgroundColor: Colors.white,
        collapsedBackgroundColor: const Color(0xFFF8FBFF),
        title: Text(
          section.title,
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
        trailing: Text(
          '${section.lessons.length} licoes',
          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
        ),
        childrenPadding: const EdgeInsets.only(bottom: 8),
        children:
            section.lessons
                .map(
                  (lesson) => ListTile(
                    leading: const Icon(
                      Icons.play_circle_outline_rounded,
                      color: Color(0xFF0F62FE),
                    ),
                    title: Text(
                      lesson.title,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(
                      lesson.description.isNotEmpty
                          ? '${lesson.description}\n${lesson.durationMinutes} min - ${lesson.contentType}'
                          : '${lesson.durationMinutes} min - ${lesson.contentType}',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ),
                )
                .toList(),
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
    return Container(
      height: height,
      width: width,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            backgroundColor.withValues(alpha: 0.95),
            const Color(0xFF00AEEF),
          ],
        ),
      ),
      child: BadgeMedal(
        imageUrl: badge.imageUrl,
        badgeId: badge.id,
        label: badge.levelLabel,
        size: 136,
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
