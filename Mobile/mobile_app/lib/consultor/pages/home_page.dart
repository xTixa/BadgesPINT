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

    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),

      appBar: AppBar(
        title: const Text("Softinsa Badges"),
        backgroundColor: const Color(0xFF0F62FE),
      ),

      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 🔹 HEADER BONITO
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF0F62FE),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Explorar Formações 🚀",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  "Escolhe um badge e começa a tua jornada",
                  style: TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // 🔹 LISTA DE BADGES (REAL)
          if (controller.catalogBadges.isEmpty)
            const Center(child: Text("Sem badges disponíveis"))
          else
            ...controller.catalogBadges.map((badge) {
              return _badgeCard(context, badge, scheme);
            }),
        ],
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
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),

        child: Row(
          children: [
            // 🔹 ICON
            Container(
              width: 55,
              height: 55,
              decoration: BoxDecoration(
                color: scheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.workspace_premium, color: scheme.primary),
            ),

            const SizedBox(width: 12),

            // 🔹 INFO
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    badge.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),

                  const SizedBox(height: 4),

                  Text(
                    badge.description.isEmpty
                        ? "Sem descrição"
                        : badge.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.grey),
                  ),

                  const SizedBox(height: 6),

                  Row(children: [_chip("${badge.points} pts", scheme)]),
                ],
              ),
            ),

            const Icon(Icons.arrow_forward_ios, size: 14),
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
