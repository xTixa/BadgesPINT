import 'package:flutter/material.dart';

import '../consultor_controller.dart';
import '../consultor_models.dart';

class NotificationsPage extends StatelessWidget {
  const NotificationsPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
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
                  content: Text(ok ? 'Notificacoes marcadas como lidas.' : 'Nao foi possivel marcar todas.'),
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
            return const Center(
              child: Text('Sem notificacoes de momento.'),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: controller.notifications.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (BuildContext context, int index) {
              final UserNotificationItem item = controller.notifications[index];

              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: item.read ? const Color(0xFFE2E8F0) : const Color(0xFFDBEAFE),
                    child: Icon(
                      item.read ? Icons.mark_email_read_outlined : Icons.notifications_active,
                      color: item.read ? const Color(0xFF475569) : const Color(0xFF1D4ED8),
                    ),
                  ),
                  title: Text(
                    item.title.isEmpty ? 'Notificacao' : item.title,
                    style: TextStyle(fontWeight: item.read ? FontWeight.w500 : FontWeight.w800),
                  ),
                  subtitle: Text(item.message),
                  trailing: item.read
                      ? const Icon(Icons.done, color: Color(0xFF10B981))
                      : TextButton(
                          onPressed: () async {
                            final ok = await controller.markNotificationAsRead(item.id);
                            if (!context.mounted) return;
                            if (!ok) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Falha ao marcar notificacao.')),
                              );
                            }
                          },
                          child: const Text('Marcar lida'),
                        ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
