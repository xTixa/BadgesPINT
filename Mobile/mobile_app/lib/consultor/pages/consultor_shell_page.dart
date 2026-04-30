import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../consultor_controller.dart';
import 'home_page.dart';
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
    'Todos os Cursos',
    'Os meus Cursos',
    'Fórum',
    'Perfil',
    'Alterar Palavra passe',
    'Ajuda',
  ];

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (BuildContext context, Widget? child) {
        if (controller.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final pages = <Widget>[
          HomePage(controller: controller),
          HistoryPage(controller: controller),
          UploadPage(controller: controller),
          RankingPage(controller: controller),
          ProfilePage(controller: controller),
          SettingsPage(
            currentThemeMode: currentThemeMode,
            onThemeModeChanged: onThemeModeChanged,
          ),
        ];

        final selectedIndex =
            controller.selectedTab <= 4 ? controller.selectedTab : 4;

        return LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth >= 900;

            if (isWide) {
              // ---------------- WEB / DESKTOP: SIDEBAR LAYOUT ----------------
              return Scaffold(
                body: Row(
                  children: <Widget>[
                    _Sidebar(
                      controller: controller,
                      currentThemeMode: currentThemeMode,
                      onThemeModeChanged: onThemeModeChanged,
                      onLogout: onLogout,
                    ),
                    const VerticalDivider(width: 1),
                    Expanded(
                      child: Column(
                        children: <Widget>[
                          _TopBar(
                            title: _titles[controller.selectedTab],
                            controller: controller,
                            onLogout: onLogout,
                          ),
                          const Divider(height: 1),
                          Expanded(child: pages[controller.selectedTab]),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }

            // ---------------- MOBILE: BOTTOM NAVIGATION ----------------
            final scheme = Theme.of(context).colorScheme;
            final unread =
                controller.notifications.where((n) => !n.read).length;

            return Scaffold(
              appBar: AppBar(
                title: Text(_titles[controller.selectedTab]),
                actions: <Widget>[
                  Semantics(
                    label:
                        unread == 0
                            ? 'Notificações, sem novas'
                            : 'Notificações, $unread por ler',
                    button: true,
                    child: Stack(
                      children: <Widget>[
                        IconButton(
                          tooltip: 'Notificações',
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
                    tooltip: 'Menu da sessão',
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
                    color: scheme.surface.withOpacity(0.94),
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
                      selectedIndex: selectedIndex,
                      onDestinationSelected: (int index) {
                        HapticFeedback.selectionClick();
                        controller.changeTab(index);
                      },
                      height: 96,
                      backgroundColor: Colors.transparent,
                      indicatorColor: scheme.primaryContainer,
                      labelBehavior:
                          NavigationDestinationLabelBehavior.alwaysShow,
                      destinations: const <NavigationDestination>[
                        NavigationDestination(
                          icon: Icon(Icons.school_outlined),
                          selectedIcon: Icon(Icons.school),
                          label: 'Formações',
                        ),
                        NavigationDestination(
                          icon: Icon(Icons.workspace_premium_outlined),
                          selectedIcon: Icon(Icons.workspace_premium),
                          label: 'Histórico',
                        ),
                        NavigationDestination(
                          icon: Icon(Icons.cloud_upload_outlined),
                          selectedIcon: Icon(Icons.cloud_upload),
                          label: 'Evidências',
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
      },
    );
  }

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
            title: Text('Definições'),
            subtitle: Text('Tema e preferências'),
          ),
        ),
        PopupMenuItem<String>(
          value: 'notifications',
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.notifications_none_rounded),
            title: const Text('Notificações'),
            subtitle: Text(unread == 0 ? 'Sem novas' : '$unread por ler'),
          ),
        ),
        const PopupMenuDivider(),
        const PopupMenuItem<String>(
          value: 'logout',
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(Icons.logout_rounded),
            title: Text('Terminar sessão'),
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
}

// ------------------------------------------------------------
//  TOP BAR (WEB)
// ------------------------------------------------------------
class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.title,
    required this.controller,
    required this.onLogout,
  });

  final String title;
  final ConsultorController controller;
  final Future<void> Function() onLogout;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final unread = controller.notifications.where((n) => !n.read).length;
    final name = controller.profile?.name ?? 'Consultor';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      color: scheme.surface,
      child: Row(
        children: <Widget>[
          Text(
            title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w800,
              letterSpacing: -0.2,
            ),
          ),
          const Spacer(),
          IconButton(
            tooltip: 'Notificações',
            onPressed: () async {
              await Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => NotificationsPage(controller: controller),
                ),
              );
            },
            icon: Stack(
              clipBehavior: Clip.none,
              children: <Widget>[
                const Icon(Icons.notifications_none_rounded),
                if (unread > 0)
                  Positioned(
                    right: -2,
                    top: -2,
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
          const SizedBox(width: 12),
          InkWell(
            borderRadius: BorderRadius.circular(999),
            onTap: () async {
              await onLogout();
            },
            child: Row(
              children: <Widget>[
                CircleAvatar(
                  radius: 18,
                  backgroundColor: scheme.primary.withOpacity(0.12),
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : 'C',
                    style: TextStyle(
                      color: scheme.primary,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  name.split(' ').first,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(width: 4),
                const Icon(Icons.keyboard_arrow_down_rounded, size: 18),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ------------------------------------------------------------
//  SIDEBAR (WEB)
// ------------------------------------------------------------
class _Sidebar extends StatelessWidget {
  const _Sidebar({
    required this.controller,
    required this.currentThemeMode,
    required this.onThemeModeChanged,
    required this.onLogout,
  });

  final ConsultorController controller;
  final ThemeMode currentThemeMode;
  final ValueChanged<ThemeMode> onThemeModeChanged;
  final Future<void> Function() onLogout;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final selected = controller.selectedTab;

    return Container(
      width: 260,
      color: scheme.surface,
      child: Column(
        children: <Widget>[
          Container(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
            alignment: Alignment.centerLeft,
            child: Row(
              children: <Widget>[
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: scheme.primary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Center(
                    child: Text(
                      'S',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  'Softinsa Consultor',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.2,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 12),
              children: <Widget>[
                _navItem(
                  context,
                  icon: Icons.school_outlined,
                  label: 'Todos os Cursos',
                  index: 0,
                  selected: selected == 0,
                ),
                _navItem(
                  context,
                  icon: Icons.bookmark_outlined,
                  label: 'Os meus Cursos',
                  index: 1,
                  selected: selected == 1,
                ),
                _navItem(
                  context,
                  icon: Icons.forum_outlined,
                  label: 'Fórum',
                  index: 2,
                  selected: selected == 2,
                ),
                _navItem(
                  context,
                  icon: Icons.account_circle_outlined,
                  label: 'Perfil',
                  index: 3,
                  selected: selected == 3,
                ),
                const SizedBox(height: 12),
                const Divider(),
                _navItem(
                  context,
                  icon: Icons.lock_outline_rounded,
                  label: 'Alterar Palavra passe',
                  index: 4,
                  selected: selected == 4,
                ),
                _navItem(
                  context,
                  icon: Icons.help_outline_rounded,
                  label: 'Ajuda',
                  index: 5,
                  selected: selected == 5,
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    const Text(
                      'Tema',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    Switch(
                      value: currentThemeMode == ThemeMode.dark,
                      onChanged: (bool value) {
                        onThemeModeChanged(
                          value ? ThemeMode.dark : ThemeMode.light,
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: () async {
                    await onLogout();
                  },
                  icon: const Icon(Icons.logout_rounded, size: 18),
                  label: const Text('Sair'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _navItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required int index,
    required bool selected,
  }) {
    final scheme = Theme.of(context).colorScheme;

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: ListTile(
        leading: Icon(
          icon,
          color: selected ? scheme.primary : scheme.onSurfaceVariant,
        ),
        title: Text(
          label,
          style: TextStyle(
            fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
            color: selected ? scheme.primary : scheme.onSurfaceVariant,
          ),
        ),
        selected: selected,
        selectedTileColor: scheme.primary.withOpacity(0.08),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        onTap: () {
          HapticFeedback.selectionClick();
          controller.changeTab(index);
        },
      ),
    );
  }
}
