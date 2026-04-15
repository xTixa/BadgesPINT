import 'package:shared_preferences/shared_preferences.dart';

class SessionStorage {
  SessionStorage._();

  static final SessionStorage instance = SessionStorage._();
  static const String _tokenKey = 'auth_token';
  static const String _userIdKey = 'auth_user_id';
  static const String _themeModeKey = 'app_theme_mode';

  String? token;
  int? userId;
  String? themeMode;

  bool get hasSession => token != null && token!.isNotEmpty && userId != null;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    token = prefs.getString(_tokenKey);
    userId = prefs.getInt(_userIdKey);
    themeMode = prefs.getString(_themeModeKey);
  }

  Future<void> setSession({
    required String tokenValue,
    required int userIdValue,
  }) async {
    token = tokenValue;
    userId = userIdValue;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, tokenValue);
    await prefs.setInt(_userIdKey, userIdValue);
  }

  Future<void> clear() async {
    token = null;
    userId = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userIdKey);
  }

  Future<void> setThemeMode(String value) async {
    themeMode = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeModeKey, value);
  }
}
