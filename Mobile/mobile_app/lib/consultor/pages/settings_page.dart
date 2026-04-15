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
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      children: <Widget>[
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: <Color>[
                scheme.primary.withValues(alpha: 0.9),
                scheme.tertiary.withValues(alpha: 0.85),
              ],
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              const Text(
                'Definicoes do Consultor',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.2,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Personaliza a experiencia da app, notificacoes e privacidade.',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.86),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        Card(
          child: SwitchListTile(
            value: isDark,
            onChanged: (bool value) {
              widget.onThemeModeChanged(
                value ? ThemeMode.dark : ThemeMode.light,
              );
            },
            title: const Text('Modo escuro'),
            subtitle: Text(isDark ? 'Tema escuro ativo' : 'Tema claro ativo'),
            secondary: Icon(
              isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Perfil pessoal',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 10),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              children: <Widget>[
                TextField(
                  controller: _nomeController,
                  decoration: const InputDecoration(
                    labelText: 'Nome',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  value: areaPrincipal,
                  decoration: const InputDecoration(
                    labelText: 'Area principal',
                    prefixIcon: Icon(Icons.hub_outlined),
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
        const SizedBox(height: 12),
        Text(
          'Objetivos e Aprendizagem',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 10),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              children: <Widget>[
                TextField(
                  controller: _objetivoController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Objetivo (ex.: n.º de badges)',
                    prefixIcon: Icon(Icons.flag_outlined),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _dataLimiteController,
                  decoration: const InputDecoration(
                    labelText: 'Data limite (AAAA-MM-DD)',
                    prefixIcon: Icon(Icons.date_range_outlined),
                  ),
                ),
                const SizedBox(height: 6),
                SwitchListTile(
                  value: recomendacoesBadges,
                  onChanged:
                      (bool value) =>
                          setState(() => recomendacoesBadges = value),
                  title: const Text('Ativar recomendacoes de proximos badges'),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Notificacoes',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 10),
        Card(
          child: Column(
            children: <Widget>[
              SwitchListTile(
                value: emailConfirmacao,
                onChanged:
                    (bool value) => setState(() => emailConfirmacao = value),
                title: const Text('Email de confirmacao de candidatura'),
                subtitle: const Text(
                  'Recebe um email sempre que submeteres um pedido.',
                ),
              ),
              SwitchListTile(
                value: notificacoesAprovacao,
                onChanged:
                    (bool value) =>
                        setState(() => notificacoesAprovacao = value),
                title: const Text('Notificacoes de aprovacao/rejeicao'),
              ),
              SwitchListTile(
                value: alertasExpiracao,
                onChanged:
                    (bool value) => setState(() => alertasExpiracao = value),
                title: const Text('Alertas de expiracao de badges'),
                subtitle: const Text(
                  'Aviso antecipado para badges perto da data limite.',
                ),
              ),
              SwitchListTile(
                value: lembretesTimeline,
                onChanged:
                    (bool value) => setState(() => lembretesTimeline = value),
                title: const Text('Lembretes da timeline e objetivos'),
                subtitle: const Text(
                  'Recebe lembretes de metas definidas no teu plano.',
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Privacidade e Partilha',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 10),
        Card(
          child: Column(
            children: <Widget>[
              SwitchListTile(
                value: rgpdPublicacao,
                onChanged:
                    (bool value) => setState(() => rgpdPublicacao = value),
                title: const Text(
                  'Aceito os termos RGPD para publicacao de badges',
                ),
              ),
              SwitchListTile(
                value: permitirGaleriaPublica,
                onChanged:
                    (bool value) =>
                        setState(() => permitirGaleriaPublica = value),
                title: const Text('Permitir galeria publica de badges'),
                subtitle: const Text(
                  'Controla a visibilidade publica do teu perfil de badges.',
                ),
              ),
              SwitchListTile(
                value: partilhaLinkedin,
                onChanged:
                    (bool value) => setState(() => partilhaLinkedin = value),
                title: const Text('Ativar partilha no LinkedIn'),
                subtitle: const Text(
                  'Mostra acao rapida de partilha em badges obtidos.',
                ),
              ),
              SwitchListTile(
                value: assinaturaEmail,
                onChanged:
                    (bool value) => setState(() => assinaturaEmail = value),
                title: const Text('Usar badges na assinatura de email'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Interface',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 10),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              children: <Widget>[
                DropdownButtonFormField<String>(
                  value: idioma,
                  decoration: const InputDecoration(
                    labelText: 'Idioma',
                    prefixIcon: Icon(Icons.language_outlined),
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
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Definicoes guardadas (mock).')),
            );
          },
          icon: const Icon(Icons.save),
          label: const Text('Guardar alteracoes'),
        ),
      ],
    );
  }
}
