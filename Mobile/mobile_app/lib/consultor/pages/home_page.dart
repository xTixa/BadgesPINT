import 'package:flutter/material.dart';
import '../consultor_controller.dart';
import '../consultor_models.dart';
import 'badge_detail_page.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key, required this.controller});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final name = controller.profile?.name ?? "Consultor";

    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),

      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // 🔹 HEADER PREMIUM
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F62FE), Color(0xFF4589FF)],
                ),
                borderRadius: BorderRadius.circular(22),
              ),
              child: Row(
                children: [
                  // Avatar
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: Colors.white,
                    child: Text(
                      name[0].toUpperCase(),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F62FE),
                      ),
                    ),
                  ),

                  const SizedBox(width: 12),

                  // Textos
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Bem-vindo 👋",
                          style: TextStyle(color: Colors.white70),
                        ),
                        Text(
                          name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Pontos
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      "${controller.totalPoints} pts",
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // 🔹 TÍTULO
            const Text(
              "Explorar Badges",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 12),

            // 🔹 LISTA
            if (controller.catalogBadges.isEmpty)
              const Center(child: Text("Sem badges disponíveis"))
            else
              ...controller.catalogBadges.map((badge) {
                return _badgeCard(context, badge, scheme);
              }),
          ],
        ),
      ),
    );
  }

  Widget _badgeCard(
    BuildContext context,
    CatalogBadgeItem badge,
    ColorScheme scheme,
  ) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder:
                (_) => BadgeDetailPage(
                  badgeName: badge.name,
                  controller: controller,
                ),
          ),
        );
      },

      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),

        child: Row(
          children: [
            // 🔹 ICON GRANDE
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: scheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                Icons.workspace_premium,
                color: scheme.primary,
                size: 30,
              ),
            ),

            const SizedBox(width: 14),

            // 🔹 INFO
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    badge.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),

                  const SizedBox(height: 4),

                  Text(
                    badge.description.isEmpty
                        ? "Sem descrição"
                        : badge.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.grey, fontSize: 13),
                  ),

                  const SizedBox(height: 8),

                  Row(
                    children: [
                      _chip("${badge.points} pts", scheme),
                      const SizedBox(width: 6),
                      _chip("Badge", scheme),
                    ],
                  ),
                ],
              ),
            ),

            const Icon(Icons.arrow_forward_ios, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _chip(String text, ColorScheme scheme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: scheme.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: scheme.primary,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
      ),
    );
  }
}
