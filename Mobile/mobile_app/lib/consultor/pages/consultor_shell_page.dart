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

        return Scaffold(
          appBar: AppBar(
            elevation: 0,
            backgroundColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            title: Text(_titles[selectedIndex]),
            actions: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
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
                    child: Text(
                      controller.profile?.name[0].toUpperCase() ?? '?',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
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
          // GoRouter's StatefulNavigationShell renders the active branch and
          // preserves each branch's scroll/state via an IndexedStack internally.
          body: navigationShell,
          bottomNavigationBar: NavigationBar(
            selectedIndex: selectedIndex,
            onDestinationSelected: (index) {
              navigationShell.goBranch(
                index,
                // Re-tap the current tab scrolls to the top (standard UX).
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
        );
      },
    );
  }
}
