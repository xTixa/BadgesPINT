import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../consultor_controller.dart';
import '../widgets/section_card.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage>
    with SingleTickerProviderStateMixin {
  late AnimationController _anim;
  late Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _anim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _fade = CurvedAnimation(parent: _anim, curve: Curves.easeIn);
    _anim.forward();
  }

  @override
  void dispose() {
    _anim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final controller = widget.controller;
    final profile = controller.profile;
    final fullName = profile?.name ?? 'Consultor';

    final obtained = controller.badges.where((b) => b.isObtained).toList();

    final totalBadges = controller.badges.length;
    final progress = totalBadges == 0 ? 0.0 : obtained.length / totalBadges;

    return FadeTransition(
      opacity: _fade,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: const LinearGradient(
                colors: [Color(0xFF0F62FE), Color(0xFF4589FF)],
              ),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 36,
                  backgroundColor: Colors.white,
                  child: Text(
                    fullName[0].toUpperCase(),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F62FE),
                    ),
                  ),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        fullName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        profile?.email ?? "",
                        style: TextStyle(color: Colors.white70),
                      ),
                    ],
                  ),
                ),

                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        "#${controller.rankingPosition}",
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const Text(
                        "Ranking",
                        style: TextStyle(color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: _statCard(
                  "Pontos",
                  controller.totalPoints.toString(),
                  Icons.stars,
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: _statCard(
                  "Badges",
                  obtained.length.toString(),
                  Icons.workspace_premium,
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: _statCard(
                  "Ranking",
                  controller.rankingPosition.toString(),
                  Icons.leaderboard,
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),
          // 🔹 PROGRESSO GLOBAL
          const Text(
            "Progresso geral",
            style: TextStyle(fontWeight: FontWeight.bold),
          ),

          const SizedBox(height: 8),

          LinearProgressIndicator(
            value: progress,
            minHeight: 8,
            color: scheme.primary,
            backgroundColor: Colors.grey.shade300,
          ),

          const SizedBox(height: 20),
          SectionCard(
            title: "Informações",
            child: Column(
              children: [
                _infoRow(Icons.email, "Email", profile?.email ?? "-"),

                _infoRow(
                  Icons.location_on,
                  "Localização",
                  profile?.location ?? "Não definida",
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),
          Text(
            "Badges Obtidos (${obtained.length})",
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),

          const SizedBox(height: 10),

          SectionCard(
            title: "Badges Obtidos",
            child: Column(
              children:
                  obtained.take(5).map((badge) {
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(
                        Icons.workspace_premium,
                        color: Color(0xFF0F62FE),
                      ),
                      title: Text(badge.name),
                      subtitle: Text("${badge.points} pontos"),
                    );
                  }).toList(),
            ),
          ),
          const SizedBox(height: 20),

          // 🔹 PARTILHA
          if (obtained.isNotEmpty)
            SectionCard(
              title: 'Partilha',
              child: Column(
                children: [
                  ElevatedButton.icon(
                    onPressed: () async {
                      final link =
                          'https://badges.softinsa.pt/badge/${obtained.first.id}';

                      await Clipboard.setData(ClipboardData(text: link));

                      if (!mounted) return;

                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Link copiado")),
                      );
                    },
                    icon: const Icon(Icons.link),
                    label: const Text("Copiar link"),
                  ),

                  const SizedBox(height: 8),

                  ElevatedButton.icon(
                    onPressed: () async {
                      final link =
                          'https://badges.softinsa.pt/badge/${obtained.first.id}';

                      final uri = Uri.parse(
                        'https://www.linkedin.com/sharing/share-offsite/?url=${Uri.encodeComponent(link)}',
                      );

                      await launchUrl(uri);
                    },
                    icon: const Icon(Icons.share),
                    label: const Text("LinkedIn"),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _statCard(String title, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(icon, color: const Color(0xFF0F62FE)),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          Text(title, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF0F62FE)),

          const SizedBox(width: 12),

          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),

          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
