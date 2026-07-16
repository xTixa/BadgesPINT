import 'package:flutter/material.dart';

import '../../shared/app_theme.dart';
import '../consultor_controller.dart';
import '../consultor_models.dart';
import '../widgets/app_header.dart';

class HistoryPage extends StatelessWidget {
  const HistoryPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      children: <Widget>[
        AppHeader(
          title: 'Historico de Badges',
          subtitle: 'Acompanha a tua evolucao',
          icon: Icons.history,
          onActionPressed: controller.refreshRealtimeData,
        ),
        const SizedBox(height: 12),
        Row(
          children: <Widget>[
            Expanded(
              child: _statCard(
                'Obtidos',
                controller.badges.where((b) => b.isObtained).length.toString(),
                Icons.workspace_premium,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _statCard(
                'Em Curso',
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
                children: <Widget>[
                  Icon(
                    Icons.workspace_premium_outlined,
                    size: 60,
                    color: Colors.grey,
                  ),
                  SizedBox(height: 12),
                  Text('Ainda nao tens badges obtidos'),
                ],
              ),
            ),
          )
        else
          ...controller.badges.map((badge) => _badgeHistoryCard(context, badge)),
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
                children: <Widget>[
                  Icon(Icons.assignment_outlined, size: 60, color: Colors.grey),
                  SizedBox(height: 12),
                  Text('Nao existem pedidos ativos'),
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
                  children: <Widget>[
                    Text(pedido.workflowStatus),
                    const SizedBox(height: 4),
                    LinearProgressIndicator(
                      value: pedido.status == 'Aprovado' ? 1 : 0.5,
                    ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }

  Widget _badgeHistoryCard(BuildContext context, BadgeItem badge) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            CircleAvatar(
              backgroundColor:
                  badge.isObtained
                      ? AppColors.pastelMint
                      : AppColors.pastelPeach,
              child: Icon(
                badge.isObtained ? Icons.check : Icons.pending,
                color: badge.isObtained
                    ? const Color(0xFF1D9A6C)
                    : const Color(0xFFC2760F),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    badge.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(badge.status),
                  Text('${badge.points} pontos'),
                  if (badge.isObtained) ...<Widget>[
                    const SizedBox(height: 8),
                    FilledButton.icon(
                      onPressed: () async {
                        final messenger = ScaffoldMessenger.of(context);
                        final result = await controller.downloadCertificate(
                          badge.id,
                        );

                        if (!context.mounted) return;

                        messenger.showSnackBar(
                          SnackBar(
                            content: Text(
                              result.message ??
                                  (result.success
                                      ? 'Download iniciado'
                                      : 'Erro ao descarregar'),
                            ),
                            backgroundColor:
                                result.success ? Colors.green : Colors.red,
                          ),
                        );
                      },
                      icon: const Icon(Icons.download, size: 18),
                      label: const Text('Certificado'),
                      style: FilledButton.styleFrom(
                        visualDensity: VisualDensity.compact,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 8),
            Chip(
              visualDensity: VisualDensity.compact,
              label: Text(badge.isObtained ? 'Concluido' : 'Em progresso'),
              backgroundColor:
                  badge.isObtained
                      ? AppColors.pastelMint
                      : AppColors.pastelPeach,
              side: BorderSide(
                color: badge.isObtained
                    ? AppColors.pastelMintBorder
                    : AppColors.pastelPeachBorder,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statCard(String title, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.card),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        children: <Widget>[
          Icon(icon, color: AppColors.primary),
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
