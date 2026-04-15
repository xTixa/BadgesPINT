import 'package:flutter/material.dart';

import '../consultor_controller.dart';
import '../consultor_models.dart';

class NotificationsPage extends StatelessWidget {
  const NotificationsPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificacoes'),
        actions: <Widget>[
          TextButton(
            onPressed: () async {
              final ok = await controller.markAllNotificationsAsRead();
              if (!context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    ok
                        ? 'Notificacoes marcadas como lidas.'
                        : 'Nao foi possivel marcar todas.',
                  ),
                ),
              );
            },
            child: const Text('Marcar todas'),
          ),
        ],
      ),
      body: AnimatedBuilder(
        animation: controller,
        builder: (BuildContext context, Widget? child) {
          if (controller.notifications.isEmpty) {
            return const Center(child: Text('Sem notificacoes de momento.'));
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: <Widget>[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: LinearGradient(
                    colors: <Color>[
                      scheme.primary.withValues(alpha: 0.88),
                      scheme.tertiary.withValues(alpha: 0.84),
                    ],
                  ),
                ),
                child: Row(
                  children: <Widget>[
                    const Icon(
                      Icons.notifications_active_rounded,
                      color: Colors.white,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Centro de Notificacoes',
                        style: Theme.of(
                          context,
                        ).textTheme.titleMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    Text(
                      '${controller.notifications.where((n) => !n.read).length} novas',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              ...controller.notifications.map((UserNotificationItem item) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Card(
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor:
                            item.read
                                ? scheme.outlineVariant.withValues(alpha: 0.45)
                                : scheme.primaryContainer,
                        child: Icon(
                          item.read
                              ? Icons.mark_email_read_outlined
                              : Icons.notifications_active,
                          color:
                              item.read
                                  ? scheme.onSurfaceVariant
                                  : scheme.primary,
                        ),
                      ),
                      title: Text(
                        item.title.isEmpty ? 'Notificacao' : item.title,
                        style: TextStyle(
                          fontWeight:
                              item.read ? FontWeight.w600 : FontWeight.w800,
                        ),
                      ),
                      subtitle: Text(item.message),
                      trailing:
                          item.read
                              ? const Icon(Icons.done, color: Color(0xFF10B981))
                              : TextButton(
                                onPressed: () async {
                                  final ok = await controller
                                      .markNotificationAsRead(item.id);
                                  if (!context.mounted) return;
                                  if (!ok) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          'Falha ao marcar notificacao.',
                                        ),
                                      ),
                                    );
                                  }
                                },
                                child: const Text('Marcar lida'),
                              ),
                    ),
                  ),
                );
              }),
            ],
          );
        },
      ),
    );
  }
}
