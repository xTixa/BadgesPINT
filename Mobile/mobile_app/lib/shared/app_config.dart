class AppConfig {
  static const String _apiBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const String _defaultApiBaseUrl = 'https://badgespint.onrender.com';

  static String get apiBaseUrl {
    if (_apiBaseUrl.isEmpty) {
      return _defaultApiBaseUrl;
    }
    return _apiBaseUrl;
  }

  static const String firebaseApiKey = String.fromEnvironment(
    'FIREBASE_API_KEY',
  );
  static const String firebaseAppId = String.fromEnvironment('FIREBASE_APP_ID');
  static const String firebaseMessagingSenderId = String.fromEnvironment(
    'FIREBASE_MESSAGING_SENDER_ID',
  );
  static const String firebaseProjectId = String.fromEnvironment(
    'FIREBASE_PROJECT_ID',
  );
  static const String firebaseStorageBucket = String.fromEnvironment(
    'FIREBASE_STORAGE_BUCKET',
  );

  static bool get hasFirebaseConfig =>
      firebaseApiKey.isNotEmpty &&
      firebaseAppId.isNotEmpty &&
      firebaseMessagingSenderId.isNotEmpty &&
      firebaseProjectId.isNotEmpty;
}
