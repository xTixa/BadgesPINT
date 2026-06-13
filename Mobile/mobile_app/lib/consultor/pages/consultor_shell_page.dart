import 'package:flutter/material.dart';

import '../consultor_controller.dart';
import 'home_page.dart';
import 'history_page.dart';
import 'profile_page.dart';
import 'ranking_page.dart';
import 'upload_page.dart';

class ConsultorShellPage extends StatelessWidget {
  const ConsultorShellPage({
    required this.controller,
    required this.onLogout,
    super.key,
  });

  final ConsultorController controller;
  final Future<void> Function() onLogout;

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
