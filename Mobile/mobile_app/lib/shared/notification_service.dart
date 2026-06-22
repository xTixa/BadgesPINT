import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../consultor/consultor_repository.dart';
import 'app_config.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await NotificationService.ensureFirebaseInitialized();
}

class NotificationService {
  NotificationService._();

  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static bool _firebaseReady = false;
  static bool _localReady = false;
  static StreamSubscription<String>? _tokenRefreshSubscription;
  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();
  static VoidCallback? onOpenNotifications;
  static Future<void> Function()? onDataRefresh;

  static Future<void> initialize() async {
    final firebaseReady = await ensureFirebaseInitialized();
    if (!firebaseReady) return;

    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
    await _initializeLocalNotifications();

    await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    await FirebaseMessaging.instance
        .setForegroundNotificationPresentationOptions(
          alert: true,
          badge: true,
          sound: true,
        );

    FirebaseMessaging.onMessage.listen((message) async {
      await onDataRefresh?.call();
      await _showForegroundNotification(message);
    });
    FirebaseMessaging.onMessageOpenedApp.listen((_) async {
      await onDataRefresh?.call();
      _openNotifications();
    });

    final initialMessage = await FirebaseMessaging.instance.getInitialMessage();
    if (initialMessage != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        await onDataRefresh?.call();
        _openNotifications();
      });
    }
  }

  static Future<bool> ensureFirebaseInitialized() async {
    if (_firebaseReady) return true;
    if (kIsWeb && !AppConfig.hasFirebaseConfig) {
      debugPrint(
        'Firebase nao inicializado: faltam FIREBASE_API_KEY, '
        'FIREBASE_APP_ID, FIREBASE_MESSAGING_SENDER_ID ou FIREBASE_PROJECT_ID.',
      );
      return false;
    }

    if (Firebase.apps.isEmpty) {
      if (AppConfig.hasFirebaseConfig) {
        await Firebase.initializeApp(
          options: FirebaseOptions(
            apiKey: AppConfig.firebaseApiKey,
            appId: AppConfig.firebaseAppId,
            messagingSenderId: AppConfig.firebaseMessagingSenderId,
            projectId: AppConfig.firebaseProjectId,
            storageBucket:
                AppConfig.firebaseStorageBucket.isEmpty
                    ? null
                    : AppConfig.firebaseStorageBucket,
          ),
        );
      } else {
        await Firebase.initializeApp();
      }
    }

    _firebaseReady = true;
    return true;
  }

  static Future<void> registerDeviceForUser(
    ConsultorRepository repository,
  ) async {
    if (!await ensureFirebaseInitialized()) return;

    final token = await FirebaseMessaging.instance.getToken();
    if (token != null && token.isNotEmpty) {
      final registered = await repository.registerDeviceToken(token);
      debugPrint(
        registered
            ? 'Token FCM registado na API.'
            : 'Token FCM obtido, mas a API nao o registou.',
      );
    } else {
      debugPrint('Firebase inicializado, mas nao foi obtido token FCM.');
    }

    await _tokenRefreshSubscription?.cancel();
    _tokenRefreshSubscription = FirebaseMessaging.instance.onTokenRefresh
        .listen((token) async {
          await repository.registerDeviceToken(token);
        });
  }

  static Future<void> unregisterDeviceForUser(
    ConsultorRepository repository,
  ) async {
    if (!await ensureFirebaseInitialized()) return;

    final token = await FirebaseMessaging.instance.getToken();
    if (token != null && token.isNotEmpty) {
      await repository.unregisterDeviceToken(token);
    }

    await _tokenRefreshSubscription?.cancel();
    _tokenRefreshSubscription = null;
  }

  static Future<void> _initializeLocalNotifications() async {
    if (_localReady || kIsWeb) return;

    const androidSettings = AndroidInitializationSettings(
      '@mipmap/ic_launcher',
    );
    const darwinSettings = DarwinInitializationSettings();

    await _localNotifications.initialize(
      const InitializationSettings(
        android: androidSettings,
        iOS: darwinSettings,
        macOS: darwinSettings,
      ),
      onDidReceiveNotificationResponse: (_) => _openNotifications(),
    );

    const channel = AndroidNotificationChannel(
      'badges_alerts',
      'Alertas de Badges',
      description: 'Aprovacoes, rejeicoes, lembretes e expiracoes de badges.',
      importance: Importance.high,
    );

    const slaChannel = AndroidNotificationChannel(
      'badges_sla',
      'SLA de Badges',
      description: 'Alertas de SLA ultrapassado na plataforma.',
      importance: Importance.max,
    );

    final androidPlugin = _localNotifications
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >();
    await androidPlugin?.createNotificationChannel(channel);
    await androidPlugin?.createNotificationChannel(slaChannel);

    _localReady = true;
  }

  static Future<void> _showForegroundNotification(RemoteMessage message) async {
    if (!_localReady || kIsWeb) return;

    final notification = message.notification;
    final title = notification?.title ?? message.data['titulo']?.toString();
    final body = notification?.body ?? message.data['mensagem']?.toString();
    if (title == null && body == null) return;

    final isSla = message.data['type']?.toString() == 'sla';
    final channelId = isSla ? 'badges_sla' : 'badges_alerts';
    final channelName = isSla ? 'SLA de Badges' : 'Alertas de Badges';
    final channelDesc = isSla
        ? 'Alertas de SLA ultrapassado na plataforma.'
        : 'Aprovacoes, rejeicoes, lembretes e expiracoes de badges.';

    await _localNotifications.show(
      message.hashCode,
      title ?? 'Softinsa Badges',
      body ?? '',
      NotificationDetails(
        android: AndroidNotificationDetails(
          channelId,
          channelName,
          channelDescription: channelDesc,
          importance: isSla ? Importance.max : Importance.high,
          priority: isSla ? Priority.max : Priority.high,
        ),
        iOS: const DarwinNotificationDetails(),
        macOS: const DarwinNotificationDetails(),
      ),
      payload: message.data['notificationId']?.toString(),
    );
  }

  static void _openNotifications() {
    onOpenNotifications?.call();
  }

  static Future<void> cancelExpiryReminders() async {
    if (!_localReady || kIsWeb) return;
    await _localNotifications.cancel(90001);
  }

  static Future<void> cancelGoalReminder() async {
    if (!_localReady || kIsWeb) return;
    await _localNotifications.cancel(90002);
  }

  static Future<void> scheduleExpiryReminders(
    List<Map<String, dynamic>> alerts,
  ) async {
    if (!_localReady || kIsWeb) return;

    await _localNotifications.cancel(90001);
    await _localNotifications.cancel(90002);

    final expiring = alerts
        .where((a) {
          final days = a['expire_in_days'];
          return days is int && days >= 0 && days <= 7;
        })
        .toList();

    if (expiring.isEmpty) return;

    final names = expiring
        .map((a) => a['name']?.toString() ?? '')
        .where((n) => n.isNotEmpty)
        .take(3)
        .join(', ');

    const details = NotificationDetails(
      android: AndroidNotificationDetails(
        'badges_alerts',
        'Alertas de Badges',
        channelDescription:
            'Aprovacoes, rejeicoes, lembretes e expiracoes de badges.',
        importance: Importance.high,
        priority: Priority.high,
      ),
      iOS: DarwinNotificationDetails(),
    );

    await _localNotifications.show(
      90001,
      'Badges a expirar em breve',
      'Os seguintes badges expiram nos proximos 7 dias: $names',
      details,
    );
  }

  static Future<void> scheduleGoalReminder({
    required String goalText,
    required String? goalDeadline,
  }) async {
    if (!_localReady || kIsWeb) return;

    await _localNotifications.cancel(90002);

    if (goalDeadline == null || goalDeadline.isEmpty || goalText.isEmpty) {
      return;
    }

    // Parse deadline in common formats: dd/MM/yyyy or yyyy-MM-dd
    DateTime? deadline;
    try {
      final parts = goalDeadline.contains('/')
          ? goalDeadline.split('/')
          : goalDeadline.split('-');
      if (parts.length == 3) {
        if (goalDeadline.contains('/')) {
          deadline = DateTime(
            int.parse(parts[2]),
            int.parse(parts[1]),
            int.parse(parts[0]),
          );
        } else {
          deadline = DateTime(
            int.parse(parts[0]),
            int.parse(parts[1]),
            int.parse(parts[2]),
          );
        }
      }
    } catch (_) {
      return;
    }

    if (deadline == null) return;

    final daysLeft = deadline.difference(DateTime.now()).inDays;
    if (daysLeft < 0 || daysLeft > 30) return;

    const details = NotificationDetails(
      android: AndroidNotificationDetails(
        'badges_alerts',
        'Alertas de Badges',
        channelDescription:
            'Aprovacoes, rejeicoes, lembretes e expiracoes de badges.',
        importance: Importance.high,
        priority: Priority.high,
      ),
      iOS: DarwinNotificationDetails(),
    );

    await _localNotifications.show(
      90002,
      'Lembrete: objetivo na timeline',
      'Faltam $daysLeft dia${daysLeft == 1 ? '' : 's'} para: $goalText',
      details,
    );
  }
}
