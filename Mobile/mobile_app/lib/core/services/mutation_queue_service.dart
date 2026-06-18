import 'connectivity_service.dart';
import '../../data/local/pending_mutation_dao.dart';
import '../../shared/api_client.dart';
import '../../shared/session_storage.dart';

class MutationQueueService {
  MutationQueueService({
    ApiClient? apiClient,
    PendingMutationDao? mutationDao,
  })  : _apiClient = apiClient ?? ApiClient(),
        _dao = mutationDao ?? PendingMutationDao();

  final ApiClient _apiClient;
  final PendingMutationDao _dao;

  bool _processing = false;

  // Called after the queue is fully flushed — wire this to a data refresh.
  void Function()? onQueueFlushed;

  void initialize() {
    ConnectivityService.instance.addListener(_onConnectivity);
    if (ConnectivityService.instance.isOnline) {
      processQueue();
    }
  }

  void dispose() {
    ConnectivityService.instance.removeListener(_onConnectivity);
  }

  void _onConnectivity(bool isOnline) {
    if (isOnline) processQueue();
  }

  Future<void> processQueue() async {
    if (_processing) return;
    _processing = true;
    try {
      final token = SessionStorage.instance.token;
      final pending = await _dao.getAll();
      if (pending.isEmpty) return;

      for (final mutation in pending) {
        try {
          switch (mutation.method) {
            case 'POST':
              await _apiClient.post(
                mutation.endpoint,
                token: token,
                body: mutation.jsonBody,
              );
            case 'PUT':
              await _apiClient.put(
                mutation.endpoint,
                token: token,
                body: mutation.jsonBody ?? <String, dynamic>{},
              );
          }
          await _dao.delete(mutation.id);
        } catch (_) {
          await _dao.incrementAttempts(mutation.id);
        }
      }
      onQueueFlushed?.call();
    } finally {
      _processing = false;
    }
  }

  Future<void> clear() => _dao.clear();
}
