import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'auth/first_login_page.dart';
import 'auth/login_page.dart';
import 'auth/recover_password_page.dart';
import 'auth/register_page.dart';
import 'core/services/mutation_queue_service.dart';
import 'shared/app_theme.dart';
import 'shared/notification_service.dart';
import 'shared/session_storage.dart';
import 'consultor/consultor_repository.dart';
import 'consultor/consultor_controller.dart';
import 'consultor/consultor_models.dart';
import 'consultor/pages/consultor_shell_page.dart';
import 'consultor/pages/dashboard_page.dart';
import 'consultor/pages/home_page.dart';
import 'consultor/pages/ranking_page.dart';
import 'consultor/pages/upload_page.dart';
import 'consultor/pages/history_page.dart';
import 'consultor/pages/profile_page.dart';
import 'consultor/pages/consultant_profile_page.dart';
import 'consultor/pages/gallery_page.dart';
import 'consultor/pages/notifications_page.dart';
import 'consultor/pages/settings_page.dart';
import 'consultor/pages/timeline_page.dart';
import 'consultor/pages/email_signature_page.dart';
import 'consultor/pages/faq_page.dart';
import 'consultor/pages/learning_paths_page.dart';
import 'consultor/pages/learning_path_service_lines_page.dart';
import 'consultor/pages/rgpd_terms_page.dart';
import 'consultor/pages/settings/profile_settings_page.dart';
import 'consultor/pages/settings/notifications_settings_page.dart';
import 'consultor/pages/settings/privacy_settings_page.dart';
import 'consultor/pages/settings/help_settings_page.dart';

enum AuthStage { login, register, firstLogin, authenticated }

class BadgesPintApp extends StatefulWidget {
  const BadgesPintApp({super.key});

  @override
  State<BadgesPintApp> createState() => _BadgesPintAppState();
}

