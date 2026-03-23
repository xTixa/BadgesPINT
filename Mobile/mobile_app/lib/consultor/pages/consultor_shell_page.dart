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
    super.key,
  });

  final ConsultorController controller;
  final Future<void> Function() onLogout;

  static const List<String> _titles = <String>[
    'Dashboard',
    'Historico de Badges',
    'Upload de Evidencias',
    'Ranking de Consultores',
    'Perfil',
    'Definicoes do Consultor',
  ];

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (BuildContext context, Widget? child) {
        final unread = controller.notifications.where((n) => !n.read).length;
        final pages = <Widget>[
          DashboardPage(controller: controller),
          HistoryPage(controller: controller),
          UploadPage(controller: controller),
          RankingPage(controller: controller),
          ProfilePage(controller: controller),
          const SettingsPage(),
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
              Padding(
                padding: const EdgeInsets.only(right: 4),
                child: Stack(
                  children: <Widget>[
                    IconButton(
                      tooltip: 'Notificacoes',
                      onPressed: () async {
                        await Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => NotificationsPage(controller: controller),
                          ),
                        );
                      },
                      icon: const Icon(Icons.notifications_none_rounded),
                    ),
                    if (unread > 0)
                      Positioned(
                        right: 8,
                        top: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDC2626),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            unread > 9 ? '9+' : unread.toString(),
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              IconButton(
                tooltip: 'Terminar sessao',
                onPressed: onLogout,
                icon: const Icon(Icons.logout_rounded),
              ),
            ],
          ),
          body: pages[controller.selectedTab],
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => controller.changeTab(2),
            icon: const Icon(Icons.upload_file_outlined),
            label: const Text('Upload rapido'),
          ),
          bottomNavigationBar: SafeArea(
            minimum: const EdgeInsets.fromLTRB(12, 0, 12, 10),
            child: DecoratedBox(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(22),
                boxShadow: const <BoxShadow>[
                  BoxShadow(
                    color: Color(0x22000000),
                    blurRadius: 18,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(22),
                child: NavigationBar(
                  selectedIndex: controller.selectedTab,
                  onDestinationSelected: (int index) {
                    HapticFeedback.selectionClick();
                    controller.changeTab(index);
                  },
                  height: 74,
                  backgroundColor: Colors.white,
                  indicatorColor: const Color(0xFFDCEEFF),
                  labelBehavior: NavigationDestinationLabelBehavior.onlyShowSelected,
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
                    NavigationDestination(
                      icon: Icon(Icons.tune_outlined),
                      selectedIcon: Icon(Icons.tune),
                      label: 'Definicoes',
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
