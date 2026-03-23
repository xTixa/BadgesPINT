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
    return Scaffold(
      body: SafeArea(
        child: LayoutBuilder(
          builder: (BuildContext context, BoxConstraints constraints) {
            final bool isWide = constraints.maxWidth >= 900;

            final leftPanel = Container(
              width: isWide ? constraints.maxWidth * 0.45 : double.infinity,
              color: const Color(0xFF16558C),
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 48),
              child: Align(
                alignment: isWide ? Alignment.centerLeft : Alignment.center,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: isWide ? CrossAxisAlignment.start : CrossAxisAlignment.center,
                    children: <Widget>[
                      Text(
                        'Bem-vindo de volta!',
                        textAlign: isWide ? TextAlign.left : TextAlign.center,
                        style: const TextStyle(
                          color: Color(0xFFF2F2F2),
                          fontSize: 36,
                          fontWeight: FontWeight.w800,
                          height: 1.1,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Entra na tua jornada de aprendizagem e continua a conquistar badges.',
                        textAlign: isWide ? TextAlign.left : TextAlign.center,
                        style: const TextStyle(
                          color: Color(0xFF04C4D9),
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 28),
                      const Text(
                        '"O conhecimento e a tua melhor credencial."',
                        style: TextStyle(
                          color: Color(0xFFCBD5E1),
                          fontStyle: FontStyle.italic,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );

            final formPanel = Container(
              width: isWide ? constraints.maxWidth * 0.55 : double.infinity,
              color: const Color(0xFFF2F2F2),
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 420),
                    child: Card(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: const BorderSide(color: Color(0xFF16558C)),
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
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                      fontWeight: FontWeight.w800,
                                      color: const Color(0xFF1E293B),
                                    ),
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
                                  if (!text.contains('@')) return 'Email invalido';
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
                                      setState(() => _obscurePassword = !_obscurePassword);
                                    },
                                    child: Text(_obscurePassword ? 'Mostrar' : 'Ocultar'),
                                  ),
                                ),
                                validator: (String? value) {
                                  if ((value ?? '').isEmpty) return 'Indica a password';
                                  return null;
                                },
                              ),
                              const SizedBox(height: 12),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  Expanded(
                                    child: InkWell(
                                      onTap: () {
                                        setState(() => _rememberEmail = !_rememberEmail);
                                      },
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: <Widget>[
                                          Checkbox(
                                            value: _rememberEmail,
                                            onChanged: (bool? value) {
                                              setState(() => _rememberEmail = value ?? false);
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
                                    onPressed: () {
                                      widget.onRecoverPassword();
                                    },
                                    child: const Text('Esqueceste-te da password?'),
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
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                              const SizedBox(height: 10),
                              FilledButton(
                                style: FilledButton.styleFrom(
                                  backgroundColor: const Color(0xFF16558C),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                onPressed: _isSubmitting ? null : _submit,
                                child: Text(_isSubmitting ? 'A entrar...' : 'Entrar'),
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'Ainda nao tens conta?',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: Color(0xFF64748B)),
                              ),
                              const SizedBox(height: 8),
                              OutlinedButton(
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: const Color(0xFF1E293B),
                                  side: const BorderSide(color: Color(0xFF16558C)),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                onPressed: () {
                                  widget.onOpenRegister();
                                },
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
            );

            if (isWide) {
              return Row(
                children: <Widget>[leftPanel, Expanded(child: formPanel)],
              );
            }

            return Column(
              children: <Widget>[
                SizedBox(height: 250, child: leftPanel),
                Expanded(child: formPanel),
              ],
            );
          },
        ),
      ),
    );
  }
}
