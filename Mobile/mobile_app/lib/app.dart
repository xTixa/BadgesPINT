import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'auth/first_login_page.dart';
import 'auth/login_page.dart';
import 'auth/register_page.dart';
import 'shared/app_theme.dart';
import 'shared/notification_service.dart';
import 'shared/session_storage.dart';
import 'consultor/consultor_repository.dart';
import 'consultor/consultor_controller.dart';
import 'consultor/consultor_models.dart';
import 'consultor/pages/consultor_shell_page.dart';
import 'consultor/pages/notifications_page.dart';
import 'consultor/pages/settings_page.dart';

enum AuthStage { login, register, firstLogin, authenticated }

class BadgesPintApp extends StatefulWidget {
  const BadgesPintApp({super.key});

  @override
  State<BadgesPintApp> createState() => _BadgesPintAppState();
}

class _BadgesPintAppState extends State<BadgesPintApp> {
  final ConsultorRepository _repository = ConsultorRepository();

  ConsultorController? _controller;
  late final GoRouter _router;
  bool _booting = true;
  AuthStage _authStage = AuthStage.login;

  List<AreaItem> _areas = <AreaItem>[];

  @override
  void initState() {
    super.initState();
    _router = _createRouter();
    _bootstrap();
  }

  @override
  void dispose() {
    NotificationService.onDataRefresh = null;
    NotificationService.onOpenNotifications = null;
    _controller?.dispose();
    _router.dispose();
    super.dispose();
  }

  GoRouter _createRouter() {
    return GoRouter(
      navigatorKey: NotificationService.navigatorKey,
      initialLocation: '/boot',
      redirect: (BuildContext context, GoRouterState state) {
        final location = state.uri.path;
        if (_booting) return location == '/boot' ? null : '/boot';

        if (_authStage == AuthStage.authenticated) {
          if (location == '/login' ||
              location == '/register' ||
              location == '/first-login' ||
              location == '/boot') {
            return '/app';
          }
          return null;
        }

        if (_authStage == AuthStage.firstLogin) {
          return location == '/first-login' ? null : '/first-login';
        }

        if (location == '/app' ||
            location == '/notifications' ||
            location == '/settings' ||
            location == '/boot') {
          return '/login';
        }

        return null;
      },
      routes: <RouteBase>[
        GoRoute(
          path: '/boot',
          builder:
              (BuildContext context, GoRouterState state) =>
                  const Scaffold(body: Center(child: CircularProgressIndicator())),
        ),
        GoRoute(
          path: '/login',
          builder:
              (BuildContext context, GoRouterState state) => LoginPage(
                    onLogin: _handleLogin,
                    onOpenRegister: _openRegister,
                    onRecoverPassword: _showRecoverMessage,
                  ),
        ),
        GoRoute(
          path: '/register',
          builder:
              (BuildContext context, GoRouterState state) => RegisterPage(
                    areas: _areas,
                    onRegister: _handleRegister,
                    onBackToLogin: _backToLogin,
                  ),
        ),
        GoRoute(
          path: '/first-login',
          builder:
              (BuildContext context, GoRouterState state) =>
                  FirstLoginPage(onSubmit: _handleFirstLogin),
        ),
        GoRoute(
          path: '/app',
          builder: (BuildContext context, GoRouterState state) {
            final controller = _controller;
            if (controller == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return ConsultorShellPage(
              controller: controller,
              onLogout: _handleLogout,
            );
          },
        ),
        GoRoute(
          path: '/notifications',
          builder: (BuildContext context, GoRouterState state) {
            final controller = _controller;
            if (controller == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return NotificationsPage(controller: controller);
          },
        ),
        GoRoute(
          path: '/settings',
          builder:
              (BuildContext context, GoRouterState state) =>
                  const SettingsPage(),
        ),
      ],
    );
  }

  Future<void> _bootstrap() async {
    await SessionStorage.instance.load();
    await _repository.syncAreas();
    _areas = await _repository.getAreas();

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
    _goToCurrentStage();
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
    await NotificationService.registerDeviceForUser(_repository);
    NotificationService.onDataRefresh = controller.refreshRealtimeData;
    NotificationService.onOpenNotifications = () {
      final context = NotificationService.navigatorKey.currentContext;
      if (context == null || _controller == null) return;

      context.push('/notifications');
    };

    if (mounted) {
      setState(() {
        _authStage = AuthStage.authenticated;
      });
      _router.go('/app');
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
        _router.go('/first-login');
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
    await NotificationService.unregisterDeviceForUser(_repository);
    NotificationService.onOpenNotifications = null;
    NotificationService.onDataRefresh = null;
    await _repository.logout();
    _controller?.dispose();
    _controller = null;

    if (!mounted) return;
    setState(() {
      _authStage = AuthStage.login;
    });
    _router.go('/login');
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
      _router.go('/login');
    }

    return result.message;
  }

  void _openRegister() {
    setState(() {
      _authStage = AuthStage.register;
    });
    _router.go('/register');
  }

  void _backToLogin() {
    setState(() {
      _authStage = AuthStage.login;
    });
    _router.go('/login');
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
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Badges Softinsa',
      theme: AppTheme.light(),
      routerConfig: _router,
      builder: (BuildContext context, Widget? child) {
        return child ?? const SizedBox.shrink();
      },
    );
  }

  void _goToCurrentStage() {
    if (!mounted) return;
    switch (_authStage) {
      case AuthStage.authenticated:
        _router.go('/app');
        break;
      case AuthStage.firstLogin:
        _router.go('/first-login');
        break;
      case AuthStage.register:
        _router.go('/register');
        break;
      case AuthStage.login:
        _router.go('/login');
        break;
    }
  }
}
