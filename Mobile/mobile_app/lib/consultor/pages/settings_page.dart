import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../consultor_controller.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Definições'), centerTitle: false),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
        children: <Widget>[
          _buildHeader(context, scheme),
          const SizedBox(height: 20),
          _SettingsMenuCard(
            icon: Icons.person_outline,
            title: 'Perfil e objetivos',
            subtitle: 'Nome, área principal, metas pessoais e password.',
            onTap: () => context.push('/settings/profile'),
          ),
          const SizedBox(height: 12),
          _SettingsMenuCard(
            icon: Icons.notifications_outlined,
            title: 'Notificações',
            subtitle: 'Emails, alertas de expiração e lembretes.',
            onTap: () => context.push('/settings/notifications'),
          ),
          const SizedBox(height: 12),
          _SettingsMenuCard(
            icon: Icons.privacy_tip_outlined,
            title: 'Privacidade',
            subtitle:
                'Galeria pública, LinkedIn, assinatura de email e RGPD.',
            onTap: () => context.push('/settings/privacy'),
          ),
          const SizedBox(height: 12),
          _SettingsMenuCard(
            icon: Icons.help_outline_rounded,
            title: 'Ajuda e recursos',
            subtitle: 'Galeria pública, Learning Paths e perguntas frequentes.',
            onTap: () => context.push('/settings/help'),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, ColorScheme scheme) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          colors: [Color(0xFF0F62FE), Color(0xFF4589FF)],
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: Colors.white,
            child: Text(
              "",
              style: TextStyle(
                color: scheme.primary,
                fontWeight: FontWeight.bold,
                fontSize: 20,
              ),
            ),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Definições",
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 22,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  "Conta, notificações e privacidade",
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),
          const Icon(Icons.settings, color: Colors.white),
        ],
      ),
    );
  }
}

class _SettingsMenuCard extends StatelessWidget {
  const _SettingsMenuCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: <Widget>[
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: scheme.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: scheme.primary),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: scheme.onSurfaceVariant,
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.chevron_right_rounded, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}
