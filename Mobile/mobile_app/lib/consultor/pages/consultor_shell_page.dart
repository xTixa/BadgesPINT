import 'package:flutter/material.dart';

import '../consultor_controller.dart';
import 'home_page.dart';
import 'history_page.dart';
import 'profile_page.dart';
import 'ranking_page.dart';
import 'upload_page.dart';
import 'settings_page.dart';

class ConsultorShellPage extends StatelessWidget {
  const ConsultorShellPage({
    required this.controller,
    required this.onLogout,
    super.key,
  });

  final ConsultorController controller;
  final Future<void> Function() onLogout;

  String _getPageTitle() {
    switch (controller.selectedTab) {
      case 0:
        return "Home";
      case 1:
        return "Histórico";
      case 2:
        return "Upload";
      case 3:
        return "Ranking";
      case 4:
        return "Perfil";
      default:
        return "Softinsa Badges";
    }
  }

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

        final pages = [
          HomePage(controller: controller),
          HistoryPage(controller: controller),
          UploadPage(controller: controller),
          RankingPage(controller: controller),
          ProfilePage(controller: controller),
        ];

        return Scaffold(
          appBar: AppBar(
            elevation: 0,
            backgroundColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            title: Text(_getPageTitle()),

            actions: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Notificações em breve")),
                  );
                },
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
                    if (value == "settings") {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const SettingsPage()),
                      );
                    }

                    if (value == "logout") {
                      await onLogout();
                    }
                  },

                  child: CircleAvatar(
                    radius: 18,
                    backgroundColor: const Color(0xFF0F62FE),
                    child: Text(
                      controller.profile?.name[0].toUpperCase() ?? "?",
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),

                  itemBuilder:
                      (context) => [
                        const PopupMenuItem(
                          value: "settings",
                          child: Row(
                            children: [
                              Icon(Icons.settings_outlined),
                              SizedBox(width: 12),
                              Text("Definições"),
                            ],
                          ),
                        ),

                        const PopupMenuDivider(),

                        const PopupMenuItem(
                          value: "logout",
                          child: Row(
                            children: [
                              Icon(Icons.logout_rounded, color: Colors.red),
                              SizedBox(width: 12),
                              Text(
                                "Terminar Sessão",
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

          body: pages[controller.selectedTab],

          bottomNavigationBar: NavigationBar(
            selectedIndex: controller.selectedTab,

            onDestinationSelected: (index) {
              controller.changeTab(index);
            },

            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.home_rounded),
                label: "Home",
              ),

              NavigationDestination(
                icon: Icon(Icons.history_rounded),
                label: "Histórico",
              ),

              NavigationDestination(
                icon: Icon(Icons.upload_rounded),
                label: "Upload",
              ),

              NavigationDestination(
                icon: Icon(Icons.leaderboard_rounded),
                label: "Ranking",
              ),

              NavigationDestination(
                icon: Icon(Icons.person_rounded),
                label: "Perfil",
              ),
            ],
          ),
        );
      },
    );
  }
}
