import 'package:flutter/material.dart';

import '../consultor_models.dart';
import '../consultor_controller.dart';

class HistoryPage extends StatelessWidget {
  const HistoryPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      children: <Widget>[
        // 🔹 HEADER
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            color: scheme.primary,
          ),
          child: Row(
            children: [
              const Icon(Icons.history, color: Colors.white),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Histórico de Badges',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ),
              IconButton(
                onPressed: controller.refreshRealtimeData,
                icon: const Icon(Icons.refresh, color: Colors.white),
              ),
            ],
          ),
        ),

        const SizedBox(height: 12),

        // 🔹 HISTÓRICO
        Text('Os teus badges', style: Theme.of(context).textTheme.titleMedium),

        const SizedBox(height: 8),

        if (controller.badges.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Text('Ainda não tens badges.'),
            ),
          )
        else
          ...controller.badges.map((badge) {
            return Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                leading: Icon(Icons.workspace_premium, color: scheme.primary),
                title: Text(
                  badge.name,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(badge.status),
                    Text('${badge.points} pontos'),
                  ],
                ),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      badge.isObtained ? 'Concluído' : 'Em progresso',
                      style: TextStyle(
                        fontSize: 12,
                        color: badge.isObtained ? Colors.green : Colors.orange,
                      ),
                    ),

                    if (badge.isObtained)
                      IconButton(
                        icon: const Icon(Icons.picture_as_pdf),
                        onPressed: () async {
                          final messenger = ScaffoldMessenger.of(context);
                          final ok = await controller.downloadCertificate(
                            badge.id,
                          );

                          if (!context.mounted) return;

                          messenger.showSnackBar(
                            SnackBar(
                              content: Text(
                                ok
                                    ? 'Download iniciado'
                                    : 'Erro ao descarregar',
                              ),
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            );
          }),

        const SizedBox(height: 16),

        // 🔹 PEDIDOS
        Text(
          'Pedidos em curso',
          style: Theme.of(context).textTheme.titleMedium,
        ),

        const SizedBox(height: 8),

        if (controller.pedidosStatus.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Text('Sem pedidos ativos.'),
            ),
          )
        else
          ...controller.pedidosStatus.map((pedido) {
            return Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                leading: const Icon(Icons.track_changes),
                title: Text(pedido.badgeName),
                subtitle: Text('Workflow: ${pedido.workflowStatus}'),
                trailing: Chip(label: Text(pedido.status)),
              ),
            );
          }),
      ],
    );
  }
}
