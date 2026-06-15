import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../shared/app_theme.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({
    required this.onLogin,
    required this.onOpenRegister,
    required this.onRecoverPassword,
    this.logo,
    super.key,
  });

  final Future<String?> Function(String email, String password) onLogin;
  final VoidCallback onOpenRegister;
  final VoidCallback onRecoverPassword;
  final Widget? logo;

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

  Widget _buildLogoSlot({required bool compact}) {
    final Widget logo =
        widget.logo ??
        Container(
          width: compact ? 92 : 104,
          height: compact ? 92 : 104,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: <Color>[AppColors.primary, AppColors.accent],
            ),
            boxShadow: const <BoxShadow>[
              BoxShadow(
                color: Color(0x33003A70),
                blurRadius: 26,
                offset: Offset(0, 12),
              ),
            ],
          ),
          child: const Center(
            child: Text(
              'S',
              style: TextStyle(
                color: Colors.white,
                fontSize: 36,
                fontWeight: FontWeight.w900,
                letterSpacing: -1.2,
              ),
            ),
          ),
        );

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        logo,
        const SizedBox(height: 16),
        const Text(
          'Softinsa',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.w900,
            letterSpacing: -0.8,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Portal de Badges e Competencias',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.82),
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildFeatureCard(String title, String description, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withValues(alpha: 0.14)),
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: Colors.white, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.78),
                    fontSize: 12.5,
                    height: 1.25,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    required String? Function(String?) validator,
    TextInputType? keyboardType,
    bool obscureText = false,
    Widget? suffixIcon,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon),
        suffixIcon: suffixIcon,
      ),
      validator: validator,
    );
  }

  Widget _buildAccentBlob({
    required Alignment alignment,
    required double size,
    required List<Color> colors,
  }) {
    return Align(
      alignment: alignment,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: colors,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ColorScheme scheme = Theme.of(context).colorScheme;

    return Scaffold(
      body: LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          final bool isWide = constraints.maxWidth >= 1000;
          final bool isMobile = !isWide;

          final Widget heroPanel = Container(
            width: isWide ? constraints.maxWidth * 0.43 : double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: <Color>[Color(0xFF003A70), Color(0xFF0A64A8)],
              ),
            ),
            child: Stack(
              children: <Widget>[
                Positioned.fill(
                  child: Opacity(
                    opacity: 0.14,
                    child: CustomPaint(painter: _SoftinsaPatternPainter()),
                  ),
                ),
                Positioned(
                  top: -40,
                  right: -60,
                  child: _buildAccentBlob(
                    alignment: Alignment.topRight,
                    size: 180,
                    colors: <Color>[
                      Colors.white.withValues(alpha: 0.14),
                      Colors.white.withValues(alpha: 0.02),
                    ],
                  ),
                ),
                Positioned(
                  bottom: -80,
                  left: -70,
                  child: _buildAccentBlob(
                    alignment: Alignment.bottomLeft,
                    size: 220,
                    colors: <Color>[
                      const Color(0xFF00AEEF).withValues(alpha: 0.20),
                      const Color(0xFF00AEEF).withValues(alpha: 0.02),
                    ],
                  ),
                ),
                SafeArea(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(
                      isWide ? 40 : 24,
                      isWide ? 48 : 24,
                      isWide ? 40 : 24,
                      isWide ? 48 : 28,
                    ),
                    child: Align(
                      alignment:
                          isWide ? Alignment.centerLeft : Alignment.center,
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 460),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment:
                              isWide
                                  ? CrossAxisAlignment.start
                                  : CrossAxisAlignment.center,
                          children: <Widget>[
                            _buildLogoSlot(compact: !isWide),
                            if (!isMobile) ...<Widget>[
                              const SizedBox(height: 26),
                              Text(
                                'Bem-vindo ao ecossistema de badges da Softinsa.',
                                textAlign:
                                    isWide ? TextAlign.left : TextAlign.center,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 38,
                                  fontWeight: FontWeight.w900,
                                  height: 1.06,
                                  letterSpacing: -1.0,
                                ),
                              ),
                              const SizedBox(height: 14),
                              Text(
                                'Entra para consultar competencias, submeter evidencias e acompanhar o teu progresso num ambiente moderno e consistente com a marca.',
                                textAlign:
                                    isWide ? TextAlign.left : TextAlign.center,
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.86),
                                  fontSize: 16,
                                  height: 1.5,
                                ),
                              ),
                              const SizedBox(height: 26),
                              _buildFeatureCard(
                                'Acesso rapido',
                                'Mantem o email guardado neste dispositivo para um inicio de sessao mais rapido.',
                                Icons.speed_rounded,
                              ),
                              const SizedBox(height: 12),
                              _buildFeatureCard(
                                'Interface limpa',
                                'Tons azuis e brancos, com foco nas tarefas principais e leitura facil.',
                                Icons.layers_rounded,
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );

          final Widget formPanel = Container(
            width: isWide ? constraints.maxWidth * 0.57 : double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: <Color>[Color(0xFFF6FAFF), Color(0xFFEAF2FB)],
              ),
            ),
            child: Stack(
              children: <Widget>[
                Positioned(
                  top: -60,
                  right: -20,
                  child: _buildAccentBlob(
                    alignment: Alignment.topRight,
                    size: 190,
                    colors: <Color>[
                      AppColors.accent.withValues(alpha: 0.10),
                      AppColors.accent.withValues(alpha: 0.02),
                    ],
                  ),
                ),
                Positioned(
                  bottom: -80,
                  left: -70,
                  child: _buildAccentBlob(
                    alignment: Alignment.bottomLeft,
                    size: 220,
                    colors: <Color>[
                      AppColors.primary.withValues(alpha: 0.08),
                      AppColors.primary.withValues(alpha: 0.02),
                    ],
                  ),
                ),
                Center(
                  child: SingleChildScrollView(
                    padding: EdgeInsets.fromLTRB(22, isWide ? 34 : 18, 22, 22),
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 460),
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(30),
                          boxShadow: const <BoxShadow>[
                            BoxShadow(
                              color: Color(0x220B1C34),
                              blurRadius: 38,
                              offset: Offset(0, 18),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(30),
                          child: BackdropFilter(
                            filter: ui.ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                            child: Card(
                              color: Colors.white.withValues(alpha: 0.92),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30),
                                side: BorderSide(
                                  color: scheme.primary.withValues(alpha: 0.12),
                                ),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.fromLTRB(
                                  26,
                                  28,
                                  26,
                                  26,
                                ),
                                child: Form(
                                  key: _formKey,
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.stretch,
                                    children: <Widget>[
                                      Text(
                                        'Iniciar sessao',
                                        textAlign: TextAlign.center,
                                        style: Theme.of(
                                          context,
                                        ).textTheme.headlineMedium?.copyWith(
                                          fontWeight: FontWeight.w900,
                                          letterSpacing: -0.6,
                                          color: AppColors.textDark,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        'Usa as tuas credenciais para entrar no portal da Softinsa.',
                                        textAlign: TextAlign.center,
                                        style: Theme.of(
                                          context,
                                        ).textTheme.bodyMedium?.copyWith(
                                          color: const Color(0xFF5B6B7F),
                                          height: 1.4,
                                        ),
                                      ),
                                      const SizedBox(height: 24),
                                      _buildField(
                                        controller: _emailController,
                                        label: 'Email',
                                        hint: 'exemplo@dominio.com',
                                        icon: Icons.mail_outline_rounded,
                                        keyboardType:
                                            TextInputType.emailAddress,
                                        validator: (String? value) {
                                          final String text =
                                              (value ?? '').trim();
                                          if (text.isEmpty) {
                                            return 'Indica o teu email';
                                          }
                                          if (!text.contains('@')) {
                                            return 'Email invalido';
                                          }
                                          return null;
                                        },
                                      ),
                                      const SizedBox(height: 14),
                                      _buildField(
                                        controller: _passwordController,
                                        label: 'Password',
                                        hint: '••••••••',
                                        icon: Icons.lock_outline_rounded,
                                        obscureText: _obscurePassword,
                                        suffixIcon: TextButton(
                                          onPressed: () {
                                            setState(() {
                                              _obscurePassword =
                                                  !_obscurePassword;
                                            });
                                          },
                                          child: Text(
                                            _obscurePassword
                                                ? 'Mostrar'
                                                : 'Ocultar',
                                          ),
                                        ),
                                        validator: (String? value) {
                                          if ((value ?? '').isEmpty) {
                                            return 'Indica a password';
                                          }
                                          return null;
                                        },
                                      ),
                                      const SizedBox(height: 10),
                                      Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.center,
                                        children: <Widget>[
                                          Expanded(
                                            child: InkWell(
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                              onTap: () {
                                                setState(() {
                                                  _rememberEmail =
                                                      !_rememberEmail;
                                                });
                                              },
                                              child: Padding(
                                                padding: const EdgeInsets.only(
                                                  right: 8,
                                                ),
                                                child: Row(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.center,
                                                  children: <Widget>[
                                                    Checkbox(
                                                      value: _rememberEmail,
                                                      onChanged: (bool? value) {
                                                        setState(() {
                                                          _rememberEmail =
                                                              value ?? false;
                                                        });
                                                      },
                                                    ),
                                                    const Expanded(
                                                      child: Text(
                                                        'Guardar email neste dispositivo',
                                                        style: TextStyle(
                                                          fontSize: 13.5,
                                                          color:
                                                              AppColors
                                                                  .textDark,
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                          TextButton(
                                            onPressed: widget.onRecoverPassword,
                                            child: const Text('Esqueceste-te?'),
                                          ),
                                        ],
                                      ),
                                      AnimatedSwitcher(
                                        duration: const Duration(
                                          milliseconds: 180,
                                        ),
                                        child:
                                            _error == null
                                                ? const SizedBox.shrink()
                                                : Padding(
                                                  padding:
                                                      const EdgeInsets.only(
                                                        top: 4,
                                                      ),
                                                  child: Container(
                                                    key: const ValueKey<String>(
                                                      'login-error',
                                                    ),
                                                    width: double.infinity,
                                                    padding:
                                                        const EdgeInsets.all(
                                                          14,
                                                        ),
                                                    decoration: BoxDecoration(
                                                      color: const Color(
                                                        0xFFFFF1F2,
                                                      ),
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                            16,
                                                          ),
                                                      border: Border.all(
                                                        color: const Color(
                                                          0xFFFECACA,
                                                        ),
                                                      ),
                                                    ),
                                                    child: Text(
                                                      _error!,
                                                      textAlign:
                                                          TextAlign.center,
                                                      style: const TextStyle(
                                                        color: Color(
                                                          0xFFB91C1C,
                                                        ),
                                                        fontWeight:
                                                            FontWeight.w700,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                      ),
                                      const SizedBox(height: 14),
                                      FilledButton(
                                        onPressed:
                                            _isSubmitting ? null : _submit,
                                        child: Padding(
                                          padding: const EdgeInsets.symmetric(
                                            vertical: 2,
                                          ),
                                          child: Text(
                                            _isSubmitting
                                                ? 'A entrar...'
                                                : 'Entrar',
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 14),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 14,
                                          vertical: 12,
                                        ),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF5F9FF),
                                          borderRadius: BorderRadius.circular(
                                            18,
                                          ),
                                          border: Border.all(
                                            color: const Color(0xFFD9E5F3),
                                          ),
                                        ),
                                        child: Row(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: <Widget>[
                                            const Icon(
                                              Icons.info_outline_rounded,
                                              color: AppColors.primary,
                                              size: 20,
                                            ),
                                            const SizedBox(width: 10),
                                            Expanded(
                                              child: Text(
                                                'Ainda nao tens conta? Podes criar o teu acesso em poucos segundos.',
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodyMedium
                                                    ?.copyWith(
                                                      color: const Color(
                                                        0xFF4B5A6B,
                                                      ),
                                                      height: 1.35,
                                                    ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 12),
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
                  ),
                ),
              ],
            ),
          );

          if (isWide) {
            return SafeArea(
              child: Row(
                children: <Widget>[heroPanel, Expanded(child: formPanel)],
              ),
            );
          }

          return SafeArea(
            child: Column(
              children: <Widget>[
                SizedBox(height: 220, child: heroPanel),
                Expanded(child: formPanel),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SoftinsaPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint =
        Paint()
          ..color = Colors.white.withValues(alpha: 0.8)
          ..strokeWidth = 1;

    const double spacing = 32;
    for (double x = -size.height; x < size.width + size.height; x += spacing) {
      canvas.drawLine(
        Offset(x, 0),
        Offset(x + size.height, size.height),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
