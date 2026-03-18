class SessionStorage {
  SessionStorage._();

  static final SessionStorage instance = SessionStorage._();

  String? token;
  int? userId;

  bool get hasSession => token != null && token!.isNotEmpty && userId != null;

  void setSession({required String tokenValue, required int userIdValue}) {
    token = tokenValue;
    userId = userIdValue;
  }

  void clear() {
    token = null;
    userId = null;
  }
}
