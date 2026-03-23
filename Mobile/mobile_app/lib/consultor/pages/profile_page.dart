import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../consultor_controller.dart';
import '../consultor_models.dart';
import '../widgets/section_card.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    final profile = controller.profile;
    final fullName = profile?.name ?? 'Consultant';
    final obtained = controller.badges.where((BadgeItem b) => b.isObtained).toList();
    final latestBadge = obtained.isNotEmpty ? obtained.first : null;
    final badgePublicLink = latestBadge != null ? 'https://badges.softinsa.pt/badge/${latestBadge.id}' : null;
    final competencies = <String>['React', 'DevOps', 'Outsystems', 'SQL'];

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      children: <Widget>[
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            gradient: const LinearGradient(
              colors: <Color>[Color(0xFF16558C), Color(0xFF1D4ED8)],
            ),
          ),
          padding: const EdgeInsets.all(16),
          child: Row(
            children: <Widget>[
              const CircleAvatar(
                radius: 34,
                backgroundColor: Colors.white,
                child: Icon(Icons.person, size: 38, color: Color(0xFF16558C)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      fullName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      _roleLabel(profile?.role ?? 'consultant'),
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.85)),
                    ),
                  ],
                ),
              ),
              FilledButton.tonalIcon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Edicao de perfil disponivel brevemente.')),
                  );
                },
                icon: const Icon(Icons.edit_outlined),
                label: const Text('Editar Perfil'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        GridView.count(
          physics: const NeverScrollableScrollPhysics(),
          shrinkWrap: true,
          crossAxisCount: 3,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 1.1,
          children: <Widget>[
            _kpiCard(Icons.star, const Color(0xFFF59E0B), '${controller.totalPoints}', 'Pontos Acumulados'),
            _kpiCard(Icons.workspace_premium, const Color(0xFF059669), '${controller.badgesObtidos}', 'Badges Obtidos'),
            _kpiCard(Icons.trending_up, const Color(0xFF0EA5E9), '${controller.globalProgress}%', 'Progresso Global'),
          ],
        ),
        const SizedBox(height: 12),
        SectionCard(
          title: 'Informacoes Pessoais',
          child: Column(
            children: <Widget>[
              _line('Email', profile?.email ?? 'sem email'),
              const SizedBox(height: 8),
              _line('Localizacao', profile?.location ?? 'Nao definida'),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SectionCard(
          title: 'Competencias',
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: competencies
                .map(
                  (String comp) => Chip(
                    label: Text(comp),
                    backgroundColor: const Color(0xFF0EA5E9),
                    labelStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                  ),
                )
                .toList(),
          ),
        ),
        const SizedBox(height: 12),
        if (latestBadge != null)
          SectionCard(
            title: 'Partilha e verificacao publica',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                Text('Badge em destaque: ${latestBadge.name}'),
                const SizedBox(height: 8),
                Text(
                  'Link unico de verificacao:',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 4),
                SelectableText(
                  badgePublicLink!,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: <Widget>[
                    OutlinedButton.icon(
                      onPressed: () async {
                        await Clipboard.setData(ClipboardData(text: badgePublicLink));
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Link copiado para a area de transferencia.')),
                        );
                      },
                      icon: const Icon(Icons.link),
                      label: const Text('Copiar link'),
                    ),
                    FilledButton.icon(
                      onPressed: () async {
                        final uri = Uri.parse(
                          'https://www.linkedin.com/sharing/share-offsite/?url=${Uri.encodeComponent(badgePublicLink)}',
                        );
                        await launchUrl(uri, mode: LaunchMode.externalApplication);
                      },
                      icon: const Icon(Icons.share_outlined),
                      label: const Text('Partilhar no LinkedIn'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        if (latestBadge != null) const SizedBox(height: 12),
        SectionCard(
          title: 'Atividade recente',
          child: Column(
            children: const <Widget>[
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.check_circle_outline, color: Color(0xFF059669)),
                title: Text('Conquistou o badge DevOps Intermedio'),
                subtitle: Text('Ha 2 dias'),
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.upload_file, color: Color(0xFF0284C7)),
                title: Text('Submeteu evidencias para Outsystems'),
                subtitle: Text('Ha 5 dias'),
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.edit_note, color: Color(0xFF7C3AED)),
                title: Text('Atualizou perfil profissional'),
                subtitle: Text('Ha 1 semana'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _kpiCard(IconData icon, Color color, String value, String label) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(icon, color: color),
            const SizedBox(height: 6),
            Text(value, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            const SizedBox(height: 2),
            Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          ],
        ),
      ),
    );
  }

  String _roleLabel(String role) {
    switch (role) {
      case 'consultant':
        return 'Consultor';
      case 'talent_manager':
        return 'Talent Manager';
      case 'service_line_leader':
        return 'Service Line Leader';
      case 'admin':
        return 'Administrador';
      default:
        return role;
    }
  }

  Widget _line(String label, String value) {
    return Row(
      children: <Widget>[
        Expanded(
          child: Text(
            label,
            style: const TextStyle(color: Color(0xFF475569)),
          ),
        ),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
