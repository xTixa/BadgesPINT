import 'package:shared_preferences/shared_preferences.dart';

class SessionStorage {
  SessionStorage._();

  static final SessionStorage instance = SessionStorage._();
  static const String _tokenKey = 'auth_token';
  static const String _userIdKey = 'auth_user_id';
  static const String _themeModeKey = 'app_theme_mode';
  static const String _savedEmailKey = 'saved_login_email';
  static const String _savedPasswordKey = 'saved_login_password';
  static const String _rememberCredentialsKey = 'remember_login_credentials';

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

  Future<SavedCredentials?> loadSavedCredentials() async {
    final prefs = await SharedPreferences.getInstance();
    final remember = prefs.getBool(_rememberCredentialsKey) ?? false;
    if (!remember) return null;

    final email = prefs.getString(_savedEmailKey) ?? '';
    final password = prefs.getString(_savedPasswordKey) ?? '';
    if (email.isEmpty || password.isEmpty) return null;

    return SavedCredentials(email: email, password: password);
  }

  Future<void> saveCredentials({
    required String email,
    required String password,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_rememberCredentialsKey, true);
    await prefs.setString(_savedEmailKey, email);
    await prefs.setString(_savedPasswordKey, password);
  }

  Future<void> clearSavedCredentials() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_rememberCredentialsKey, false);
    await prefs.remove(_savedEmailKey);
    await prefs.remove(_savedPasswordKey);
  }
}

class SavedCredentials {
  const SavedCredentials({required this.email, required this.password});

  final String email;
  final String password;
}
