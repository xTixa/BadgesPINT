import 'package:flutter/material.dart';
import 'badge_detail_page.dart';
import '../consultor_controller.dart';

class BadgesPage extends StatelessWidget {
  final ConsultorController controller;

  const BadgesPage({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),

      appBar: AppBar(
        title: const Text("Badges"),
        backgroundColor: const Color(0xFF0F62FE),
        elevation: 0,
      ),

      body: Column(
        children: [
          // 🔹 Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFF0F62FE),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Explorar Badges",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 5),
                Text(
                  "Escolhe um badge e começa a tua jornada 🚀",
                  style: TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // 🔹 Lista de badges
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: 6,
              itemBuilder: (context, index) {
                return _badgeCard(context, index);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _badgeCard(BuildContext context, int index) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder:
                (_) => BadgeDetailPage(
                  badgeName: "Outsystems Junior",
                  controller: controller,
                ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
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
            // 🔹 Badge Icon
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: const Color(0xFF0F62FE).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.workspace_premium,
                color: Color(0xFF0F62FE),
                size: 30,
              ),
            ),

            const SizedBox(width: 16),

            // 🔹 Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Outsystems Junior",
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    "Completa os requisitos A1, A2 e A3",
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 8),

                  Row(
                    children: [
                      _levelChip("A"),
                      const SizedBox(width: 6),
                      _levelChip("Junior"),
                    ],
                  ),
                ],
              ),
            ),

            // 🔹 Arrow
            const Icon(Icons.arrow_forward_ios, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _levelChip(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF0F62FE).withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Color(0xFF0F62FE),
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
      ),
    );
  }
}
