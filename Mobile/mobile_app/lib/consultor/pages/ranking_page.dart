import 'package:flutter/material.dart';

import '../consultor_models.dart';
import '../consultor_controller.dart';

class RankingPage extends StatelessWidget {
  const RankingPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    final rows = controller.ranking;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      children: <Widget>[
        Row(
          children: <Widget>[
            const Icon(Icons.emoji_events, color: Color(0xFFD97706)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Ranking de Consultores',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: <Widget>[
              Container(
                decoration: const BoxDecoration(
                  color: Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                child: const Row(
                  children: <Widget>[
                    Expanded(flex: 2, child: Text('Posicao', style: TextStyle(fontWeight: FontWeight.w700))),
                    Expanded(flex: 5, child: Text('Nome', style: TextStyle(fontWeight: FontWeight.w700))),
                    Expanded(flex: 3, child: Text('Pontos', style: TextStyle(fontWeight: FontWeight.w700))),
                  ],
                ),
              ),
              if (rows.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(16),
                  child: Text('Sem dados de ranking de momento.'),
                )
              else
                ...rows.map((RankingItem item) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: const BoxDecoration(
                      border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
                    ),
                    child: Row(
                      children: <Widget>[
                        Expanded(
                          flex: 2,
                          child: Text(
                            '${item.position}',
                            style: const TextStyle(fontWeight: FontWeight.w800),
                          ),
                        ),
                        Expanded(
                          flex: 5,
                          child: Text(item.name),
                        ),
                        Expanded(
                          flex: 3,
                          child: Text(
                            '${item.points}',
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
            ],
          ),
        ),
      ],
    );
  }
}
