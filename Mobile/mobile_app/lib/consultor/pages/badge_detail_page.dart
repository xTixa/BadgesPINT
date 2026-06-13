import 'package:flutter/material.dart';
import 'upload_page.dart';
import '../consultor_controller.dart';
import '../consultor_models.dart';

class BadgeDetailPage extends StatelessWidget {
  final CatalogBadgeItem badge;
  final ConsultorController controller;

  const BadgeDetailPage({
    super.key,
    required this.badge,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    final requisitos = controller.requirements;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),

      appBar: AppBar(
        title: Text(badge.name),
        backgroundColor: const Color(0xFF0F62FE),
      ),

      body: Column(
        children: [
          // 🔹 HEADER
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  badge.name,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  badge.description,
                  style: TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // 🔹 LISTA DE REQUISITOS
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(12),
              children: [
                ...requisitos.map(
                  (req) => _requirementCard(
                    req.title,
                    controller.latestEvidenceForRequirement(req.id) != null,
                  ),
                ),
              ],
            ),
          ),

          // 🔹 BOTÕES
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                ),
              ],
            ),
            child: Row(
              children: [
                // Upload
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => UploadPage(controller: controller),
                        ),
                      );
                    },
                    icon: const Icon(Icons.upload_file),
                    label: const Text("Upload"),
                  ),
                ),

                const SizedBox(width: 10),

                // Candidatar
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F62FE),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: () async {
                      final ok = await controller.submitPedido();

                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              ok
                                  ? "Pedido submetido com sucesso"
                                  : "Erro ao submeter pedido",
                            ),
                          ),
                        );
                      }
                    },
                    child: const Text("Candidatar-me"),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _requirementCard(String title, bool completed) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(
            completed ? Icons.check_circle : Icons.radio_button_unchecked,
            color: completed ? Colors.green : Colors.grey,
          ),

          const SizedBox(width: 10),

          Expanded(child: Text(title, style: const TextStyle(fontSize: 14))),
        ],
      ),
    );
  }
}
