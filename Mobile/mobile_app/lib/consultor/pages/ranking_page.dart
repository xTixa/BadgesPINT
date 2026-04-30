import 'package:flutter/material.dart';

import '../consultor_models.dart';
import '../consultor_controller.dart';

class RankingPage extends StatelessWidget {
  const RankingPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    final rows = controller.ranking;
    final scheme = Theme.of(context).colorScheme;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
      children: <Widget>[
        // Header gradient
        _buildHeader(context, scheme),
        const SizedBox(height: 14),

        // Podium for top 3 (if available)
        if (rows.length >= 3) ...<Widget>[
          _buildPodium(context, scheme, rows),
          const SizedBox(height: 14),
        ],

        // Full ranking list
        _buildRankingList(context, scheme, rows),
      ],
    );
  }

  Widget _buildHeader(BuildContext context, ColorScheme scheme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[
            scheme.primary.withOpacity(0.92),
            scheme.tertiary.withOpacity(0.85),
          ],
        ),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: scheme.primary.withOpacity(0.25),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.emoji_events_rounded,
                color: Colors.white, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Ranking',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.3,
                      ),
                ),
                Text(
                  'Os melhores consultores da Softinsa',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPodium(
      BuildContext context, ColorScheme scheme, List<RankingItem> rows) {
    final top3 = rows.take(3).toList();

    return Container(
      padding: const EdgeInsets.fromLTRB(12, 20, 12, 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: scheme.surfaceContainer,
        border: Border.all(color: scheme.outlineVariant),
      ),
      child: Column(
        children: <Widget>[
          Text(
            'Pódio',
            style: TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 13,
              color: scheme.onSurfaceVariant,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: <Widget>[
              // 2nd place
              Expanded(child: _buildPodiumItem(context, top3[1], 2, 70)),
              // 1st place (taller)
              Expanded(child: _buildPodiumItem(context, top3[0], 1, 90)),
              // 3rd place
              Expanded(child: _buildPodiumItem(context, top3[2], 3, 55)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPodiumItem(
      BuildContext context, RankingItem item, int pos, double barHeight) {
    final scheme = Theme.of(context).colorScheme;
    final medal = pos == 1
        ? '🥇'
        : pos == 2
            ? '🥈'
            : '🥉';
    final podiumColor = pos == 1
        ? const Color(0xFFFFD700)
        : pos == 2
            ? const Color(0xFFC0C0C0)
            : const Color(0xFFCD7F32);

    return Column(
      children: <Widget>[
        Text(medal, style: const TextStyle(fontSize: 28)),
        const SizedBox(height: 6),
        Text(
          item.name.split(' ').first, // First name only to avoid overflow
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 12,
            color: scheme.onSurface,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 4),
        Text(
          '${item.points} pts',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 11,
            color: podiumColor,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          height: barHeight,
          decoration: BoxDecoration(
            color: podiumColor.withOpacity(0.2),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
            border: Border.all(color: podiumColor.withOpacity(0.5), width: 1.5),
          ),
          child: Center(
            child: Text(
              '#$pos',
              style: TextStyle(
                color: podiumColor,
                fontWeight: FontWeight.w900,
                fontSize: 13,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRankingList(
      BuildContext context, ColorScheme scheme, List<RankingItem> rows) {
    if (rows.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: scheme.outlineVariant),
          color: scheme.surfaceContainer,
        ),
        child: Center(
          child: Text(
            'Sem dados de ranking de momento.',
            style: TextStyle(color: scheme.onSurfaceVariant),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Text(
            'Classificação completa',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: scheme.onSurfaceVariant,
                ),
          ),
        ),
        // Table header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: scheme.primaryContainer.withOpacity(0.5),
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(16)),
          ),
          child: Row(
            children: <Widget>[
              const SizedBox(width: 36, child: Text('#', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12))),
              const SizedBox(width: 10),
              Expanded(child: Text('Nome', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: scheme.onSurface))),
              Text('Pontos', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: scheme.onSurface)),
            ],
          ),
        ),
        // Rows
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: scheme.outlineVariant),
            borderRadius:
                const BorderRadius.vertical(bottom: Radius.circular(16)),
            color: scheme.surface,
          ),
          child: Column(
            children: rows.asMap().entries.map((entry) {
              final index = entry.key;
              final item = entry.value;
              final medal = item.position == 1
                  ? '🥇'
                  : item.position == 2
                      ? '🥈'
                      : item.position == 3
                          ? '🥉'
                          : '${item.position}';
              final isLast = index == rows.length - 1;

              return Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  border: isLast
                      ? null
                      : Border(
                          bottom: BorderSide(
                            color: scheme.outlineVariant.withOpacity(0.5),
                          ),
                        ),
                  borderRadius: isLast
                      ? const BorderRadius.vertical(
                          bottom: Radius.circular(16))
                      : null,
                  color: item.position <= 3
                      ? scheme.primaryContainer.withOpacity(0.12)
                      : null,
                ),
                child: Row(
                  children: <Widget>[
                    SizedBox(
                      width: 36,
                      child: item.position <= 3
                          ? Text(medal,
                              style: const TextStyle(fontSize: 18),
                              textAlign: TextAlign.center)
                          : Text(
                              medal,
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                color: scheme.onSurfaceVariant,
                              ),
                            ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        item.name,
                        style: TextStyle(
                          fontWeight: item.position <= 3
                              ? FontWeight.w700
                              : FontWeight.w500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: scheme.primaryContainer.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        '${item.points}',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                          color: scheme.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}