import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../consultor_controller.dart';
import '../consultor_models.dart';

enum _NotificationFilter { all, unread, read }

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  _NotificationFilter _filter = _NotificationFilter.all;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificacoes'),
        actions: <Widget>[
          TextButton.icon(
            onPressed: () async {
              final ok = await widget.controller.markAllNotificationsAsRead();
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
            icon: const Icon(Icons.done_all_rounded, size: 18),
            label: const Text('Todas'),
          ),
        ],
      ),
      body: AnimatedBuilder(
        animation: widget.controller,
        builder: (context, _) {
          final all = widget.controller.notifications;
          final unread = all.where((item) => !item.read).length;
          final filtered = _filtered(all);

          if (all.isEmpty) {
            return _emptyState(
              icon: Icons.notifications_off_rounded,
              title: 'Sem notificacoes',
              text: 'Quando houver novidades, aparecem aqui.',
            );
          }

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 112),
            children: [
              _summaryCard(unread),
              const SizedBox(height: 12),
              _filters(all.length, unread),
              const SizedBox(height: 14),
              if (filtered.isEmpty)
                _emptyState(
                  icon: Icons.mark_email_read_outlined,
                  title: 'Nada neste filtro',
                  text: 'Experimenta mudar o filtro acima.',
                )
              else
                ...filtered.map((item) => _NotificationCard(
                      item: item,
                      onTap: () => _openNotification(context, item),
                    )),
            ],
          );
        },
      ),
    );
  }

  List<UserNotificationItem> _filtered(List<UserNotificationItem> all) {
    return switch (_filter) {
      _NotificationFilter.unread => all.where((item) => !item.read).toList(),
      _NotificationFilter.read => all.where((item) => item.read).toList(),
      _ => all,
    };
  }

  Future<void> _openNotification(
    BuildContext context,
    UserNotificationItem item,
  ) async {
    if (!item.read) {
      await widget.controller.markNotificationAsRead(item.id);
    }

    if (!context.mounted) return;

    final text = '${item.title} ${item.message}'.toLowerCase();
    if (text.contains('evid') ||
        text.contains('requisito') ||
        text.contains('badge') ||
        text.contains('pedido')) {
      context.go('/app/upload');
    }
  }

  Widget _summaryCard(int unread) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.notifications_rounded,
              color: Colors.white,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Centro de notificacoes',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  unread == 0
                      ? 'Tudo lido'
                      : '$unread ${unread == 1 ? 'notificacao por ler' : 'notificacoes por ler'}',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.74),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          if (unread > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.red.shade600,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                '$unread',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _filters(int total, int unread) {
    final read = total - unread;
    return SegmentedButton<_NotificationFilter>(
      segments: [
        ButtonSegment(
          value: _NotificationFilter.all,
          label: Text('Todas $total'),
          icon: const Icon(Icons.inbox_outlined),
        ),
        ButtonSegment(
          value: _NotificationFilter.unread,
          label: Text('Por ler $unread'),
          icon: const Icon(Icons.markunread_outlined),
        ),
        ButtonSegment(
          value: _NotificationFilter.read,
          label: Text('Lidas $read'),
          icon: const Icon(Icons.drafts_outlined),
        ),
      ],
      selected: {_filter},
      onSelectionChanged: (values) => setState(() => _filter = values.first),
    );
  }

  Widget _emptyState({
    required IconData icon,
    required String title,
    required String text,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black12),
      ),
      child: Column(
        children: [
          Icon(icon, size: 48, color: Colors.grey.shade500),
          const SizedBox(height: 14),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          Text(
            text,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade700),
          ),
        ],
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  const _NotificationCard({required this.item, required this.onTap});

  final UserNotificationItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isRead = item.read;
    final color = isRead ? Colors.grey : const Color(0xFF0F62FE);

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isRead ? Colors.black12 : const Color(0xFFBFDBFE),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: color.withValues(alpha: 0.1),
                child: Icon(Icons.workspace_premium_rounded, color: color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            item.title.isEmpty ? 'Notificacao' : item.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontWeight:
                                  isRead ? FontWeight.w700 : FontWeight.w900,
                            ),
                          ),
                        ),
                        if (!isRead)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: Colors.red.shade600,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(
                      item.message,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: Colors.grey.shade700),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      isRead ? 'Lida' : 'Toque para abrir',
                      style: TextStyle(
                        color: color,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
