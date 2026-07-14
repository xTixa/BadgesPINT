import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../shared/app_theme.dart';
import '../consultor_models.dart';

const String _prefsKey = 'celebrated_badge_ids';

Future<Set<int>> getCelebratedBadgeIds() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getStringList(_prefsKey)?.map(int.parse).toSet() ?? <int>{};
}

Future<void> markBadgeAsCelebrated(int badgeId) async {
  final prefs = await SharedPreferences.getInstance();
  final ids = await getCelebratedBadgeIds();
  ids.add(badgeId);
  await prefs.setStringList(_prefsKey, ids.map((id) => id.toString()).toList());
}

Future<void> showBadgeCelebration(BuildContext context, BadgeItem badge) async {
  await showDialog<void>(
    context: context,
    barrierColor: Colors.black54,
    builder: (context) => _BadgeCelebrationDialog(badge: badge),
  );
  await markBadgeAsCelebrated(badge.id);
}

class _BadgeCelebrationDialog extends StatefulWidget {
  const _BadgeCelebrationDialog({required this.badge});

  final BadgeItem badge;

  @override
  State<_BadgeCelebrationDialog> createState() => _BadgeCelebrationDialogState();
}

class _BadgeCelebrationDialogState extends State<_BadgeCelebrationDialog> {
  late final ConfettiController _confettiController;

  static const List<Color> _colors = [
    Color(0xFF0F62FE),
    Color(0xFF00AEEF),
    Color(0xFF16558C),
    Color(0xFFFFD700),
    Color(0xFFFF6B6B),
    Color(0xFF4CAF50),
  ];

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(milliseconds: 3500));
    _confettiController.play();
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final badge = widget.badge;

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24),
      child: Stack(
        alignment: Alignment.topCenter,
        clipBehavior: Clip.none,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Container(
              color: Colors.white,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 40),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppColors.primary, Color(0xFF00AEEF)],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                    ),
                    child: Column(
                      children: [
                        Container(
                          width: 96,
                          height: 96,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.3), width: 4),
                          ),
                          child: badge.imageUrl != null && badge.imageUrl!.isNotEmpty
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(16),
                                  child: Image.network(
                                    badge.imageUrl!,
                                    fit: BoxFit.contain,
                                    errorBuilder: (_, __, ___) => const Icon(
                                      Icons.emoji_events_rounded,
                                      color: Colors.white,
                                      size: 48,
                                    ),
                                  ),
                                )
                              : const Icon(
                                  Icons.emoji_events_rounded,
                                  color: Colors.white,
                                  size: 48,
                                ),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Parabens!',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 30,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Acabaste de conquistar um novo badge',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
                    child: Column(
                      children: [
                        Text(
                          badge.name,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
                        ),
                        if (badge.points > 0) ...[
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFFBEB),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 18),
                                const SizedBox(width: 6),
                                Text(
                                  '+${badge.points} pontos',
                                  style: const TextStyle(
                                    color: Color(0xFFB45309),
                                    fontWeight: FontWeight.w800,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 16),
                        Text(
                          'Continua a evoluir no teu percurso de competencias.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                        ),
                        const SizedBox(height: 20),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton.icon(
                            onPressed: () => Navigator.of(context).pop(),
                            icon: const Icon(Icons.emoji_events_outlined),
                            label: const Text('Ver os meus badges'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            top: -20,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirection: -1.5708,
              numberOfParticles: 24,
              maxBlastForce: 20,
              minBlastForce: 8,
              emissionFrequency: 0.08,
              gravity: 0.25,
              colors: _colors,
            ),
          ),
        ],
      ),
    );
  }
}
