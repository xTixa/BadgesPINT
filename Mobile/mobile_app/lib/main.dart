import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

import 'app.dart';
import 'core/database/database_helper.dart';
import 'core/services/connectivity_service.dart';
import 'shared/notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (!kIsWeb) {
    await DatabaseHelper.instance.database;
  }
  await ConnectivityService.instance.initialize();
  try {
    await NotificationService.initialize();
  } catch (e) {
    debugPrint('Firebase init failed (push desativado): $e');
  }
  runApp(const BadgesPintApp());
}

