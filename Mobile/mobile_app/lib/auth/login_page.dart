import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({
    required this.onLogin,
    required this.onOpenRegister,
    required this.onRecoverPassword,
    super.key,
  });

  final Future<String?> Function(String email, String password) onLogin;
  final VoidCallback onOpenRegister;
  final VoidCallback onRecoverPassword;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  static const String _savedEmailKey = 'saved_login_email';

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  bool _isSubmitting = false;
  bool _obscurePassword = true;
  bool _rememberEmail = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSavedEmail();
  }

  Future<void> _loadSavedEmail() async {
    final prefs = await SharedPreferences.getInstance();
    final savedEmail = prefs.getString(_savedEmailKey);
    if (!mounted || savedEmail == null || savedEmail.isEmpty) return;

    setState(() {
      _emailController.text = savedEmail;
      _rememberEmail = true;
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
      _error = null;
    });

    final prefs = await SharedPreferences.getInstance();
    if (_rememberEmail) {
      await prefs.setString(_savedEmailKey, _emailController.text.trim());
    } else {
      await prefs.remove(_savedEmailKey);
    }

    final error = await widget.onLogin(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (!mounted) return;

    setState(() {
      _isSubmitting = false;
      _error = error;
    });
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      body: LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          final bool isWide = constraints.maxWidth >= 960;

          final leftPanel = Container(
            width: isWide ? constraints.maxWidth * 0.44 : double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: <Color>[Color(0xFF0A5D8F), Color(0xFF0B3B73)],
              ),
            ),
            padding: const EdgeInsets.fromLTRB(30, 48, 30, 30),
            child: Align(
              alignment: isWide ? Alignment.centerLeft : Alignment.center,
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment:
                      isWide
                          ? CrossAxisAlignment.start
                          : CrossAxisAlignment.center,
                  children: <Widget>[
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.24),
                        ),
                      ),
                      child: const Text(
                        'BADGES PINT',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      'Mostra o teu crescimento.\nConquista o proximo badge.',
                      textAlign: isWide ? TextAlign.left : TextAlign.center,
                      style: const TextStyle(
                        color: Color(0xFFF8FAFC),
                        fontSize: 35,
                        fontWeight: FontWeight.w900,
                        height: 1.08,
                        letterSpacing: -0.6,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Acede ao teu dashboard de competencias, submete evidencias e acompanha progresso em tempo real.',
                      textAlign: isWide ? TextAlign.left : TextAlign.center,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.86),
                        fontSize: 16,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );

          final formPanel = Container(
            width: isWide ? constraints.maxWidth * 0.56 : double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: <Color>[Color(0xFFF6FAFF), Color(0xFFEEF4FD)],
              ),
            ),
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 430),
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      boxShadow: const <BoxShadow>[
                        BoxShadow(
                          color: Color(0x220F172A),
                          blurRadius: 36,
                          offset: Offset(0, 14),
                        ),
                      ],
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Card(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                        side: BorderSide(
                          color: scheme.primary.withValues(alpha: 0.2),
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(24, 26, 24, 24),
                        child: Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: <Widget>[
                              Text(
                                'Iniciar Sessao',
                                textAlign: TextAlign.center,
                                style: Theme.of(
                                  context,
                                ).textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: -0.4,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Usa as tuas credenciais para entrar no portal de badges.',
                                textAlign: TextAlign.center,
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(color: const Color(0xFF64748B)),
                              ),
                              const SizedBox(height: 22),
                              TextFormField(
                                controller: _emailController,
                                keyboardType: TextInputType.emailAddress,
                                decoration: const InputDecoration(
                                  labelText: 'Email',
                                  hintText: 'exemplo@dominio.com',
                                  prefixIcon: Icon(Icons.mail_outline),
                                ),
                                validator: (String? value) {
                                  final text = (value ?? '').trim();
                                  if (text.isEmpty) return 'Indica o teu email';
                                  if (!text.contains('@'))
                                    return 'Email invalido';
                                  return null;
                                },
                              ),
                              const SizedBox(height: 14),
                              TextFormField(
                                controller: _passwordController,
                                obscureText: _obscurePassword,
                                decoration: InputDecoration(
                                  labelText: 'Password',
                                  hintText: '********',
                                  prefixIcon: const Icon(Icons.lock_outline),
                                  suffixIcon: TextButton(
                                    onPressed: () {
                                      setState(
                                        () =>
                                            _obscurePassword =
                                                !_obscurePassword,
                                      );
                                    },
                                    child: Text(
                                      _obscurePassword ? 'Mostrar' : 'Ocultar',
                                    ),
                                  ),
                                ),
                                validator: (String? value) {
                                  if ((value ?? '').isEmpty)
                                    return 'Indica a password';
                                  return null;
                                },
                              ),
                              const SizedBox(height: 12),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  Expanded(
                                    child: InkWell(
                                      borderRadius: BorderRadius.circular(12),
                                      onTap: () {
                                        setState(
                                          () =>
                                              _rememberEmail = !_rememberEmail,
                                        );
                                      },
                                      child: Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: <Widget>[
                                          Checkbox(
                                            value: _rememberEmail,
                                            onChanged: (bool? value) {
                                              setState(
                                                () =>
                                                    _rememberEmail =
                                                        value ?? false,
                                              );
                                            },
                                          ),
                                          const Expanded(
                                            child: Padding(
                                              padding: EdgeInsets.only(top: 11),
                                              child: Text(
                                                'Guardar email neste dispositivo',
                                                style: TextStyle(fontSize: 13),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: widget.onRecoverPassword,
                                    child: const Text('Esqueceste-te?'),
                                  ),
                                ],
                              ),
                              if (_error != null) ...<Widget>[
                                const SizedBox(height: 6),
                                Text(
                                  _error!,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    color: Color(0xFFDC2626),
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                              const SizedBox(height: 10),
                              FilledButton(
                                onPressed: _isSubmitting ? null : _submit,
                                child: Text(
                                  _isSubmitting ? 'A entrar...' : 'Entrar',
                                ),
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'Ainda nao tens conta?',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: Color(0xFF64748B)),
                              ),
                              const SizedBox(height: 8),
                              OutlinedButton(
                                onPressed: widget.onOpenRegister,
                                child: const Text('Criar Conta'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );

          if (isWide) {
            return SafeArea(
              child: Row(
                children: <Widget>[leftPanel, Expanded(child: formPanel)],
              ),
            );
          }

          return SafeArea(
            child: Column(
              children: <Widget>[
                SizedBox(height: 265, child: leftPanel),
                Expanded(child: formPanel),
              ],
            ),
          );
        },
      ),
    );
  }
}
