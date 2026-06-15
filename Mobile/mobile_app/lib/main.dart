import 'package:flutter/material.dart';

import 'app.dart';
import 'shared/notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService.initialize();
  runApp(const BadgesPintApp());
}

