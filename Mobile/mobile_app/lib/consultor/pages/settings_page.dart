import 'package:flutter/material.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({
    required this.currentThemeMode,
    required this.onThemeModeChanged,
    super.key,
  });

  final ThemeMode currentThemeMode;
  final ValueChanged<ThemeMode> onThemeModeChanged;

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final TextEditingController _nomeController = TextEditingController();
  final TextEditingController _objetivoController = TextEditingController();
  final TextEditingController _dataLimiteController = TextEditingController();

  bool emailConfirmacao = true;
  bool notificacoesAprovacao = true;
  bool alertasExpiracao = true;
  bool lembretesTimeline = false;
  bool recomendacoesBadges = true;
  bool rgpdPublicacao = false;
  bool permitirGaleriaPublica = false;
  bool partilhaLinkedin = true;
  bool assinaturaEmail = false;

  String idioma = 'Português';
  String areaPrincipal = 'Selecione...';

  @override
  void dispose() {
    _nomeController.dispose();
    _objetivoController.dispose();
    _dataLimiteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isDark = widget.currentThemeMode == ThemeMode.dark;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
      children: <Widget>[
        // Header
        _buildHeader(context, scheme),
        const SizedBox(height: 20),

        // Appearance
        _buildSectionLabel(context, 'Aparência', Icons.palette_outlined),
        const SizedBox(height: 8),
        _buildCard(
          child: SwitchListTile(
            value: isDark,
            onChanged:
                (bool value) => widget.onThemeModeChanged(
                  value ? ThemeMode.dark : ThemeMode.light,
                ),
            title: const Text(
              'Modo escuro',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            subtitle: Text(
              isDark ? 'Tema escuro ativo' : 'Tema claro ativo',
              style: const TextStyle(fontSize: 12),
            ),
            secondary: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: scheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                color: scheme.primary,
                size: 20,
              ),
            ),
          ),
        ),

        const SizedBox(height: 20),

        // Profile
        _buildSectionLabel(context, 'Perfil Pessoal', Icons.person_outline),
        const SizedBox(height: 8),
        _buildCard(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: <Widget>[
                TextField(
                  controller: _nomeController,
                  decoration: const InputDecoration(
                    labelText: 'Nome',
                    prefixIcon: Icon(Icons.person_outline, size: 20),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: areaPrincipal,
                  decoration: const InputDecoration(
                    labelText: 'Área principal',
                    prefixIcon: Icon(Icons.hub_outlined, size: 20),
                  ),
                  items:
                      const <String>[
                            'Selecione...',
                            'Data',
                            'DevOps',
                            'Outsystems',
                            'Cloud',
                          ]
                          .map(
                            (String area) => DropdownMenuItem<String>(
                              value: area,
                              child: Text(area),
                            ),
                          )
                          .toList(),
                  onChanged: (String? value) {
                    if (value == null) return;
                    setState(() => areaPrincipal = value);
                  },
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 20),

        // Goals
        _buildSectionLabel(
          context,
          'Objetivos & Aprendizagem',
          Icons.flag_outlined,
        ),
        const SizedBox(height: 8),
        _buildCard(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: <Widget>[
                TextField(
                  controller: _objetivoController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Objetivo (n.º de badges)',
                    prefixIcon: Icon(Icons.flag_outlined, size: 20),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _dataLimiteController,
                  decoration: const InputDecoration(
                    labelText: 'Data limite (AAAA-MM-DD)',
                    prefixIcon: Icon(Icons.date_range_outlined, size: 20),
                  ),
                ),
                const SizedBox(height: 4),
                _buildSwitch(
                  value: recomendacoesBadges,
                  onChanged: (v) => setState(() => recomendacoesBadges = v),
                  title: 'Recomendações de próximos badges',
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 20),

        // Notifications
        _buildSectionLabel(
          context,
          'Notificações',
          Icons.notifications_outlined,
        ),
        const SizedBox(height: 8),
        _buildCard(
          child: Column(
            children: <Widget>[
              _buildSwitchTile(
                value: emailConfirmacao,
                onChanged: (v) => setState(() => emailConfirmacao = v),
                title: 'Email de confirmação',
                subtitle: 'Recebe confirmação ao submeter um pedido.',
                icon: Icons.email_outlined,
                scheme: scheme,
                isFirst: true,
              ),
              _buildSwitchTile(
                value: notificacoesAprovacao,
                onChanged: (v) => setState(() => notificacoesAprovacao = v),
                title: 'Aprovação / Rejeição',
                subtitle: 'Notificação ao ser aprovado ou rejeitado.',
                icon: Icons.check_circle_outline,
                scheme: scheme,
              ),
              _buildSwitchTile(
                value: alertasExpiracao,
                onChanged: (v) => setState(() => alertasExpiracao = v),
                title: 'Alertas de expiração',
                subtitle: 'Aviso antecipado de badges a expirar.',
                icon: Icons.timer_outlined,
                scheme: scheme,
              ),
              _buildSwitchTile(
                value: lembretesTimeline,
                onChanged: (v) => setState(() => lembretesTimeline = v),
                title: 'Lembretes da timeline',
                subtitle: 'Lembretes das tuas metas e objetivos.',
                icon: Icons.calendar_today_outlined,
                scheme: scheme,
                isLast: true,
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Privacy
        _buildSectionLabel(
          context,
          'Privacidade & Partilha',
          Icons.lock_outline_rounded,
        ),
        const SizedBox(height: 8),
        _buildCard(
          child: Column(
            children: <Widget>[
              _buildSwitchTile(
                value: rgpdPublicacao,
                onChanged: (v) => setState(() => rgpdPublicacao = v),
                title: 'Aceito os termos RGPD',
                subtitle: 'Permite publicação de badges no exterior.',
                icon: Icons.gavel_rounded,
                scheme: scheme,
                isFirst: true,
              ),
              _buildSwitchTile(
                value: permitirGaleriaPublica,
                onChanged: (v) => setState(() => permitirGaleriaPublica = v),
                title: 'Galeria pública de badges',
                subtitle: 'Torna o teu perfil de badges visível.',
                icon: Icons.photo_library_outlined,
                scheme: scheme,
              ),
              _buildSwitchTile(
                value: partilhaLinkedin,
                onChanged: (v) => setState(() => partilhaLinkedin = v),
                title: 'Partilha no LinkedIn',
                subtitle: 'Ação rápida de partilha nos badges obtidos.',
                icon: Icons.share_outlined,
                scheme: scheme,
              ),
              _buildSwitchTile(
                value: assinaturaEmail,
                onChanged: (v) => setState(() => assinaturaEmail = v),
                title: 'Badges na assinatura de email',
                subtitle: 'Exibe badges na tua assinatura.',
                icon: Icons.alternate_email_rounded,
                scheme: scheme,
                isLast: true,
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Interface
        _buildSectionLabel(context, 'Interface', Icons.language_outlined),
        const SizedBox(height: 8),
        _buildCard(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: DropdownButtonFormField<String>(
              value: idioma,
              decoration: const InputDecoration(
                labelText: 'Idioma da aplicação',
                prefixIcon: Icon(Icons.language_outlined, size: 20),
              ),
              items:
                  const <String>['Português', 'Inglês', 'Espanhol']
                      .map(
                        (String item) => DropdownMenuItem<String>(
                          value: item,
                          child: Text(item),
                        ),
                      )
                      .toList(),
              onChanged: (String? value) {
                if (value == null) return;
                setState(() => idioma = value);
              },
            ),
          ),
        ),

        const SizedBox(height: 24),

        // Save button
        SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Definições guardadas com sucesso.'),
                  backgroundColor: Color(0xFF065F46),
                ),
              );
            },
            icon: const Icon(Icons.save_rounded, size: 18),
            label: const Text('Guardar alterações'),
            style: FilledButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 15),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeader(BuildContext context, ColorScheme scheme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[
            scheme.primary.withOpacity(0.92),
            scheme.tertiary.withOpacity(0.85),
          ],
        ),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: scheme.primary.withOpacity(0.25),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.settings_rounded,
              color: Colors.white,
              size: 26,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Definições',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.3,
                  ),
                ),
                Text(
                  'Personaliza a tua experiência na app',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(BuildContext context, String label, IconData icon) {
    final scheme = Theme.of(context).colorScheme;
    return Row(
      children: <Widget>[
        Icon(icon, size: 16, color: scheme.primary),
        const SizedBox(width: 8),
        Text(
          label,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w800,
            color: scheme.onSurface,
            letterSpacing: 0.1,
          ),
        ),
      ],
    );
  }

  Widget _buildCard({required Widget child}) {
    return Card(child: child);
  }

  Widget _buildSwitch({
    required bool value,
    required ValueChanged<bool> onChanged,
    required String title,
  }) {
    return SwitchListTile(
      value: value,
      onChanged: onChanged,
      title: Text(title, style: const TextStyle(fontSize: 13)),
      dense: true,
      contentPadding: EdgeInsets.zero,
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
            color: scheme.outlineVariant.withOpacity(0.5),
          ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          child: Row(
            children: <Widget>[
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: scheme.primary.withOpacity(0.08),
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
