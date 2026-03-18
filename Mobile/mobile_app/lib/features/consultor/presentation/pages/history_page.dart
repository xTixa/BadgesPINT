import 'package:flutter/material.dart';

import '../../data/models/consultor_models.dart';
import '../controllers/consultor_controller.dart';

class HistoryPage extends StatelessWidget {
  const HistoryPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      itemCount: controller.badges.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (BuildContext context, int index) {
        final BadgeItem badge = controller.badges[index];

        return Card(
          child: ListTile(
            leading: const Icon(Icons.workspace_premium, color: Color(0xFF16558C)),
            title: Text(
              badge.name,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            subtitle: Text('Estado: ${badge.status}'),
            trailing: Text(
              badge.isObtained ? 'Obtido' : 'Em progresso',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: badge.isObtained ? const Color(0xFF059669) : const Color(0xFFB45309),
              ),
            ),
          ),
        );
      },
    );
  }
}
