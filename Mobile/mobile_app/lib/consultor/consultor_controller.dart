import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/services/connectivity_service.dart';
import '../shared/api_client.dart';
import '../shared/download_helper.dart';
import '../shared/notification_service.dart';
import 'consultor_repository.dart';
import 'consultor_models.dart';

class ConsultorController extends ChangeNotifier {
  ConsultorController({required ConsultorRepository repository})
    : _repository = repository;

  final ConsultorRepository _repository;
  ConsultorRepository get repository => _repository;

  bool isLoading = true;
  int selectedTab = 0;
  ConsultantUser? profile;
  List<BadgeItem> badges = <BadgeItem>[];
  List<BadgeProgress> badgesProgress = <BadgeProgress>[];
  List<RecommendationItem> recommendations = <RecommendationItem>[];
  List<ExpiryAlert> expiryAlerts = <ExpiryAlert>[];
  List<RankingItem> ranking = <RankingItem>[];
  List<LearningPathProgressItem> learningPaths = <LearningPathProgressItem>[];
  List<CertificateItem> certificates = <CertificateItem>[];
  List<AreaItem> areas = <AreaItem>[];
  List<CatalogBadgeItem> catalogBadges = <CatalogBadgeItem>[];
  List<CatalogBadgeItem> preferredAreaBadges = <CatalogBadgeItem>[];
  List<PedidoBadgeStatus> pedidosStatus = <PedidoBadgeStatus>[];
  List<UserNotificationItem> notifications = <UserNotificationItem>[];

  int? selectedBadgeId;
  List<RequirementItem> requirements = <RequirementItem>[];
  List<EvidenceItem> evidences = <EvidenceItem>[];
  bool uploadLoading = false;
  bool isOnline = ConnectivityService.instance.isOnline;
  int pendingSyncCount = 0;

  int rankingPosition = 1; // valor default

  Timer? _pollingTimer;
  void Function(bool)? _connectivityListener;

  Future<void> refreshSyncState() async {
    isOnline = ConnectivityService.instance.isOnline;
    pendingSyncCount = await _repository.getPendingMutationCount();
    notifyListeners();
  }

  Future<void> initialize() async {
    isLoading = true;
    notifyListeners();
    void listener(bool online) {
      isOnline = online;
      notifyListeners();
      refreshSyncState();
    }

    _connectivityListener = listener;
    ConnectivityService.instance.addListener(listener);

    await _repository.syncInitialData();

    final results = await Future.wait<dynamic>(<Future<dynamic>>[
      _repository.getMyProfile(),
      _repository.getMyBadges(),
      _repository.getBadgesProgress(),
      _repository.getCatalogBadges(),
      _repository.getMyPedidosStatus(),
      _repository.getMyNotifications(),
      _repository.getAreas(),
      _repository.getConsultantsRanking(),
      _repository.getLearningPathProgress(),
      _repository.getCertificates(),
      _repository.getExpiryAlerts(),
    ]);

    profile = results[0] as ConsultantUser?;
    badges = results[1] as List<BadgeItem>;
    badgesProgress = results[2] as List<BadgeProgress>;
    catalogBadges = results[3] as List<CatalogBadgeItem>;
    pedidosStatus = results[4] as List<PedidoBadgeStatus>;
    notifications = results[5] as List<UserNotificationItem>;
    areas = results[6] as List<AreaItem>;
    ranking = results[7] as List<RankingItem>;
    learningPaths = results[8] as List<LearningPathProgressItem>;
    certificates = results[9] as List<CertificateItem>;
    expiryAlerts = results[10] as List<ExpiryAlert>;
    _updateRankingPosition();

    final areaId = profile?.areaId;
    if (areaId != null) {
      await _repository.syncBadgesByArea(areaId);
      preferredAreaBadges = await _repository.getBadgesByArea(areaId);
    } else {
      preferredAreaBadges = <CatalogBadgeItem>[];
    }

    recommendations = _buildRecommendations();

    if (badges.isNotEmpty) {
      await selectBadge(badges.first.id);
    }

    _startRealtimeRefresh();
    await refreshSyncState();
    _scheduleLocalNotifications();

    isLoading = false;
    notifyListeners();
  }

  void changeTab(int index) {
    selectedTab = index;
    notifyListeners();
  }

