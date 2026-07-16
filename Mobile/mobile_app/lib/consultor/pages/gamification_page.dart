import 'package:flutter/material.dart';

import '../../shared/app_theme.dart';
import '../consultor_controller.dart';
import '../consultor_models.dart';

class GamificationPage extends StatelessWidget {
  const GamificationPage({required this.controller, super.key});

  final ConsultorController controller;

  static const Map<String, IconData> _achievementIcons = {
    'first_badge': Icons.workspace_premium,
    'three_badges': Icons.military_tech,
    'points_500': Icons.stars_rounded,
    'top_3': Icons.emoji_events,
    'evidence_builder': Icons.fact_check_rounded,
  };

  @override
  Widget build(BuildContext context) {
    final gamification = controller.gamification;
    final obtained = controller.badges.where((badge) => badge.isObtained).length;
    final total = controller.badges.length;
    final points = gamification?.points ?? controller.totalPoints;
    final level = gamification?.level;
    final achievements = gamification?.achievements ?? const <GamificationAchievement>[];

    return Scaffold(
      appBar: AppBar(title: const Text('Gamification')),
      body: gamification == null
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
              children: [
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppColors.pastelLilac,
                    borderRadius: BorderRadius.circular(AppRadius.header),
                    border: Border.all(color: AppColors.pastelLilacBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Nivel atual',
                        style: TextStyle(
                          color: AppColors.textDark.withValues(alpha: 0.65),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        level?.name ?? 'Rookie',
                        style: const TextStyle(
                          color: AppColors.textDark,
                          fontSize: 30,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(AppRadius.pill),
                              child: LinearProgressIndicator(
                                value: (level?.progress ?? 0) / 100,
                                minHeight: 9,
                                backgroundColor: Colors.white,
                                valueColor: const AlwaysStoppedAnimation(
                                  Color(0xFF7C4FD1),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            '${level?.progress ?? 0}%',
                            style: const TextStyle(
                              color: AppColors.textDark,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        (level?.pointsToNext ?? 0) == 0
                            ? 'Nivel maximo atingido'
                            : '${level?.pointsToNext} pontos para o proximo nivel',
                        style: TextStyle(
                          color: AppColors.textDark.withValues(alpha: 0.65),
                        ),
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
                    _stat('Ranking', '#${gamification.ranking ?? controller.rankingPosition}', Icons.emoji_events),
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

  Widget _achievementTile(GamificationAchievement achievement) {
    final icon = _achievementIcons[achievement.code] ?? Icons.emoji_events;
    final progress = achievement.target > 0
        ? (achievement.progress / achievement.target).clamp(0, 1).toDouble()
        : 0.0;

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
              icon,
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
                  value: progress,
                  minHeight: 6,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
