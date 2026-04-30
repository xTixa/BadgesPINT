import 'dart:async';

import 'package:flutter/foundation.dart';

import '../shared/download_helper.dart';
import 'consultor_repository.dart';
import 'consultor_models.dart';

class ConsultorController extends ChangeNotifier {
  ConsultorController({required ConsultorRepository repository}) : _repository = repository;

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
  List<CatalogBadgeItem> catalogBadges = <CatalogBadgeItem>[];
  List<CatalogBadgeItem> preferredAreaBadges = <CatalogBadgeItem>[];
  List<PedidoBadgeStatus> pedidosStatus = <PedidoBadgeStatus>[];
  List<UserNotificationItem> notifications = <UserNotificationItem>[];

  int? selectedBadgeId;
  List<RequirementItem> requirements = <RequirementItem>[];
  List<EvidenceItem> evidences = <EvidenceItem>[];
  bool uploadLoading = false;

  int rankingPosition = 1; // valor default

  Timer? _pollingTimer;

  Future<void> initialize() async {
    isLoading = true;
    notifyListeners();

    final results = await Future.wait<dynamic>(<Future<dynamic>>[
      _repository.getMyProfile(),
      _repository.getMyBadges(),
      _repository.getBadgesProgress(),
      _repository.getCatalogBadges(),
      _repository.getMyPedidosStatus(),
      _repository.getMyNotifications(),
    ]);

    profile = results[0] as ConsultantUser?;
    badges = results[1] as List<BadgeItem>;
    badgesProgress = results[2] as List<BadgeProgress>;
    catalogBadges = results[3] as List<CatalogBadgeItem>;
    pedidosStatus = results[4] as List<PedidoBadgeStatus>;
    notifications = results[5] as List<UserNotificationItem>;

    recommendations = _repository.getRecommendationsMock();
    expiryAlerts = _repository.getExpiryAlertsMock();
    ranking = _repository.getRankingMock();

    final areaId = profile?.areaId;
    if (areaId != null) {
      preferredAreaBadges = await _repository.getBadgesByArea(areaId);
    } else {
      preferredAreaBadges = <CatalogBadgeItem>[];
    }

    if (badges.isNotEmpty) {
      await selectBadge(badges.first.id);
    }

    _startRealtimeRefresh();

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
    final results = await Future.wait<dynamic>(<Future<dynamic>>[
      _repository.getMyPedidosStatus(),
      _repository.getMyNotifications(),
    ]);

    pedidosStatus = results[0] as List<PedidoBadgeStatus>;
    notifications = results[1] as List<UserNotificationItem>;
    notifyListeners();
  }

  int get badgesObtidos => badges.where((BadgeItem b) => b.isObtained).length;

  int get totalPoints {
    final profilePoints = profile?.pointsTotal ?? 0;
    if (profilePoints > 0) return profilePoints;

    return badges.fold<int>(0, (int acc, BadgeItem badge) => acc + badge.points);
  }

  int get globalProgress {
    if (badges.isEmpty) return 0;
    return ((badgesObtidos / badges.length) * 100).round();
  }

  BadgeProgress? progressForBadge(int badgeId) {
    try {
      return badgesProgress.firstWhere((BadgeProgress p) => p.badgeId == badgeId);
    } catch (_) {
      return null;
    }
  }

  Future<void> selectBadge(int badgeId) async {
    selectedBadgeId = badgeId;
    uploadLoading = true;
    notifyListeners();

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
    final items = evidences.where((EvidenceItem e) => e.requirementId == requirementId);
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
    if (success && badgeId != null) {
      evidences = await _repository.getEvidencesByBadge(badgeId);
      notifyListeners();
    }

    return success;
  }

  Future<bool> submitPedido() async {
    final badgeId = selectedBadgeId;
    if (badgeId == null) return false;
    final success = await _repository.submitPedido(badgeId);
    await refreshRealtimeData();
    return success;
  }

  Future<bool> downloadCertificate(int badgeId) async {
    final Uint8List? bytes = await _repository.downloadCertificatePdf(badgeId);
    if (bytes == null) return false;

    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return DownloadHelper.savePdf(bytes, 'certificado_badge_${badgeId}_$timestamp.pdf');
  }

  Future<bool> markNotificationAsRead(int notificationId) async {
    final ok = await _repository.markNotificationAsRead(notificationId);
    if (ok) {
      await refreshRealtimeData();
    }
    return ok;
  }

  Future<bool> markAllNotificationsAsRead() async {
    final ok = await _repository.markAllNotificationsAsRead();
    if (ok) {
      await refreshRealtimeData();
    }
    return ok;
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }
}
