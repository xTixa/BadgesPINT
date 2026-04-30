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
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Notificações'),
        actions: <Widget>[
          TextButton.icon(
            onPressed: () async {
              final ok = await controller.markAllNotificationsAsRead();
              if (!context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    ok
                        ? 'Notificações marcadas como lidas.'
                        : 'Não foi possível marcar todas.',
                  ),
                ),
              );
            },
            icon: const Icon(Icons.done_all_rounded, size: 18),
            label: const Text('Marcar todas'),
          ),
        ],
      ),
      body: AnimatedBuilder(
        animation: controller,
        builder: (BuildContext context, Widget? child) {
          if (controller.notifications.isEmpty) {
            return _buildEmptyState(context, scheme);
          }

          final unreadCount =
              controller.notifications.where((n) => !n.read).length;

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
            children: <Widget>[
              // Header summary card
              _buildSummaryCard(context, scheme, unreadCount),
              const SizedBox(height: 16),
              // Notification Items
              ...controller.notifications.map(
                (UserNotificationItem item) =>
                    _buildNotificationCard(context, item, controller, scheme),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, ColorScheme scheme) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: scheme.surfaceContainerHighest.withOpacity(0.5),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.notifications_off_rounded,
              size: 44,
              color: scheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Sem notificações',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: scheme.onSurface,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Quando houver novidades, aparecerão aqui.',
            style: TextStyle(fontSize: 13, color: scheme.onSurfaceVariant),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(
    BuildContext context,
    ColorScheme scheme,
    int unreadCount,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: scheme.surfaceContainer,
        border: Border.all(color: scheme.outlineVariant),
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: scheme.primary.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.notifications_rounded,
              color: scheme.primary,
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Centro de Notificações',
                  style: Theme.of(
                    context,
                  ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 2),
                Text(
                  unreadCount == 0
                      ? 'Tudo lido'
                      : '$unreadCount ${unreadCount == 1 ? 'nova notificação' : 'novas notificações'}',
                  style: TextStyle(
                    fontSize: 12,
                    color:
                        unreadCount > 0
                            ? scheme.primary
                            : scheme.onSurfaceVariant,
                    fontWeight:
                        unreadCount > 0 ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          if (unreadCount > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: scheme.primary,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                '$unreadCount',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(
    BuildContext context,
    UserNotificationItem item,
    ConsultorController controller,
    ColorScheme scheme,
  ) {
    final colors = _getNotificationColor(item.id);
    final accentColor = colors['accent'] as Color;
    final isRead = item.read;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () async {
            if (!isRead) await controller.markNotificationAsRead(item.id);
          },
          borderRadius: BorderRadius.circular(16),
          child: Ink(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color:
                  isRead
                      ? scheme.surfaceContainer.withOpacity(0.5)
                      : scheme.surface,
              border: Border.all(
                color:
                    isRead
                        ? scheme.outlineVariant.withOpacity(0.5)
                        : scheme.outlineVariant,
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    // Left accent bar
                    Container(
                      width: 5,
                      color:
                          isRead
                              ? scheme.outlineVariant.withOpacity(0.5)
                              : accentColor,
                    ),
                    // Content
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            // Icon
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: (colors['background'] as Color)
                                    .withOpacity(isRead ? 0.5 : 1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                Icons.workspace_premium_rounded,
                                color: (colors['icon'] as Color).withOpacity(
                                  isRead ? 0.5 : 1,
                                ),
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 12),
                            // Text content
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  Row(
                                    children: <Widget>[
                                      Expanded(
                                        child: Text(
                                          item.title.isEmpty
                                              ? 'Notificação'
                                              : item.title,
                                          style: TextStyle(
                                            fontWeight:
                                                isRead
                                                    ? FontWeight.w600
                                                    : FontWeight.w800,
                                            fontSize: 14,
                                            color:
                                                isRead
                                                    ? scheme.onSurfaceVariant
                                                    : scheme.onSurface,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      // Unread dot
                                      if (!isRead)
                                        Container(
                                          width: 8,
                                          height: 8,
                                          margin: const EdgeInsets.only(
                                            left: 8,
                                            top: 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: accentColor,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    item.message,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: scheme.onSurfaceVariant,
                                      height: 1.45,
                                    ),
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: <Widget>[
                                      Text(
                                        _formatTime(DateTime.now()),
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: scheme.onSurfaceVariant
                                              .withOpacity(0.65),
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      if (!isRead)
                                        GestureDetector(
                                          onTap: () async {
                                            await controller
                                                .markNotificationAsRead(
                                                  item.id,
                                                );
                                          },
                                          child: Text(
                                            'Marcar como lida',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w700,
                                              color: scheme.primary,
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _formatTime(DateTime? dateTime) {
    if (dateTime == null) return 'Agora';
    final diff = DateTime.now().difference(dateTime);
    if (diff.inMinutes < 1) return 'Agora';
    if (diff.inMinutes < 60) return 'há ${diff.inMinutes}m';
    if (diff.inHours < 24) return 'há ${diff.inHours}h';
    if (diff.inDays < 7) return 'há ${diff.inDays}d';
    return '${dateTime.day.toString().padLeft(2, '0')}/${dateTime.month.toString().padLeft(2, '0')}';
  }

  Map<String, dynamic> _getNotificationColor(int id) {
    final colors = <Map<String, dynamic>>[
      {
        'background': const Color(0xFFFFF8ED),
        'icon': const Color(0xFFF59E0B),
        'accent': const Color(0xFFF59E0B),
      },
      {
        'background': const Color(0xFFEFF6FF),
        'icon': const Color(0xFF3B82F6),
        'accent': const Color(0xFF3B82F6),
      },
      {
        'background': const Color(0xFFF0FDFB),
        'icon': const Color(0xFF14B8A6),
        'accent': const Color(0xFF14B8A6),
      },
      {
        'background': const Color(0xFFFFF0F5),
        'icon': const Color(0xFFEC4899),
        'accent': const Color(0xFFEC4899),
      },
      {
        'background': const Color(0xFFF5F0FF),
        'icon': const Color(0xFF8B5CF6),
        'accent': const Color(0xFF8B5CF6),
      },
      {
        'background': const Color(0xFFEFF8FF),
        'icon': const Color(0xFF0EA5E9),
        'accent': const Color(0xFF0EA5E9),
      },
    ];
    return colors[id % colors.length];
  }
}