class _BadgesPintAppState extends State<BadgesPintApp> {
  final ConsultorRepository _repository = ConsultorRepository();
  final MutationQueueService _mutationQueue = MutationQueueService();

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
    _mutationQueue.dispose();
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
              location == '/recover-password' ||
              location == '/boot') {
            return '/app/dashboard';
          }
          return null;
        }

        if (_authStage == AuthStage.firstLogin) {
          return location == '/first-login' ? null : '/first-login';
        }

        if (location.startsWith('/app') ||
            location == '/ranking' ||
            location.startsWith('/consultants') ||
            location == '/gallery' ||
            location == '/notifications' ||
            location.startsWith('/settings') ||
            location == '/timeline' ||
            location == '/email-signature' ||
            location.startsWith('/learning-paths') ||
            location == '/boot') {
          return '/login';
        }

        return null;
      },
      routes: <RouteBase>[
        GoRoute(
          path: '/boot',
          builder: (BuildContext context, GoRouterState state) => const Scaffold(
              body: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text('A carregar...', style: TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
            ),
        ),
        GoRoute(
          path: '/login',
          builder: (BuildContext context, GoRouterState state) => LoginPage(
            onLogin: _handleLogin,
            onOpenRegister: _openRegister,
            onRecoverPassword: _openRecoverPassword,
          ),
        ),
        GoRoute(
          path: '/register',
          builder: (BuildContext context, GoRouterState state) => RegisterPage(
            areas: _areas,
            onRegister: _handleRegister,
            onBackToLogin: _backToLogin,
          ),
        ),
        GoRoute(
          path: '/recover-password',
          builder: (BuildContext context, GoRouterState state) =>
              RecoverPasswordPage(
            onRecover: _handleRecoverPassword,
            onBack: _backToLogin,
          ),
        ),
        GoRoute(
          path: '/first-login',
          builder: (BuildContext context, GoRouterState state) =>
              FirstLoginPage(onSubmit: _handleFirstLogin),
        ),

        // Authenticated tab shell — each branch keeps its own nav stack.
        StatefulShellRoute.indexedStack(
          builder: (
            BuildContext context,
            GoRouterState state,
            StatefulNavigationShell navigationShell,
          ) {
            final ctrl = _controller;
            if (ctrl == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return ConsultorShellPage(
              controller: ctrl,
              navigationShell: navigationShell,
              onLogout: _handleLogout,
            );
          },
          branches: <StatefulShellBranch>[
            StatefulShellBranch(
              routes: <RouteBase>[
                GoRoute(
                  path: '/app/dashboard',
                  builder: (BuildContext context, GoRouterState state) =>
                      DashboardPage(controller: _controller!),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: <RouteBase>[
                GoRoute(
                  path: '/app/home',
                  builder: (BuildContext context, GoRouterState state) =>
                      HomePage(controller: _controller!),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: <RouteBase>[
                GoRoute(
                  path: '/app/upload',
                  builder: (BuildContext context, GoRouterState state) =>
                      UploadPage(controller: _controller!),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: <RouteBase>[
                GoRoute(
                  path: '/app/history',
                  builder: (BuildContext context, GoRouterState state) =>
                      HistoryPage(controller: _controller!),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: <RouteBase>[
                GoRoute(
                  path: '/app/profile',
                  builder: (BuildContext context, GoRouterState state) =>
                      ProfilePage(controller: _controller!),
                ),
              ],
            ),
          ],
        ),

        GoRoute(
          path: '/ranking',
          builder: (BuildContext context, GoRouterState state) {
            final ctrl = _controller;
            if (ctrl == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return Scaffold(
              appBar: AppBar(title: const Text('Ranking')),
              body: RankingPage(controller: ctrl),
            );
          },
        ),
        GoRoute(
          path: '/consultants/:id',
          builder: (BuildContext context, GoRouterState state) {
            final ctrl = _controller;
            final id = int.tryParse(state.pathParameters['id'] ?? '');
            if (ctrl == null || id == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return ConsultantProfilePage(controller: ctrl, consultantId: id);
          },
        ),
        GoRoute(
          path: '/gallery',
          builder: (BuildContext context, GoRouterState state) {
            final ctrl = _controller;
            if (ctrl == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return GalleryPage(controller: ctrl);
          },
        ),
        GoRoute(
          path: '/notifications',
          builder: (BuildContext context, GoRouterState state) {
            final ctrl = _controller;
            if (ctrl == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return NotificationsPage(controller: ctrl);
          },
        ),
        GoRoute(
          path: '/settings',
          builder: (BuildContext context, GoRouterState state) {
            final ctrl = _controller;
            if (ctrl == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return SettingsPage(controller: ctrl);
          },
        ),
        GoRoute(
          path: '/settings/profile',
          builder: (BuildContext context, GoRouterState state) {
            final ctrl = _controller;
            if (ctrl == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return ProfileSettingsPage(controller: ctrl);
          },
        ),
        GoRoute(
          path: '/settings/notifications',
          builder: (BuildContext context, GoRouterState state) =>
              const NotificationsSettingsPage(),
        ),
        GoRoute(
          path: '/settings/privacy',
          builder: (BuildContext context, GoRouterState state) {
            final ctrl = _controller;
            if (ctrl == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return PrivacySettingsPage(controller: ctrl);
          },
        ),
        GoRoute(
          path: '/settings/help',
          builder: (BuildContext context, GoRouterState state) =>
              const HelpSettingsPage(),
        ),
        GoRoute(
          path: '/timeline',
          builder: (BuildContext context, GoRouterState state) {
            final ctrl = _controller;
            if (ctrl == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return TimelinePage(controller: ctrl);
          },
        ),
        GoRoute(
          path: '/faq',
          builder: (BuildContext context, GoRouterState state) => const FaqPage(),
        ),
        GoRoute(
          path: '/rgpd-terms',
          builder: (BuildContext context, GoRouterState state) => const RgpdTermsPage(),
        ),
        GoRoute(
          path: '/email-signature',
          builder: (BuildContext context, GoRouterState state) {
            final ctrl = _controller;
            if (ctrl == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return EmailSignaturePage(controller: ctrl);
          },
        ),
        GoRoute(
          path: '/learning-paths',
          builder: (BuildContext context, GoRouterState state) {
            final ctrl = _controller;
            if (ctrl == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return LearningPathsPage(controller: ctrl);
          },
        ),
        GoRoute(
          path: '/learning-paths/:id/service-lines',
          builder: (BuildContext context, GoRouterState state) {
            final ctrl = _controller;
            final id = int.tryParse(state.pathParameters['id'] ?? '');
            if (ctrl == null || id == null) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return LearningPathServiceLinesPage(
              controller: ctrl,
              learningPathId: id,
              learningPathName: state.extra as String?,
            );
          },
        ),
      ],
    );
  }

  Future<void> _bootstrap() async {
    await SessionStorage.instance.load();
    await _repository.syncAreas();
    _areas = await _repository.getAreas();

    _mutationQueue.initialize();

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

    // When the mutation queue flushes after reconnecting, refresh live data.
    _mutationQueue.onQueueFlushed = controller.refreshRealtimeData;

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
      _router.go('/app/dashboard');
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
    _mutationQueue.onQueueFlushed = null;
    await _mutationQueue.clear();
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

  void _openRecoverPassword() {
    _router.go('/recover-password');
  }

  Future<String?> _handleRecoverPassword(String email) {
    return _repository.recoverPassword(email: email);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Badges Softinsa',
      theme: AppTheme.light(),
      routerConfig: _router,
      builder: (BuildContext context, Widget? child) =>
          child ?? const SizedBox.shrink(),
    );
  }

  void _goToCurrentStage() {
    if (!mounted) return;
    switch (_authStage) {
      case AuthStage.authenticated:
        _router.go('/app/dashboard');
      case AuthStage.firstLogin:
        _router.go('/first-login');
      case AuthStage.register:
        _router.go('/register');
      case AuthStage.login:
        _router.go('/login');
    }
  }
}
