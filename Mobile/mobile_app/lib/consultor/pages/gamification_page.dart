import 'package:flutter/material.dart';

import '../../shared/app_theme.dart';
import '../consultor_controller.dart';

class GamificationPage extends StatelessWidget {
  const GamificationPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    final obtained = controller.badges.where((badge) => badge.isObtained).length;
    final total = controller.badges.length;
    final points = controller.totalPoints;
    final level = _level(points);
    final achievements = _achievements(obtained, points);

    return Scaffold(
      appBar: AppBar(title: const Text('Gamification')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Nivel atual',
                  style: TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 4),
                Text(
                  level.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 30,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: LinearProgressIndicator(
                        value: level.progress / 100,
                        minHeight: 9,
                        backgroundColor: Colors.white24,
                        valueColor: const AlwaysStoppedAnimation(
                          AppColors.accent,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      '${level.progress}%',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  level.pointsToNext == 0
                      ? 'Nivel maximo atingido'
                      : '${level.pointsToNext} pontos para o proximo nivel',
                  style: const TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.35,
            children: [
              _stat('Pontos', points.toString(), Icons.stars_rounded),
              _stat('Ranking', '#${controller.rankingPosition}', Icons.emoji_events),
              _stat('Badges', '$obtained/$total', Icons.workspace_premium),
              _stat('Certificados', controller.certificates.length.toString(), Icons.picture_as_pdf),
            ],
          ),
          const SizedBox(height: 18),
          const Text(
            'Conquistas',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 10),
          ...achievements.map(_achievementTile),
        ],
      ),
    );
  }

  Widget _stat(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: AppColors.primary),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
          ),
          Text(label, style: TextStyle(color: Colors.grey.shade700)),
        ],
      ),
    );
  }

  Widget _achievementTile(_Achievement achievement) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: achievement.unlocked ? const Color(0xFFECFDF5) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: achievement.unlocked
              ? const Color(0xFFA7F3D0)
              : AppColors.borderLight,
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor:
                achievement.unlocked ? const Color(0xFFD1FAE5) : Colors.grey.shade100,
            child: Icon(
              achievement.icon,
              color: achievement.unlocked
                  ? const Color(0xFF047857)
                  : Colors.grey.shade500,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  achievement.title,
                  style: const TextStyle(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 2),
                Text(
                  achievement.description,
                  style: TextStyle(color: Colors.grey.shade700),
                ),
                const SizedBox(height: 6),
                LinearProgressIndicator(
                  value: achievement.progress,
                  minHeight: 6,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  _Level _level(int points) {
    if (points >= 1600) return const _Level('Master', 100, 0);
    if (points >= 1000) {
      return _Level('Expert', (((points - 1000) / 600) * 100).round(), 1600 - points);
    }
    if (points >= 600) {
      return _Level('Specialist', (((points - 600) / 400) * 100).round(), 1000 - points);
    }
    if (points >= 250) {
      return _Level('Explorer', (((points - 250) / 350) * 100).round(), 600 - points);
    }
    return _Level('Rookie', ((points / 250) * 100).round(), 250 - points);
  }

  List<_Achievement> _achievements(int obtained, int points) {
    return [
      _Achievement(
        title: 'Primeiro Badge',
        description: 'Conquista o teu primeiro badge validado.',
        icon: Icons.workspace_premium,
        unlocked: obtained >= 1,
        progress: (obtained / 1).clamp(0, 1).toDouble(),
      ),
      _Achievement(
        title: '3 Badges Obtidos',
        description: 'Mostra consistencia ao concluir tres badges.',
        icon: Icons.military_tech,
        unlocked: obtained >= 3,
        progress: (obtained / 3).clamp(0, 1).toDouble(),
      ),
      _Achievement(
        title: '500 Pontos',
        description: 'Atinge 500 pontos acumulados.',
        icon: Icons.stars_rounded,
        unlocked: points >= 500,
        progress: (points / 500).clamp(0, 1).toDouble(),
      ),
      _Achievement(
        title: 'Top 3 Ranking',
        description: 'Chega ao top 3 da classificacao geral.',
        icon: Icons.emoji_events,
        unlocked: controller.rankingPosition <= 3,
        progress: controller.rankingPosition <= 3 ? 1 : 0.35,
      ),
    ];
  }
}

class _Level {
  const _Level(this.name, this.progress, this.pointsToNext);

  final String name;
  final int progress;
  final int pointsToNext;
}

class _Achievement {
  const _Achievement({
    required this.title,
    required this.description,
    required this.icon,
    required this.unlocked,
    required this.progress,
  });

  final String title;
  final String description;
  final IconData icon;
  final bool unlocked;
  final double progress;
}
