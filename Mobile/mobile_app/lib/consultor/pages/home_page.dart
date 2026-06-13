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

    final badges =
        controller.preferredAreaBadges.isNotEmpty
            ? controller.preferredAreaBadges
            : controller.catalogBadges;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [scheme.primary, scheme.primary.withOpacity(0.85)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Olá, $name!",
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),

                            const SizedBox(height: 8),

                            const Text(
                              "Continua a desenvolver as tuas competências",
                              style: TextStyle(color: Colors.white70),
                            ),
                          ],
                        ),
                      ),

                      CircleAvatar(
                        radius: 32,
                        backgroundColor: Colors.white24,
                        child: Text(
                          name.isNotEmpty ? name[0].toUpperCase() : "?",
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  Row(
                    children: [
                      _heroStat(controller.totalPoints.toString(), "Pontos"),

                      const SizedBox(width: 32),

                      _heroStat(
                        controller.catalogBadges.length.toString(),
                        "Badges",
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            TextField(
              decoration: InputDecoration(
                hintText: "Pesquisar badges...",
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(18),
                  borderSide: BorderSide.none,
                ),
              ),
            ),

            const SizedBox(height: 24),

            /// Featured Badges Section
            const Text(
              "Recomendados para Ti",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 180,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,

                itemCount: badges.length,
                itemBuilder: (context, index) {
                  final badge = badges[index];

                  return _featuredBadgeCard(context, badge, scheme);
                },
              ),
            ),
            const SizedBox(height: 24),

            /// All Badges Section
            const Text(
              "Explorar Todos",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: controller.catalogBadges.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.85,
              ),
              itemBuilder: (context, index) {
                return _smallBadgeCard(
                  context,
                  controller.catalogBadges[index],
                  scheme,
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _featuredBadgeCard(
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
                (_) =>
                    BadgeDetailPage(badge: badge, controller: controller),
          ),
        );
      },
      child: Container(
        width: 280,
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [scheme.primary, scheme.primary.withOpacity(0.85)],
          ),
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(
                Icons.workspace_premium,
                color: Colors.white,
                size: 30,
              ),
            ),
            const Spacer(),
            Text(
              badge.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              badge.areaName ?? "Área Geral",
              style: const TextStyle(color: Colors.white70),
            ),

            const SizedBox(height: 12),

            LinearProgressIndicator(
              value: 0.6,
              minHeight: 6,
              borderRadius: BorderRadius.circular(10),
              backgroundColor: Colors.white24,
              valueColor: const AlwaysStoppedAnimation(Colors.white),
            ),
            const SizedBox(height: 12),
            Text(
              "${badge.points} pontos",
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _smallBadgeCard(
    BuildContext context,
    CatalogBadgeItem badge,
    ColorScheme scheme,
  ) {
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder:
                (_) =>
                    BadgeDetailPage(badge: badge, controller: controller),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: scheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.workspace_premium, color: scheme.primary),
            ),
            const Spacer(),
            Text(
              badge.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              badge.areaName ?? "Geral",
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
            const SizedBox(height: 8),
            Text(
              "${badge.points} pts",
              style: TextStyle(
                color: scheme.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _heroStat(String value, String label) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(label, style: const TextStyle(color: Colors.white70)),
      ],
    );
  }
}
