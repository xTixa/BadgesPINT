import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../consultor_controller.dart';
import '../consultor_models.dart';

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
        _buildHeader(context, scheme),
        const SizedBox(height: 14),
        Row(
          children: <Widget>[
            Expanded(
              child: _statCard(
                title: 'Posicao',
                value: '#${controller.rankingPosition}',
                icon: Icons.leaderboard_rounded,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _statCard(
                title: 'Pontos',
                value: '${controller.totalPoints}',
                icon: Icons.stars_rounded,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        if (rows.length >= 3) ...<Widget>[
          _buildPodium(context, scheme, rows),
          const SizedBox(height: 14),
        ],
        _buildRankingList(context, scheme, rows),
      ],
    );
  }

  Widget _buildHeader(BuildContext context, ColorScheme scheme) {
    final currentName = controller.profile?.name ?? 'Consultor';

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.emoji_events_rounded,
                  color: Colors.white,
                  size: 26,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'Ranking',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Compara pontos, badges obtidos e progresso dos consultores.',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.76),
                        height: 1.25,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
            ),
            child: Row(
              children: <Widget>[
                const Icon(
                  Icons.person_rounded,
                  color: Colors.white,
                  size: 18,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    currentName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '#${controller.rankingPosition}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
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
    BuildContext context,
    ColorScheme scheme,
    List<RankingItem> rows,
  ) {
    final top3 = rows.take(3).toList();

    return Container(
      padding: const EdgeInsets.fromLTRB(12, 18, 12, 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: Colors.white,
        border: Border.all(color: scheme.outlineVariant),
      ),
      child: Column(
        children: <Widget>[
          Text(
            'Podio',
            style: TextStyle(
              fontWeight: FontWeight.w900,
              fontSize: 13,
              color: scheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: <Widget>[
              Expanded(child: _buildPodiumItem(context, top3[1], 2, 70)),
              Expanded(child: _buildPodiumItem(context, top3[0], 1, 90)),
              Expanded(child: _buildPodiumItem(context, top3[2], 3, 55)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPodiumItem(
    BuildContext context,
    RankingItem item,
    int position,
    double barHeight,
  ) {
    final scheme = Theme.of(context).colorScheme;
    final podiumColor = switch (position) {
      1 => const Color(0xFFD59B00),
      2 => const Color(0xFF8A8F98),
      _ => const Color(0xFFB66A2C),
    };

    return Column(
      children: <Widget>[
        CircleAvatar(
          radius: 17,
          backgroundColor: podiumColor.withValues(alpha: 0.14),
          child: Text(
            '$position',
            style: TextStyle(
              color: podiumColor,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          item.name.split(' ').first,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 12,
            color: scheme.onSurface,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          '${item.points} pts',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
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
            color: podiumColor.withValues(alpha: 0.16),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
            border: Border.all(color: podiumColor.withValues(alpha: 0.35)),
          ),
        ),
      ],
    );
  }

  Widget _buildRankingList(
    BuildContext context,
    ColorScheme scheme,
    List<RankingItem> rows,
  ) {
    if (rows.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: scheme.outlineVariant),
          color: Colors.white,
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
            'Classificacao completa',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                  color: scheme.onSurfaceVariant,
                ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: scheme.outlineVariant),
            borderRadius: BorderRadius.circular(16),
            color: Colors.white,
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            children: rows.asMap().entries.map((entry) {
              final index = entry.key;
              final item = entry.value;
              final isMe = item.consultantId == controller.profile?.id ||
                  item.name == controller.profile?.name;
              final isLast = index == rows.length - 1;

              return InkWell(
                onTap: item.consultantId <= 0
                    ? null
                    : () => context.push('/consultants/${item.consultantId}'),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 13,
                  ),
                  decoration: BoxDecoration(
                    color: isMe
                        ? const Color(0xFF0F62FE).withValues(alpha: 0.08)
                        : null,
                    border: isLast
                        ? null
                        : Border(
                            bottom: BorderSide(
                              color: scheme.outlineVariant.withValues(
                                alpha: 0.6,
                              ),
                            ),
                          ),
                  ),
                  child: Row(
                    children: <Widget>[
                      SizedBox(
                        width: 34,
                        child: Text(
                          '#${item.position}',
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            color: item.position <= 3
                                ? const Color(0xFF0F62FE)
                                : scheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Row(
                              children: <Widget>[
                                Expanded(
                                  child: Text(
                                    item.name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                                if (isMe) ...<Widget>[
                                  const SizedBox(width: 8),
                                  _youBadge(),
                                ],
                              ],
                            ),
                            if ((item.areaName ?? '').isNotEmpty)
                              Text(
                                item.areaName!,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: scheme.onSurfaceVariant,
                                  fontSize: 12,
                                ),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF4FF),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          '${item.points} pts',
                          style: const TextStyle(
                            color: Color(0xFF0F62FE),
                            fontWeight: FontWeight.w900,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _statCard({
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black12),
      ),
      child: Column(
        children: <Widget>[
          Icon(icon, color: const Color(0xFF0F62FE)),
          const SizedBox(height: 8),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          ),
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _youBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFF0F62FE),
        borderRadius: BorderRadius.circular(999),
      ),
      child: const Text(
        'TU',
        style: TextStyle(
          color: Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}
