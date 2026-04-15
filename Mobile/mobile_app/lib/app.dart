import 'package:flutter/material.dart';

import 'auth/first_login_page.dart';
import 'auth/login_page.dart';
import 'auth/register_page.dart';
import 'shared/app_theme.dart';
import 'shared/session_storage.dart';
import 'consultor/consultor_repository.dart';
import 'consultor/consultor_controller.dart';
import 'consultor/consultor_models.dart';
import 'consultor/pages/consultor_shell_page.dart';

enum AuthStage { login, register, firstLogin, authenticated }

class BadgesPintApp extends StatefulWidget {
  const BadgesPintApp({super.key});

  @override
  State<BadgesPintApp> createState() => _BadgesPintAppState();
}

class _BadgesPintAppState extends State<BadgesPintApp> {
  final ConsultorRepository _repository = ConsultorRepository();

  ConsultorController? _controller;
  bool _booting = true;
  ThemeMode _themeMode = ThemeMode.light;
  AuthStage _authStage = AuthStage.login;
  List<AreaItem> _areas = <AreaItem>[];

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    await SessionStorage.instance.load();
    _areas = await _repository.getAreas();
    _themeMode = _parseThemeMode(SessionStorage.instance.themeMode);

    if (SessionStorage.instance.hasSession) {
      final ok = await _openDashboard();
      if (!ok) {
        await _repository.logout();
      }
    } else {
      _authStage = AuthStage.login;
    }

    if (!mounted) return;
    setState(() {
      _booting = false;
    });
  }

  ThemeMode _parseThemeMode(String? value) {
    switch (value) {
      case 'dark':
        return ThemeMode.dark;
      case 'light':
      default:
        return ThemeMode.light;
    }
  }

  Future<void> _handleThemeChange(ThemeMode mode) async {
    if (_themeMode == mode) return;
    setState(() {
      _themeMode = mode;
    });
    await SessionStorage.instance.setThemeMode(
      mode == ThemeMode.dark ? 'dark' : 'light',
    );
  }

  Future<bool> _openDashboard() async {
    final controller = ConsultorController(repository: _repository);
    await controller.initialize();

    if (controller.profile == null) {
      controller.dispose();
      return false;
    }

    if (controller.profile!.role != 'consultant') {
      controller.dispose();
      return false;
    }

    _controller?.dispose();
    _controller = controller;

    if (mounted) {
      setState(() {
        _authStage = AuthStage.authenticated;
      });
    }

    return true;
  }

  Future<String?> _handleLogin(String email, String password) async {
    final result = await _repository.login(email: email, password: password);
    if (!result.success) return result.message ?? 'Falha no login.';

    if (result.requiresPasswordChange) {
      if (mounted) {
        setState(() {
          _authStage = AuthStage.firstLogin;
        });
      }
      return null;
    }

    final ok = await _openDashboard();
    if (!ok) {
      await _repository.logout();
      return 'Sessao invalida para este perfil.';
    }

    return null;
  }

  Future<void> _handleLogout() async {
    await _repository.logout();
    _controller?.dispose();
    _controller = null;

    if (!mounted) return;
    setState(() {
      _authStage = AuthStage.login;
    });
  }

  Future<String?> _handleFirstLogin(String newPassword) async {
    final success = await _repository.completeFirstLogin(
      newPassword: newPassword,
    );
    if (!success) {
      return 'Nao foi possivel atualizar a password.';
    }

    final ok = await _openDashboard();
    if (!ok) {
      await _repository.logout();
      return 'Sessao invalida para este perfil.';
    }

    return null;
  }

  Future<String?> _handleRegister({
    required String name,
    required String email,
    int? areaId,
    required bool acceptedRgpd,
  }) async {
    final result = await _repository.registerConsultant(
      name: name,
      email: email,
      areaId: areaId,
      acceptedRgpd: acceptedRgpd,
    );

    if (result.success && mounted) {
      setState(() {
        _authStage = AuthStage.login;
      });
    }

    return result.message;
  }

  void _openRegister() {
    setState(() {
      _authStage = AuthStage.register;
    });
  }

  void _backToLogin() {
    setState(() {
      _authStage = AuthStage.login;
    });
  }

  void _showRecoverMessage() {
    final contextNow = context;
    ScaffoldMessenger.of(contextNow).showSnackBar(
      const SnackBar(
        content: Text('Recuperacao de password disponivel em breve no mobile.'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget home;

    if (_booting) {
      home = const Scaffold(body: Center(child: CircularProgressIndicator()));
    } else if (_authStage == AuthStage.authenticated && _controller != null) {
      home = ConsultorShellPage(
        controller: _controller!,
        onLogout: _handleLogout,
        currentThemeMode: _themeMode,
        onThemeModeChanged: _handleThemeChange,
      );
    } else if (_authStage == AuthStage.firstLogin) {
      home = FirstLoginPage(onSubmit: _handleFirstLogin);
    } else if (_authStage == AuthStage.register) {
      home = RegisterPage(
        areas: _areas,
        onRegister: _handleRegister,
        onBackToLogin: _backToLogin,
      );
    } else {
      home = LoginPage(
        onLogin: _handleLogin,
        onOpenRegister: _openRegister,
        onRecoverPassword: _showRecoverMessage,
      );
    }

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Badges PINT',
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: _themeMode,
      builder: (BuildContext context, Widget? child) {
        return DecoratedBox(
          decoration: AppTheme.appBackground(Theme.of(context).brightness),
          child: child ?? const SizedBox.shrink(),
        );
      },
      home: home,
    );
  }
}
