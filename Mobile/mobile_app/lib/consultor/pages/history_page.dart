import 'package:flutter/material.dart';
import '../consultor_controller.dart';

class HistoryPage extends StatelessWidget {
  const HistoryPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      children: <Widget>[
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: const LinearGradient(
              colors: [Color(0xFF0F62FE), Color(0xFF4589FF)],
            ),
          ),
          child: Row(
            children: [
              const Icon(Icons.history, color: Colors.white),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Histórico de Badges',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),

                    Text(
                      'Acompanha a tua evolução',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.8),
                        fontSize: 12,
                      ),
                    ),
                  ],
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

        Row(
          children: [
            Expanded(
              child: _statCard(
                "Obtidos",
                controller.badges.where((b) => b.isObtained).length.toString(),
                Icons.workspace_premium,
              ),
            ),

            const SizedBox(width: 12),

            Expanded(
              child: _statCard(
                "Em Curso",
                controller.badges.where((b) => !b.isObtained).length.toString(),
                Icons.pending_actions,
              ),
            ),
          ],
        ),

        const SizedBox(height: 20),
        Text('Os teus badges', style: Theme.of(context).textTheme.titleMedium),

        const SizedBox(height: 8),

        if (controller.badges.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                children: [
                  Icon(
                    Icons.workspace_premium_outlined,
                    size: 60,
                    color: Colors.grey,
                  ),

                  SizedBox(height: 12),

                  Text("Ainda não tens badges obtidos"),
                ],
              ),
            ),
          )
        else
          ...controller.badges.map((badge) {
            return Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor:
                      badge.isObtained
                          ? Colors.green.shade100
                          : Colors.orange.shade100,
                  child: Icon(
                    badge.isObtained ? Icons.check : Icons.pending,
                    color: badge.isObtained ? Colors.green : Colors.orange,
                  ),
                ),
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
                    Chip(
                      label: Text(
                        badge.isObtained ? "Concluído" : "Em progresso",
                      ),
                      backgroundColor:
                          badge.isObtained
                              ? Colors.green.shade100
                              : Colors.orange.shade100,
                    ),

                    if (badge.isObtained)
                      FilledButton.icon(
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

                        icon: const Icon(Icons.download),
                        label: const Text("Certificado"),
                      ),
                  ],
                ),
              ),
            );
          }),

        const SizedBox(height: 16),

        Text(
          'Pedidos em curso',
          style: Theme.of(context).textTheme.titleMedium,
        ),

        const SizedBox(height: 8),

        if (controller.pedidosStatus.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                children: [
                  Icon(Icons.assignment_outlined, size: 60, color: Colors.grey),

                  SizedBox(height: 12),

                  Text("Não existem pedidos ativos"),
                ],
              ),
            ),
          )
        else
          ...controller.pedidosStatus.map((pedido) {
            return Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                leading: const Icon(Icons.track_changes),
                title: Text(pedido.badgeName),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(pedido.workflowStatus),

                    const SizedBox(height: 4),

                    LinearProgressIndicator(
                      value: pedido.status == "Aprovado" ? 1 : 0.5,
                    ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }

  Widget _statCard(String title, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        children: [
          Icon(icon, color: const Color(0xFF0F62FE)),

          const SizedBox(height: 8),

          Text(
            value,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),

          Text(title),
        ],
      ),
    );
  }
}
