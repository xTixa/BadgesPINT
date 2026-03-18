import 'package:flutter/material.dart';

import '../../data/models/consultor_models.dart';
import '../controllers/consultor_controller.dart';
import '../widgets/section_card.dart';
import '../widgets/stat_card.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    final firstName = (controller.profile?.name ?? 'Consultor').split(' ').first;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      children: <Widget>[
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            gradient: const LinearGradient(
              colors: <Color>[Color(0xFF16558C), Color(0xFF0E7490)],
            ),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                'Ola, $firstName',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Continua a tua jornada e conquista novos badges.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white.withValues(alpha: 0.9),
                ),
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
          ],
        ),
        const SizedBox(height: 12),
        SectionCard(
          title: 'Proximos Badges',
          child: Column(
            children: controller.badges.map((BadgeItem badge) {
              final progress = controller.progressForBadge(badge.id);

              return ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(badge.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text('Estado: ${badge.status} | ${badge.points} pts'),
                    if (progress != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: LinearProgressIndicator(
                          value: progress.total > 0 ? (progress.approved / progress.total) : 0,
                          minHeight: 6,
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                  ],
                ),
                trailing: badge.expireInDays != null
                    ? Chip(
                        label: Text('Expira ${badge.expireInDays}d'),
                        backgroundColor: const Color(0xFFFFE4E6),
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
            children: controller.recommendations.map((RecommendationItem rec) {
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
