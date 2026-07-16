import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../shared/notification_service.dart';

class NotificationsSettingsPage extends StatefulWidget {
  const NotificationsSettingsPage({super.key});

  @override
  State<NotificationsSettingsPage> createState() =>
      _NotificationsSettingsPageState();
}

class _NotificationsSettingsPageState
    extends State<NotificationsSettingsPage> {
  bool emailConfirmacao = true;
  bool notificacoesAprovacao = true;
  bool alertasExpiracao = true;
  bool lembretesTimeline = false;
  bool recomendacoesBadges = true;
  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      emailConfirmacao = prefs.getBool('settings_email_confirmacao') ?? true;
      notificacoesAprovacao =
          prefs.getBool('settings_notificacoes_aprovacao') ?? true;
      alertasExpiracao = prefs.getBool('settings_alertas_expiracao') ?? true;
      lembretesTimeline = prefs.getBool('settings_lembretes_timeline') ?? false;
      recomendacoesBadges =
          prefs.getBool('settings_recomendacoes_badges') ?? true;
      _loading = false;
    });
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('settings_email_confirmacao', emailConfirmacao);
    await prefs.setBool(
      'settings_notificacoes_aprovacao',
      notificacoesAprovacao,
    );
    await prefs.setBool('settings_alertas_expiracao', alertasExpiracao);
    await prefs.setBool('settings_lembretes_timeline', lembretesTimeline);
    await prefs.setBool('settings_recomendacoes_badges', recomendacoesBadges);

    if (!alertasExpiracao) NotificationService.cancelExpiryReminders();
    if (!lembretesTimeline) NotificationService.cancelGoalReminder();

    if (!mounted) return;
    setState(() => _saving = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Preferências guardadas com sucesso.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Notificações')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
              children: <Widget>[
                Card(
                  child: Column(
                    children: <Widget>[
                      _buildSwitchTile(
                        value: emailConfirmacao,
                        onChanged: (v) =>
                            setState(() => emailConfirmacao = v),
                        title: 'Email de confirmação',
                        subtitle: 'Recebe confirmação ao submeter um pedido.',
                        icon: Icons.email_outlined,
                        scheme: scheme,
                        isFirst: true,
                      ),
                      _buildSwitchTile(
                        value: notificacoesAprovacao,
                        onChanged: (v) =>
                            setState(() => notificacoesAprovacao = v),
                        title: 'Aprovação / Rejeição',
                        subtitle:
                            'Notificação ao ser aprovado ou rejeitado.',
                        icon: Icons.check_circle_outline,
                        scheme: scheme,
                      ),
                      _buildSwitchTile(
                        value: alertasExpiracao,
                        onChanged: (v) =>
                            setState(() => alertasExpiracao = v),
                        title: 'Alertas de expiração',
                        subtitle: 'Aviso antecipado de badges a expirar.',
                        icon: Icons.timer_outlined,
                        scheme: scheme,
                      ),
                      _buildSwitchTile(
                        value: lembretesTimeline,
                        onChanged: (v) =>
                            setState(() => lembretesTimeline = v),
                        title: 'Lembretes da timeline',
                        subtitle: 'Lembretes das tuas metas e objetivos.',
                        icon: Icons.calendar_today_outlined,
                        scheme: scheme,
                      ),
                      _buildSwitchTile(
                        value: recomendacoesBadges,
                        onChanged: (v) =>
                            setState(() => recomendacoesBadges = v),
                        title: 'Sugestões de novos badges',
                        subtitle:
                            'Receber recomendações baseadas no teu perfil.',
                        icon: Icons.auto_awesome_outlined,
                        scheme: scheme,
                        isLast: true,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _saving ? null : _save,
                    icon: const Icon(Icons.save_rounded, size: 18),
                    label: Text(_saving ? 'A guardar...' : 'Guardar alterações'),
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildSwitchTile({
    required bool value,
    required ValueChanged<bool> onChanged,
    required String title,
    required String subtitle,
    required IconData icon,
    required ColorScheme scheme,
    bool isFirst = false,
    bool isLast = false,
  }) {
    return Column(
      children: <Widget>[
        if (!isFirst)
          Divider(
            height: 1,
            indent: 16,
            endIndent: 16,
            color: scheme.outlineVariant.withValues(alpha: 0.5),
          ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          child: Row(
            children: <Widget>[
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: scheme.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 18, color: scheme.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 11,
                        color: scheme.onSurfaceVariant,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                value: value,
                onChanged: onChanged,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
