import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

import 'app.dart';
import 'core/database/database_helper.dart';
import 'shared/notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (!kIsWeb) {
    await DatabaseHelper.instance.database;
  }
  await NotificationService.initialize();
  runApp(const BadgesPintApp());
}

