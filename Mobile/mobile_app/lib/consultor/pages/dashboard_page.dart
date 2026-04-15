import 'package:flutter/material.dart';

import '../consultor_models.dart';
import '../consultor_controller.dart';
import '../widgets/section_card.dart';
import '../widgets/stat_card.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final firstName =
        (controller.profile?.name ?? 'Consultor').split(' ').first;
    final hasMilestone = controller.badgesObtidos >= 3;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      children: <Widget>[
        if (hasMilestone)
          Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: scheme.secondaryContainer.withValues(alpha: 0.65),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: scheme.secondary, width: 1.2),
            ),
            child: Row(
              children: <Widget>[
                Icon(Icons.celebration, color: scheme.secondary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Parabens! Alcancaste um marco importante de badges obtidos.',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: scheme.onSecondaryContainer,
                    ),
                  ),
                ),
              ],
            ),
          ),
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            boxShadow: const <BoxShadow>[
              BoxShadow(
                color: Color(0x260A4E7A),
                blurRadius: 28,
                offset: Offset(0, 14),
              ),
            ],
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: <Color>[Color(0xFF0A5D8F), Color(0xFF0E7490)],
            ),
          ),
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'Resumo de hoje',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                    letterSpacing: 0.2,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Ola, $firstName',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Continua a tua jornada e conquista novos badges.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white.withValues(alpha: 0.9),
                ),
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: <Widget>[
                  _quickActionChip(
                    context,
                    'Historico',
                    Icons.workspace_premium_outlined,
                    onTap: () => controller.changeTab(1),
                  ),
                  _quickActionChip(
                    context,
                    'Upload',
                    Icons.cloud_upload_outlined,
                    onTap: () => controller.changeTab(2),
                  ),
                  _quickActionChip(
                    context,
                    'Ranking',
                    Icons.leaderboard_outlined,
                    onTap: () => controller.changeTab(3),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        GridView.count(
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          shrinkWrap: true,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 1.4,
          children: <Widget>[
            StatCard(
              label: 'Progresso Global',
              value: '${controller.globalProgress}%',
              icon: Icons.trending_up,
              iconColor: const Color(0xFF1D4ED8),
            ),
            StatCard(
              label: 'Pontos Totais',
              value: controller.totalPoints.toString(),
              icon: Icons.star,
              iconColor: const Color(0xFFD97706),
            ),
            StatCard(
              label: 'Badges Obtidos',
              value: controller.badgesObtidos.toString(),
              icon: Icons.workspace_premium,
              iconColor: const Color(0xFF059669),
            ),
            StatCard(
              label: 'A expirar',
              value: controller.expiryAlerts.length.toString(),
              icon: Icons.warning_amber,
              iconColor: const Color(0xFFDC2626),
            ),
            StatCard(
              label: 'Notificacoes',
              value:
                  controller.notifications
                      .where((UserNotificationItem n) => !n.read)
                      .length
                      .toString(),
              icon: Icons.notifications_active,
              iconColor: const Color(0xFF0EA5E9),
            ),
            StatCard(
              label: 'Pedidos ativos',
              value: controller.pedidosStatus.length.toString(),
              icon: Icons.schedule,
              iconColor: const Color(0xFF7C3AED),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SectionCard(
          title: 'Badges preferenciais da tua area',
          child:
              controller.preferredAreaBadges.isEmpty
                  ? const Text(
                    'Sem area definida no perfil para mostrar badges preferenciais.',
                  )
                  : Column(
                    children:
                        controller.preferredAreaBadges.take(5).map((
                          CatalogBadgeItem badge,
                        ) {
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: const Icon(
                              Icons.auto_awesome,
                              color: Color(0xFF0A5D8F),
                            ),
                            title: Text(badge.name),
                            subtitle: Text(
                              badge.description,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            trailing: Text('${badge.points} pts'),
                          );
                        }).toList(),
                  ),
        ),
        const SizedBox(height: 12),
        SectionCard(
          title: 'Progresso nos Learning Paths',
          child: Column(
            children: const <Widget>[
              _LearningPathTile(name: 'Data Foundations', done: 3, total: 6),
              _LearningPathTile(name: 'Cloud Essentials', done: 2, total: 5),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SectionCard(
          title: 'Proximos Badges',
          child: Column(
            children:
                controller.badges.map((BadgeItem badge) {
                  final progress = controller.progressForBadge(badge.id);

                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(
                      badge.name,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text('Estado: ${badge.status} | ${badge.points} pts'),
                        if (progress != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: LinearProgressIndicator(
                              value:
                                  progress.total > 0
                                      ? (progress.approved / progress.total)
                                      : 0,
                              minHeight: 6,
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                      ],
                    ),
                    trailing:
                        badge.expireInDays != null
                            ? Chip(
                              label: Text('Expira ${badge.expireInDays}d'),
                              backgroundColor: scheme.errorContainer,
                            )
                            : null,
                  );
                }).toList(),
          ),
        ),
        const SizedBox(height: 12),
        SectionCard(
          title: 'Recomendacoes',
          child: Column(
            children:
                controller.recommendations.map((RecommendationItem rec) {
                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const CircleAvatar(
                      backgroundColor: Color(0xFFE0F2FE),
                      child: Icon(Icons.lightbulb, color: Color(0xFF0369A1)),
                    ),
                    title: Text(rec.name),
                    subtitle: Text(rec.reason),
                    trailing: Chip(label: Text('${rec.points} pts')),
                  );
                }).toList(),
          ),
        ),
      ],
    );
  }
}

class _LearningPathTile extends StatelessWidget {
  const _LearningPathTile({
    required this.name,
    required this.done,
    required this.total,
  });

  final String name;
  final int done;
  final int total;

  @override
  Widget build(BuildContext context) {
    final progress = total == 0 ? 0.0 : done / total;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Expanded(
                child: Text(
                  name,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
              Text('$done/$total'),
            ],
          ),
          const SizedBox(height: 6),
          LinearProgressIndicator(
            value: progress,
            minHeight: 7,
            borderRadius: BorderRadius.circular(16),
          ),
        ],
      ),
    );
  }
}

Widget _quickActionChip(
  BuildContext context,
  String label,
  IconData icon, {
  required VoidCallback onTap,
}) {
  final scheme = Theme.of(context).colorScheme;

  return ActionChip(
    onPressed: onTap,
    avatar: Icon(icon, size: 16, color: scheme.primary),
    label: Text(label),
    labelStyle: TextStyle(color: scheme.primary, fontWeight: FontWeight.w700),
    backgroundColor: Colors.white.withValues(alpha: 0.96),
    side: BorderSide.none,
    materialTapTargetSize: MaterialTapTargetSize.padded,
    visualDensity: VisualDensity.standard,
  );
}
