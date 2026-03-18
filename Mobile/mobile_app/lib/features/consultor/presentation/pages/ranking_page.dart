import 'package:flutter/material.dart';

import '../../data/models/consultor_models.dart';
import '../controllers/consultor_controller.dart';

class RankingPage extends StatelessWidget {
  const RankingPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      itemCount: controller.ranking.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (BuildContext context, int index) {
        final RankingItem item = controller.ranking[index];

        return Card(
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: item.position <= 3 ? const Color(0xFFFEF3C7) : const Color(0xFFE2E8F0),
              child: Text(item.position.toString()),
            ),
            title: Text(
              item.name,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            subtitle: const Text('Consultor'),
            trailing: Text(
              '${item.points} pts',
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        );
      },
    );
  }
}
