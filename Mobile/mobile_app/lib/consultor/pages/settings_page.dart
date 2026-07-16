import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/app_theme.dart';
import '../consultor_controller.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Definições'), centerTitle: false),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
        children: <Widget>[
          _buildHeader(context),
          const SizedBox(height: 20),
          _SettingsMenuCard(
            icon: Icons.person_outline,
            title: 'Perfil e objetivos',
            subtitle: 'Nome, área principal, metas pessoais e password.',
            background: AppColors.pastelBlue,
            border: AppColors.pastelBlueBorder,
            iconColor: AppColors.primary,
            onTap: () => context.push('/settings/profile'),
          ),
          const SizedBox(height: 12),
          _SettingsMenuCard(
            icon: Icons.notifications_outlined,
            title: 'Notificações',
            subtitle: 'Emails, alertas de expiração e lembretes.',
            background: AppColors.pastelPeach,
            border: AppColors.pastelPeachBorder,
            iconColor: const Color(0xFFC2760F),
            onTap: () => context.push('/settings/notifications'),
          ),
          const SizedBox(height: 12),
          _SettingsMenuCard(
            icon: Icons.privacy_tip_outlined,
            title: 'Privacidade',
            subtitle:
                'Galeria pública, LinkedIn, assinatura de email e RGPD.',
            background: AppColors.pastelLilac,
            border: AppColors.pastelLilacBorder,
            iconColor: const Color(0xFF7C4FD1),
            onTap: () => context.push('/settings/privacy'),
          ),
          const SizedBox(height: 12),
          _SettingsMenuCard(
            icon: Icons.help_outline_rounded,
            title: 'Ajuda e recursos',
            subtitle: 'Galeria pública, Learning Paths e perguntas frequentes.',
            background: AppColors.pastelMint,
            border: AppColors.pastelMintBorder,
            iconColor: const Color(0xFF1D9A6C),
            onTap: () => context.push('/settings/help'),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.pastelBlue,
        borderRadius: BorderRadius.circular(AppRadius.header),
        border: Border.all(color: AppColors.pastelBlueBorder),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: Colors.white,
            child: Icon(Icons.settings_rounded, color: AppColors.primary),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Definições",
                  style: TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.bold,
                    fontSize: 22,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  "Conta, notificações e privacidade",
                  style: TextStyle(color: Color(0x991E293B), fontSize: 12),
                ),
              ],
            ),
          ),
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
    required this.background,
    required this.border,
    required this.iconColor,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Color background;
  final Color border;
  final Color iconColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Material(
      color: background,
      borderRadius: BorderRadius.circular(AppRadius.card),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.card),
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.card),
            border: Border.all(color: border),
          ),
          padding: const EdgeInsets.all(16),
          child: Row(
            children: <Widget>[
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.control),
                ),
                child: Icon(icon, color: iconColor),
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
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textDark.withValues(alpha: 0.65),
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(Icons.chevron_right_rounded, color: scheme.onSurfaceVariant),
            ],
          ),
        ),
      ),
    );
  }
}