  void _startRealtimeRefresh() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 20), (_) async {
      await refreshRealtimeData();
    });
  }

  Future<void> refreshRealtimeData() async {
    await _repository.syncRealtimeData();

    final results = await Future.wait<dynamic>(<Future<dynamic>>[
      _repository.getMyPedidosStatus(),
      _repository.getMyNotifications(),
      _repository.getConsultantsRanking(),
      _repository.getLearningPathProgress(),
      _repository.getCertificates(),
      _repository.getExpiryAlerts(),
    ]);

    pedidosStatus = results[0] as List<PedidoBadgeStatus>;
    notifications = results[1] as List<UserNotificationItem>;
    ranking = results[2] as List<RankingItem>;
    learningPaths = results[3] as List<LearningPathProgressItem>;
    certificates = results[4] as List<CertificateItem>;
    expiryAlerts = results[5] as List<ExpiryAlert>;
    _updateRankingPosition();
    pendingSyncCount = await _repository.getPendingMutationCount();
    _scheduleLocalNotifications();
    notifyListeners();
  }

  Future<void> _scheduleLocalNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    final expiryOn = prefs.getBool('settings_alertas_expiracao') ?? true;
    final remindersOn = prefs.getBool('settings_lembretes_timeline') ?? false;

    if (expiryOn) {
      final alertMaps = expiryAlerts
          .map((a) => <String, dynamic>{
                'name': a.name,
                'expire_in_days': a.expireInDays,
              })
          .toList();
      NotificationService.scheduleExpiryReminders(alertMaps);
    } else {
      NotificationService.cancelExpiryReminders();
    }

    if (remindersOn) {
      NotificationService.scheduleGoalReminder(
        goalText: profile?.goalText ?? '',
        goalDeadline: profile?.goalDeadline,
      );
    } else {
      NotificationService.cancelGoalReminder();
    }
  }

  Future<bool> updateProfile({
    required String name,
    required String email,
    int? areaId,
    String? avatarUrl,
  }) async {
    final updated = await _repository.updateProfile(
      name: name,
      email: email,
      areaId: areaId,
      avatarUrl: avatarUrl,
    );

    if (updated == null) return false;

    profile = updated;
    final selectedAreaId = profile?.areaId;
    if (selectedAreaId != null) {
      try {
        await _repository.syncBadgesByArea(selectedAreaId);
      } catch (_) {
        // The profile update succeeded; keep using cached area badges if sync fails.
      }
    }
    preferredAreaBadges =
        selectedAreaId == null
            ? <CatalogBadgeItem>[]
            : await _repository.getBadgesByArea(selectedAreaId);
    recommendations = _buildRecommendations();
    notifyListeners();
    return true;
  }

  Future<String?> changePassword({
    required String currentPassword,
    required String newPassword,
  }) {
    return _repository.changePassword(
      currentPassword: currentPassword,
      newPassword: newPassword,
    );
  }

  Future<bool> updatePreferences({
    required bool rgpdPublicationAccepted,
    required bool publicProfileEnabled,
    required bool linkedinSharingEnabled,
    String? goalText,
    String? goalDeadline,
  }) async {
    final updated = await _repository.updatePreferences(
      rgpdPublicationAccepted: rgpdPublicationAccepted,
      publicProfileEnabled: publicProfileEnabled,
      linkedinSharingEnabled: linkedinSharingEnabled,
      goalText: goalText,
      goalDeadline: goalDeadline,
    );
    if (updated == null) return false;
    profile = updated;
    notifyListeners();
    return true;
  }

  int get badgesObtidos => badges.where((BadgeItem b) => b.isObtained).length;

  int get totalPoints {
    final profilePoints = profile?.pointsTotal ?? 0;
    if (profilePoints > 0) return profilePoints;

    return badges.fold<int>(
      0,
      (int acc, BadgeItem badge) => acc + badge.points,
    );
  }

  int get globalProgress {
    if (badges.isEmpty) return 0;
    return ((badgesObtidos / badges.length) * 100).round();
  }

  List<RecommendationItem> _buildRecommendations() {
    final obtainedIds =
        badges
            .where((badge) => badge.isObtained)
            .map((badge) => badge.id)
            .toSet();
    final source =
        preferredAreaBadges.isNotEmpty ? preferredAreaBadges : catalogBadges;

    return source
        .where((badge) => !obtainedIds.contains(badge.id))
        .take(4)
        .map(
          (badge) => RecommendationItem(
            id: badge.id,
            name: badge.name,
            reason:
                badge.areaName == null
                    ? 'Proximo nivel recomendado no catalogo'
                    : 'Recomendado para a tua area: ${badge.areaName}',
            points: badge.points,
          ),
        )
        .toList();
  }

  BadgeProgress? progressForBadge(int badgeId) {
    try {
      return badgesProgress.firstWhere(
        (BadgeProgress p) => p.badgeId == badgeId,
      );
    } catch (_) {
      return null;
    }
  }

  Future<void> selectBadge(int badgeId) async {
    selectedBadgeId = badgeId;
    uploadLoading = true;
    notifyListeners();

    await _repository.syncBadgeDetails(badgeId);

    final results = await Future.wait<dynamic>(<Future<dynamic>>[
      _repository.getRequirementsByBadge(badgeId),
      _repository.getEvidencesByBadge(badgeId),
    ]);

    requirements = results[0] as List<RequirementItem>;
    evidences = results[1] as List<EvidenceItem>;
    uploadLoading = false;
    notifyListeners();
  }

  EvidenceItem? latestEvidenceForRequirement(int requirementId) {
    final items = evidences.where(
      (EvidenceItem e) => e.requirementId == requirementId,
    );
    if (items.isEmpty) return null;
    return items.first;
  }

  Future<bool> submitEvidence({
    required int requirementId,
    required String evidenceUrl,
    String? notes,
  }) async {
    final success = await _repository.submitEvidence(
      requirementId: requirementId,
      evidenceUrl: evidenceUrl,
      notes: notes,
    );

    final badgeId = selectedBadgeId;
    if (success && badgeId != null && ConnectivityService.instance.isOnline) {
      _upsertLocalEvidence(
        EvidenceItem(
          id: DateTime.now().millisecondsSinceEpoch,
          requirementId: requirementId,
          status: 'pendente',
          evidenceUrl: evidenceUrl,
        ),
      );
      notifyListeners();

      // Only re-sync from API if we're online; if queued offline the sync
      // will happen automatically when MutationQueueService flushes.
      await _repository.syncBadgeDetails(badgeId);
      evidences = await _repository.getEvidencesByBadge(badgeId);
    }

    if (success) notifyListeners();
    return success;
  }

  void _upsertLocalEvidence(EvidenceItem evidence) {
    evidences = <EvidenceItem>[
      evidence,
      ...evidences.where(
        (item) => item.requirementId != evidence.requirementId,
      ),
    ];
  }

  Future<String?> uploadEvidenceFile({
    required String fileName,
    required Uint8List bytes,
  }) {
    return _repository.uploadEvidenceFile(fileName: fileName, bytes: bytes);
  }

  Future<ActionResult> submitPedido() async {
    final badgeId = selectedBadgeId;
    if (badgeId == null) {
      return ActionResult(
        success: false,
        message: 'Seleciona um badge antes de submeter o pedido.',
      );
    }
    final result = await _repository.submitPedido(badgeId);
    await refreshRealtimeData();
    await refreshSyncState();
    return result;
  }

  Future<ActionResult> downloadCertificate(int badgeId) async {
    try {
      final Uint8List? bytes = await _repository.downloadCertificatePdf(
        badgeId,
      );
      if (bytes == null) {
        return ActionResult(
          success: false,
          message: 'A API nao devolveu o certificado.',
        );
      }

      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final saved = await DownloadHelper.savePdf(
        bytes,
        'certificado_badge_${badgeId}_$timestamp.pdf',
      );
      return ActionResult(
        success: saved,
        message:
            saved
                ? 'Certificado guardado com sucesso.'
                : 'Nao foi possivel guardar o ficheiro neste dispositivo.',
      );
    } on ApiException catch (error) {
      return ActionResult(
        success: false,
        message: _extractApiMessage(error.message),
      );
    } on DioException catch (error) {
      return ActionResult(
        success: false,
        message: _certificateConnectionMessage(error),
      );
    } catch (error) {
      return ActionResult(
        success: false,
        message: 'Erro ao descarregar certificado: $error',
      );
    }
  }

  Future<bool> markNotificationAsRead(int notificationId) async {
    final ok = await _repository.markNotificationAsRead(notificationId);
    if (ok) {
      await refreshRealtimeData();
      await refreshSyncState();
    }
    return ok;
  }

  Future<bool> markAllNotificationsAsRead() async {
    final ok = await _repository.markAllNotificationsAsRead();
    if (ok) {
      await refreshRealtimeData();
      await refreshSyncState();
    }
    return ok;
  }

  Future<PublicConsultantProfile?> getPublicConsultantProfile(int id) {
    return _repository.getConsultantPublicProfile(id);
  }

  void _updateRankingPosition() {
    final profileId = profile?.id;
    if (profileId == null || ranking.isEmpty) return;

    for (final item in ranking) {
      if (item.consultantId == profileId) {
        rankingPosition = item.position;
        return;
      }
    }
  }

  String _extractApiMessage(String rawMessage) {
    try {
      final dynamic parsed = jsonDecode(rawMessage);
      if (parsed is Map<String, dynamic>) {
        final message = (parsed['message'] ?? parsed['error'] ?? '').toString();
        if (message.isNotEmpty) return message;
      }
    } catch (_) {
      // Keep raw message if it is not JSON.
    }

    if (rawMessage.trim().isNotEmpty) return rawMessage;
    return 'Erro ao contactar a API.';
  }

  String _certificateConnectionMessage(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionError:
        return 'Sem ligacao ao backend. Confirma se a API esta a correr e se fizeste adb reverse tcp:4000 tcp:4000.';
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.sendTimeout:
        return 'O backend demorou demasiado a responder ao certificado.';
      default:
        return 'Erro ao descarregar certificado: ${error.message ?? error.type.name}';
    }
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    final listener = _connectivityListener;
    if (listener != null) {
      ConnectivityService.instance.removeListener(listener);
    }
    super.dispose();
  }
}
