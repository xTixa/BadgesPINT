import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  ConnectivityService._();
  static final ConnectivityService instance = ConnectivityService._();

  final Connectivity _connectivity = Connectivity();
  bool _isOnline = true;
  StreamSubscription<List<ConnectivityResult>>? _sub;
  final List<void Function(bool)> _listeners = [];

  bool get isOnline => _isOnline;

  Future<void> initialize() async {
    final results = await _connectivity.checkConnectivity();
    _isOnline = _hasConnection(results);

    _sub = _connectivity.onConnectivityChanged.listen((results) {
      final online = _hasConnection(results);
      if (online == _isOnline) return;
      _isOnline = online;
      for (final cb in List<void Function(bool)>.of(_listeners)) {
        cb(online);
      }
    });
  }

  void addListener(void Function(bool isOnline) listener) {
    _listeners.add(listener);
  }

  void removeListener(void Function(bool isOnline) listener) {
    _listeners.remove(listener);
  }

  void dispose() {
    _sub?.cancel();
    _listeners.clear();
  }

  bool _hasConnection(List<ConnectivityResult> results) =>
      results.any((r) => r != ConnectivityResult.none);
}
