import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../consultor_controller.dart';
import 'dashboard_page.dart';
import 'history_page.dart';
import 'notifications_page.dart';
import 'profile_page.dart';
import 'ranking_page.dart';
import 'settings_page.dart';
import 'upload_page.dart';

class ConsultorShellPage extends StatelessWidget {
  const ConsultorShellPage({
    required this.controller,
    required this.onLogout,
    required this.currentThemeMode,
    required this.onThemeModeChanged,
    super.key,
  });

  final ConsultorController controller;
  final Future<void> Function() onLogout;
  final ThemeMode currentThemeMode;
  final ValueChanged<ThemeMode> onThemeModeChanged;

  static const List<String> _titles = <String>[
    'Dashboard',
    'Historico de Badges',
    'Upload de Evidencias',
    'Ranking de Consultores',
    'Perfil',
    'Definicoes do Consultor',
  ];

  Future<void> _openNotifications(BuildContext context) async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => NotificationsPage(controller: controller),
      ),
    );
  }

  Future<void> _openSessionMenu(BuildContext context, int unread) async {
    final action = await showMenu<String>(
      context: context,
      position: const RelativeRect.fromLTRB(1000, 74, 16, 0),
      items: <PopupMenuEntry<String>>[
        const PopupMenuItem<String>(
          value: 'settings',
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(Icons.tune_rounded),
            title: Text('Definicoes'),
            subtitle: Text('Tema e preferencias'),
          ),
        ),
        PopupMenuItem<String>(
          value: 'notifications',
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.notifications_none_rounded),
            title: const Text('Notificacoes'),
            subtitle: Text(unread == 0 ? 'Sem novas' : '$unread por ler'),
          ),
        ),
        const PopupMenuDivider(),
        const PopupMenuItem<String>(
          value: 'logout',
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(Icons.logout_rounded),
            title: Text('Terminar sessao'),
          ),
        ),
      ],
    );

    if (action == null || !context.mounted) return;

    if (action == 'settings') {
      controller.changeTab(5);
    } else if (action == 'notifications') {
      await _openNotifications(context);
    } else if (action == 'logout') {
      await onLogout();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (BuildContext context, Widget? child) {
        final scheme = Theme.of(context).colorScheme;
        final unread = controller.notifications.where((n) => !n.read).length;
        final selectedNavIndex =
            controller.selectedTab <= 4 ? controller.selectedTab : 4;

        final pages = <Widget>[
          DashboardPage(controller: controller),
          HistoryPage(controller: controller),
          UploadPage(controller: controller),
          RankingPage(controller: controller),
          ProfilePage(controller: controller),
          SettingsPage(
            currentThemeMode: currentThemeMode,
            onThemeModeChanged: onThemeModeChanged,
          ),
        ];

        if (controller.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        return Scaffold(
          appBar: AppBar(
            title: Text(_titles[controller.selectedTab]),
            actions: <Widget>[
              Semantics(
                label:
                    unread == 0
                        ? 'Notificacoes, sem novas'
                        : 'Notificacoes, $unread por ler',
                button: true,
                child: Stack(
                  children: <Widget>[
                    IconButton(
                      tooltip: 'Notificacoes',
                      onPressed: () => _openNotifications(context),
                      icon: const Icon(Icons.notifications_none_rounded),
                    ),
                    if (unread > 0)
                      Positioned(
                        right: 9,
                        top: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 5,
                            vertical: 1,
                          ),
                          decoration: BoxDecoration(
                            color: scheme.error,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            unread > 9 ? '9+' : unread.toString(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              IconButton(
                tooltip: 'Menu da sessao',
                onPressed: () => _openSessionMenu(context, unread),
                icon: const Icon(Icons.tune_rounded),
              ),
            ],
          ),
          body: pages[controller.selectedTab],
          bottomNavigationBar: SafeArea(
            minimum: const EdgeInsets.fromLTRB(12, 0, 12, 10),
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: scheme.surface.withValues(alpha: 0.94),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: scheme.outlineVariant),
                boxShadow: const <BoxShadow>[
                  BoxShadow(
                    color: Color(0x240F172A),
                    blurRadius: 24,
                    offset: Offset(0, 12),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: NavigationBar(
                  selectedIndex: selectedNavIndex,
                  onDestinationSelected: (int index) {
                    HapticFeedback.selectionClick();
                    controller.changeTab(index);
                  },
                  height: 80,
                  backgroundColor: Colors.transparent,
                  indicatorColor: scheme.primaryContainer,
                  labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
                  destinations: const <NavigationDestination>[
                    NavigationDestination(
                      icon: Icon(Icons.dashboard_outlined),
                      selectedIcon: Icon(Icons.dashboard_rounded),
                      label: 'Dashboard',
                    ),
                    NavigationDestination(
                      icon: Icon(Icons.workspace_premium_outlined),
                      selectedIcon: Icon(Icons.workspace_premium),
                      label: 'Historico',
                    ),
                    NavigationDestination(
                      icon: Icon(Icons.cloud_upload_outlined),
                      selectedIcon: Icon(Icons.cloud_upload),
                      label: 'Evidencias',
                    ),
                    NavigationDestination(
                      icon: Icon(Icons.leaderboard_outlined),
                      selectedIcon: Icon(Icons.leaderboard),
                      label: 'Ranking',
                    ),
                    NavigationDestination(
                      icon: Icon(Icons.account_circle_outlined),
                      selectedIcon: Icon(Icons.account_circle),
                      label: 'Perfil',
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
