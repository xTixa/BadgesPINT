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
          body: Row(
            children: [
              SidebarModern(controller: controller, onLogout: onLogout),
              Expanded(
                child: Column(
                  children: [
                    TopBarModern(controller: controller),
                    const Divider(height: 1),
                    Expanded(child: pages[controller.selectedTab]),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class SidebarModern extends StatefulWidget {
  const SidebarModern({
    required this.controller,
    required this.onLogout,
    super.key,
  });

  final ConsultorController controller;
  final Future<void> Function() onLogout;

  @override
  State<SidebarModern> createState() => _SidebarModernState();
}

class _SidebarModernState extends State<SidebarModern> {
  bool collapsed = false;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeOutCubic,
      width: collapsed ? 90 : 200,
      decoration: BoxDecoration(
        color: scheme.surface,
        border: Border(right: BorderSide(color: scheme.outlineVariant)),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: scheme.primary,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.business_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),

                    const SizedBox(width: 10),

                    Expanded(
                      child: AnimatedOpacity(
                        duration: const Duration(milliseconds: 200),
                        opacity: collapsed ? 0 : 1,
                        child: const Text(
                          "Softinsa",
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                Align(
                  alignment: Alignment.centerRight,
                  child: IconButton(
                    tooltip: collapsed ? "Expandir menu" : "Recolher menu",
                    icon: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 250),
                      child: Icon(
                        collapsed
                            ? Icons.menu_open_rounded
                            : Icons.menu_rounded,
                        key: ValueKey(collapsed),
                        size: 22,
                      ),
                    ),
                    onPressed: () {
                      setState(() => collapsed = !collapsed);
                    },
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          const SizedBox(height: 8),

          _navItem(Icons.home_rounded, "Home", 0),
          _navItem(Icons.history_rounded, "Histórico", 1),
          _navItem(Icons.upload_rounded, "Upload", 2),
          _navItem(Icons.leaderboard_rounded, "Ranking", 3),
          _navItem(Icons.person_rounded, "Perfil", 4),

          const Spacer(),

          const Divider(height: 1),

          Padding(
            padding: const EdgeInsets.all(8),
            child: _navItem(Icons.logout_rounded, "Sair", -1, isLogout: true),
          ),
        ],
      ),
    );
  }

  Widget _navItem(
    IconData icon,
    String label,
    int index, {
    bool isLogout = false,
  }) {
    final scheme = Theme.of(context).colorScheme;
    final selected = widget.controller.selectedTab == index;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color:
              selected ? scheme.primary.withOpacity(0.12) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border:
              selected
                  ? Border.all(color: scheme.primary.withOpacity(0.3))
                  : null,
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () async {
            if (isLogout) {
              await widget.onLogout();
              return;
            }
            widget.controller.changeTab(index);
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: Row(
              children: [
                Icon(
                  icon,
                  color: selected ? scheme.primary : scheme.onSurfaceVariant,
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: AnimatedOpacity(
                    duration: const Duration(milliseconds: 200),
                    opacity: collapsed ? 0 : 1,
                    child: IgnorePointer(
                      ignoring: collapsed,
                      child: Text(
                        label,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight:
                              selected ? FontWeight.w700 : FontWeight.w500,
                          color: selected ? scheme.primary : scheme.onSurface,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class TopBarModern extends StatelessWidget {
  const TopBarModern({required this.controller, super.key});

  final ConsultorController controller;

  String getPageTitle() {
    switch (controller.selectedTab) {
      case 0:
        return "Home";
      case 1:
        return "Histórico";
      case 2:
        return "Upload de Evidências";
      case 3:
        return "Ranking";
      case 4:
        return "Perfil";
      default:
        return "Dashboard";
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final name = controller.profile?.name ?? "Consultor";

    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: scheme.surface,
        border: Border(bottom: BorderSide(color: scheme.outlineVariant)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              getPageTitle(),
              style: Theme.of(context).textTheme.titleMedium,
              overflow: TextOverflow.ellipsis,
            ),
          ),

          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          ),

          const SizedBox(width: 8),

          CircleAvatar(
            radius: 16,
            child: Text(name.isNotEmpty ? name[0] : "?"),
          ),
        ],
      ),
    );
  }
}
