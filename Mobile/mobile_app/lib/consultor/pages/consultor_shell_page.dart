import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../consultor_controller.dart';

class ConsultorShellPage extends StatelessWidget {
  const ConsultorShellPage({
    required this.controller,
    required this.navigationShell,
    required this.onLogout,
    super.key,
  });

  final ConsultorController controller;
  final StatefulNavigationShell navigationShell;
  final Future<void> Function() onLogout;

  static const List<String> _titles = [
    'Dashboard',
    'Catalogo',
    'Upload',
    'Historico',
    'Perfil',
  ];

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        if (controller.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final selectedIndex = navigationShell.currentIndex;
        final hasUnreadNotifications = controller.notifications.any(
          (notification) => !notification.read,
        );

        return Scaffold(
          extendBody: true,
          appBar: AppBar(
            elevation: 0,
            backgroundColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            title: Text(_titles[selectedIndex]),
            actions: [
              IconButton(
                icon: _NotificationBell(hasUnread: hasUnreadNotifications),
                onPressed: () => context.push('/notifications'),
              ),
              Padding(
                padding: const EdgeInsets.only(right: 12),
                child: PopupMenuButton<String>(
                  offset: const Offset(0, 50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 8,
                  color: Colors.white,
                  onSelected: (value) async {
                    if (value == 'settings') context.push('/settings');
                    if (value == 'logout') await onLogout();
                  },
                  child: CircleAvatar(
                    radius: 18,
                    backgroundColor: const Color(0xFF0F62FE),
                    backgroundImage: _avatarProvider(
                      controller.profile?.avatarUrl,
                    ),
                    child: (controller.profile?.avatarUrl ?? '').isEmpty
                        ? Text(
                            controller.profile?.name[0].toUpperCase() ?? '?',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          )
                        : null,
                  ),
                  itemBuilder: (context) => const [
                    PopupMenuItem(
                      value: 'settings',
                      child: Row(
                        children: [
                          Icon(Icons.settings_outlined),
                          SizedBox(width: 12),
                          Text('Definicoes'),
                        ],
                      ),
                    ),
                    PopupMenuDivider(),
                    PopupMenuItem(
                      value: 'logout',
                      child: Row(
                        children: [
                          Icon(Icons.logout_rounded, color: Colors.red),
                          SizedBox(width: 12),
                          Text(
                            'Terminar Sessao',
                            style: TextStyle(color: Colors.red),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          body: Column(
            children: [
              if (!controller.isOnline || controller.pendingSyncCount > 0)
                _SyncStatusBanner(
                  isOnline: controller.isOnline,
                  pendingCount: controller.pendingSyncCount,
                ),
              Expanded(child: navigationShell),
            ],
          ),
          bottomNavigationBar: SafeArea(
            minimum: const EdgeInsets.fromLTRB(14, 0, 14, 12),
            child: Material(
              elevation: 14,
              shadowColor: Colors.black.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(24),
              clipBehavior: Clip.antiAlias,
              child: NavigationBar(
                height: 68,
                selectedIndex: selectedIndex,
                backgroundColor: Colors.white,
                indicatorColor: const Color(0xFFEFF4FF),
                labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
                onDestinationSelected: (index) {
                  navigationShell.goBranch(
                    index,
                    initialLocation: index == selectedIndex,
                  );
                },
                destinations: const [
                  NavigationDestination(
                    icon: Icon(Icons.dashboard_rounded),
                    label: 'Dashboard',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.workspace_premium_rounded),
                    label: 'Catalogo',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.upload_rounded),
                    label: 'Upload',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.history_rounded),
                    label: 'Historico',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.person_rounded),
                    label: 'Perfil',
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

ImageProvider<Object>? _avatarProvider(String? value) {
  if (value == null || value.isEmpty) return null;
  if (value.startsWith('data:image/')) {
    final commaIndex = value.indexOf(',');
    if (commaIndex == -1) return null;
    try {
      return MemoryImage(base64Decode(value.substring(commaIndex + 1)));
    } catch (_) {
      return null;
    }
  }
  return NetworkImage(value);
}

class _NotificationBell extends StatelessWidget {
  const _NotificationBell({required this.hasUnread});

  final bool hasUnread;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: <Widget>[
        const Icon(Icons.notifications_outlined),
        if (hasUnread)
          Positioned(
            right: -1,
            top: -1,
            child: Container(
              width: 9,
              height: 9,
              decoration: BoxDecoration(
                color: Colors.red.shade600,
                shape: BoxShape.circle,
                border: Border.all(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  width: 1.5,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _SyncStatusBanner extends StatelessWidget {
  const _SyncStatusBanner({
    required this.isOnline,
    required this.pendingCount,
  });

  final bool isOnline;
  final int pendingCount;

  @override
  Widget build(BuildContext context) {
    final offline = !isOnline;
    final color = offline ? const Color(0xFFFFF7ED) : const Color(0xFFEFF6FF);
    final border = offline ? const Color(0xFFFED7AA) : const Color(0xFFBFDBFE);
    final iconColor =
        offline ? const Color(0xFFC2410C) : const Color(0xFF1D4ED8);
    final text = offline
        ? 'Sem ligacao. Algumas acoes ficam para sincronizar.'
        : '$pendingCount ${pendingCount == 1 ? 'alteracao pendente' : 'alteracoes pendentes'} a sincronizar.';

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border),
      ),
      child: Row(
        children: [
          Icon(
            offline ? Icons.wifi_off_rounded : Icons.sync_rounded,
            size: 18,
            color: iconColor,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: iconColor,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
