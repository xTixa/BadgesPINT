import 'package:flutter/material.dart';

import '../controllers/consultor_controller.dart';
import 'dashboard_page.dart';
import 'history_page.dart';
import 'profile_page.dart';
import 'ranking_page.dart';
import 'settings_page.dart';
import 'upload_page.dart';

class ConsultorShellPage extends StatelessWidget {
  const ConsultorShellPage({required this.controller, super.key});

  final ConsultorController controller;

  static const List<String> _titles = <String>[
    'Dashboard',
    'Meus Badges',
    'Upload Evidencias',
    'Ranking',
    'Perfil',
    'Definicoes',
  ];

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (BuildContext context, Widget? child) {
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
          ),
          body: pages[controller.selectedTab],
          bottomNavigationBar: NavigationBar(
            selectedIndex: controller.selectedTab,
            onDestinationSelected: controller.changeTab,
            height: 72,
            destinations: const <NavigationDestination>[
              NavigationDestination(
                icon: Icon(Icons.dashboard_outlined),
                selectedIcon: Icon(Icons.dashboard),
                label: 'Home',
              ),
              NavigationDestination(
                icon: Icon(Icons.workspace_premium_outlined),
                selectedIcon: Icon(Icons.workspace_premium),
                label: 'Badges',
              ),
              NavigationDestination(
                icon: Icon(Icons.upload_file_outlined),
                selectedIcon: Icon(Icons.upload_file),
                label: 'Upload',
              ),
              NavigationDestination(
                icon: Icon(Icons.emoji_events_outlined),
                selectedIcon: Icon(Icons.emoji_events),
                label: 'Ranking',
              ),
              NavigationDestination(
                icon: Icon(Icons.person_outline),
                selectedIcon: Icon(Icons.person),
                label: 'Perfil',
              ),
              NavigationDestination(
                icon: Icon(Icons.settings_outlined),
                selectedIcon: Icon(Icons.settings),
                label: 'Ajustes',
              ),
            ],
          ),
        );
      },
    );
  }
}
