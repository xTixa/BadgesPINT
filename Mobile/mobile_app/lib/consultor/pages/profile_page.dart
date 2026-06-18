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
  bool _savingProfile = false;
  bool _savingPassword = false;

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

                IconButton(
                  tooltip: 'Editar perfil',
                  onPressed: _savingProfile ? null : _openEditProfileSheet,
                  icon: const Icon(Icons.edit, color: Colors.white),
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
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _savingPassword ? null : _openChangePasswordSheet,
              icon: const Icon(Icons.lock_reset_outlined),
              label: const Text('Alterar password'),
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
                  Icons.hub_outlined,
                  "Area",
                  _areaName(profile?.areaId),
                ),

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
                      final messenger = ScaffoldMessenger.of(context);
                      final link =
                          'https://badges.softinsa.pt/badge/${obtained.first.id}';

                      await Clipboard.setData(ClipboardData(text: link));

                      if (!mounted) return;

                      messenger.showSnackBar(
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

  String _areaName(int? areaId) {
    if (areaId == null) return 'Nao definida';
    for (final area in widget.controller.areas) {
      if (area.id == areaId) return area.name;
    }
    return 'Nao definida';
  }

  Future<void> _openEditProfileSheet() async {
    final profile = widget.controller.profile;
    if (profile == null) return;

    final nameController = TextEditingController(text: profile.name);
    final emailController = TextEditingController(text: profile.email);
    final areaIds = widget.controller.areas.map((area) => area.id).toSet();
    int? selectedAreaId =
        areaIds.contains(profile.areaId) ? profile.areaId : null;

    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(
                16,
                16,
                16,
                MediaQuery.of(context).viewInsets.bottom + 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Editar perfil',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(context, false),
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: nameController,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Nome',
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<int>(
                    value: selectedAreaId,
                    decoration: const InputDecoration(
                      labelText: 'Area principal',
                      prefixIcon: Icon(Icons.hub_outlined),
                    ),
                    items:
                        widget.controller.areas
                            .map(
                              (area) => DropdownMenuItem<int>(
                                value: area.id,
                                child: Text(area.name),
                              ),
                            )
                            .toList(),
                    onChanged: (value) {
                      setSheetState(() => selectedAreaId = value);
                    },
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: () async {
                      final name = nameController.text.trim();
                      final email = emailController.text.trim();

                      if (name.isEmpty || email.isEmpty || !email.contains('@')) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Preenche nome e email valido.'),
                          ),
                        );
                        return;
                      }

                      final navigator = Navigator.of(context);
                      setState(() => _savingProfile = true);
                      final ok = await widget.controller.updateProfile(
                        name: name,
                        email: email,
                        areaId: selectedAreaId,
                      );
                      if (!mounted) return;
                      setState(() => _savingProfile = false);
                      navigator.pop(ok);
                    },
                    icon: const Icon(Icons.save_outlined),
                    label: Text(_savingProfile ? 'A guardar...' : 'Guardar'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );

    nameController.dispose();
    emailController.dispose();

    if (!mounted || result == null) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          result ? 'Perfil atualizado com sucesso.' : 'Erro ao atualizar perfil.',
        ),
      ),
    );
  }

  Future<void> _openChangePasswordSheet() async {
    final currentController = TextEditingController();
    final newController = TextEditingController();
    final confirmController = TextEditingController();

    final result = await showModalBottomSheet<String?>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(
            16,
            16,
            16,
            MediaQuery.of(context).viewInsets.bottom + 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Alterar password',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: currentController,
                obscureText: true,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Password atual',
                  prefixIcon: Icon(Icons.lock_outline),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: newController,
                obscureText: true,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Nova password',
                  prefixIcon: Icon(Icons.lock_reset_outlined),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: confirmController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Confirmar nova password',
                  prefixIcon: Icon(Icons.verified_user_outlined),
                ),
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: () async {
                  final current = currentController.text;
                  final next = newController.text;
                  final confirm = confirmController.text;
                  final messenger = ScaffoldMessenger.of(context);
                  final navigator = Navigator.of(context);

                  if (current.isEmpty || next.length < 6) {
                    messenger.showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Indica a password atual e uma nova com pelo menos 6 caracteres.',
                        ),
                      ),
                    );
                    return;
                  }

                  if (next != confirm) {
                    messenger.showSnackBar(
                      const SnackBar(
                        content: Text('As passwords nao coincidem.'),
                      ),
                    );
                    return;
                  }

                  setState(() => _savingPassword = true);
                  final error = await widget.controller.changePassword(
                    currentPassword: current,
                    newPassword: next,
                  );
                  if (!mounted) return;
                  setState(() => _savingPassword = false);
                  navigator.pop(error ?? '');
                },
                icon: const Icon(Icons.save_outlined),
                label: Text(_savingPassword ? 'A guardar...' : 'Guardar'),
              ),
            ],
          ),
        );
      },
    );

    currentController.dispose();
    newController.dispose();
    confirmController.dispose();

    if (!mounted || result == null) return;
    if (result.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password alterada com sucesso.')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result)),
      );
    }
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
