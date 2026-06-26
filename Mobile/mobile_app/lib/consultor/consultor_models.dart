class ConsultantUser {
  ConsultantUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.pointsTotal,
    this.areaId,
    this.location,
    this.avatarUrl,
    this.rgpdPublicationAccepted = false,
    this.publicProfileEnabled = false,
    this.linkedinSharingEnabled = true,
    this.goalText,
    this.goalDeadline,
  });

  final int id;
  final String name;
  final String email;
  final String role;
  final int pointsTotal;
  final int? areaId;
  final String? location;
  final String? avatarUrl;
  final bool rgpdPublicationAccepted;
  final bool publicProfileEnabled;
  final bool linkedinSharingEnabled;
  final String? goalText;
  final String? goalDeadline;

  factory ConsultantUser.fromJson(Map<String, dynamic> json) {
    return ConsultantUser(
      id: _readInt(json['id']) ?? 0,
      name: (json['name'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      role: (json['role'] ?? 'consultant').toString(),
      pointsTotal: _readInt(json['points_total']) ?? 0,
      areaId: _readInt(json['area_id']),
      location: json['localizacao']?.toString(),
      avatarUrl: json['avatar_url']?.toString(),
      rgpdPublicationAccepted: json['rgpd_publication_accepted'] == true,
      publicProfileEnabled: json['public_profile_enabled'] == true,
      linkedinSharingEnabled: json['linkedin_sharing_enabled'] != false,
      goalText: json['goal_text']?.toString(),
      goalDeadline: json['goal_deadline']?.toString(),
    );
  }
}

class LearningPathProgressItem {
  LearningPathProgressItem({
    required this.id,
    required this.name,
    required this.totalBadges,
    required this.obtainedBadges,
    required this.progress,
  });

  final int id;
  final String name;
  final int totalBadges;
  final int obtainedBadges;
  final int progress;

  factory LearningPathProgressItem.fromJson(Map<String, dynamic> json) {
    return LearningPathProgressItem(
      id: _readInt(json['id']) ?? 0,
      name: (json['name'] ?? '').toString(),
      totalBadges: _readInt(json['total_badges']) ?? 0,
      obtainedBadges: _readInt(json['obtained_badges']) ?? 0,
      progress: _readInt(json['progress']) ?? 0,
    );
  }
}

class CertificateItem {
  CertificateItem({
    required this.id,
    required this.badgeId,
    required this.badgeName,
    required this.verificationUrl,
    this.areaName,
    this.awardedAt,
  });

  final int id;
  final int badgeId;
  final String badgeName;
  final String verificationUrl;
  final String? areaName;
  final String? awardedAt;

  factory CertificateItem.fromJson(Map<String, dynamic> json) {
    return CertificateItem(
      id: _readInt(json['id']) ?? 0,
      badgeId: _readInt(json['badge_id']) ?? 0,
      badgeName: (json['badge_name'] ?? 'Badge').toString(),
      verificationUrl: (json['verification_url'] ?? '').toString(),
      areaName: json['area_name']?.toString(),
      awardedAt: json['awarded_at']?.toString(),
    );
  }
}

class AreaItem {
  AreaItem({required this.id, required this.name});

  final int id;
  final String name;

  factory AreaItem.fromJson(Map<String, dynamic> json) {
    return AreaItem(
      id: _readInt(json['id']) ?? 0,
      name: (json['name'] ?? '').toString(),
    );
  }
}

class BadgeItem {
  BadgeItem({
    required this.id,
    required this.name,
    required this.status,
    required this.points,
    this.area,
    this.expireInDays,
    this.imageUrl,
  });

  final int id;
  final String name;
  final String status;
  final int points;
  final String? area;
  final int? expireInDays;
  final String? imageUrl;

  bool get isObtained => status.toLowerCase() == 'obtido';

  factory BadgeItem.fromJson(Map<String, dynamic> json) {
    final area = json['area'];

    return BadgeItem(
      id: _readInt(json['id']) ?? 0,
      name: (json['name'] ?? json['description'] ?? 'Badge').toString(),
      status: (json['status'] ?? 'pendente').toString(),
      points: _readInt(json['pontos']) ?? _readInt(json['points']) ?? 0,
      area:
          json['area_name']?.toString() ??
          (area is Map<String, dynamic> ? area['name']?.toString() : null) ??
          area?.toString(),
      expireInDays:
          _readInt(json['expiraEmDias']) ??
          _readInt(json['expire_in_days']) ??
          _readInt(json['expiry_days']),
      imageUrl: json['image_url']?.toString(),
    );
  }
}

class BadgeProgress {
  BadgeProgress({
    required this.badgeId,
    required this.total,
    required this.approved,
  });

  final int badgeId;
  final int total;
  final int approved;

  factory BadgeProgress.fromJson(Map<String, dynamic> json) {
    return BadgeProgress(
      badgeId: _readInt(json['badge_id']) ?? 0,
      total: _readInt(json['total']) ?? 0,
      approved: _readInt(json['approved']) ?? 0,
    );
  }
}

class RequirementItem {
  RequirementItem({
    required this.id,
    required this.title,
    required this.description,
    required this.code,
    this.imageUrl,
  });

  final int id;
  final String title;
  final String description;
  final String code;
  final String? imageUrl;

  factory RequirementItem.fromJson(Map<String, dynamic> json) {
    return RequirementItem(
      id: _readInt(json['id']) ?? 0,
      title: (json['title'] ?? 'Requisito').toString(),
      description: (json['description'] ?? '').toString(),
      code: (json['code'] ?? 'REQ').toString(),
      imageUrl: json['image_url']?.toString(),
    );
  }
}

class EvidenceItem {
  EvidenceItem({
    required this.id,
    required this.requirementId,
    required this.status,
    required this.evidenceUrl,
  });

  final int id;
  final int requirementId;
  final String status;
  final String evidenceUrl;

  factory EvidenceItem.fromJson(Map<String, dynamic> json) {
    return EvidenceItem(
      id: _readInt(json['id']) ?? 0,
      requirementId: _readInt(json['requirement_id']) ?? 0,
      status: (json['status'] ?? 'pendente').toString(),
      evidenceUrl: (json['evidence_url'] ?? '').toString(),
    );
  }
}

class RecommendationItem {
  RecommendationItem({
    required this.id,
    required this.name,
    required this.reason,
    required this.points,
  });

  final int id;
  final String name;
  final String reason;
  final int points;
}

class ExpiryAlert {
  ExpiryAlert({
    required this.id,
    required this.name,
    required this.expireInDays,
  });

  final int id;
  final String name;
  final int expireInDays;

  factory ExpiryAlert.fromJson(Map<String, dynamic> json) {
    return ExpiryAlert(
      id: _readInt(json['id']) ?? _readInt(json['badge_id']) ?? 0,
      name:
          (json['nome'] ??
                  json['name'] ??
                  json['badge_name'] ??
                  json['description'] ??
                  'Badge')
              .toString(),
      expireInDays:
          _readInt(json['expiraEmDias']) ??
          _readInt(json['dias_restantes']) ??
          _readInt(json['dias']) ??
          _readInt(json['expire_in_days']) ??
          0,
    );
  }
}

class RankingItem {
  RankingItem({
    required this.consultantId,
    required this.position,
    required this.name,
    required this.points,
    this.email,
    this.areaName,
    this.avatarUrl,
    this.badgeCount = 0,
  });

  final int consultantId;
  final int position;
  final String name;
  final int points;
  final String? email;
  final String? areaName;
  final String? avatarUrl;
  final int badgeCount;

  factory RankingItem.fromJson(Map<String, dynamic> json) {
    return RankingItem(
      consultantId: _readInt(json['id']) ?? _readInt(json['consultor_id']) ?? 0,
      position: _readInt(json['ranking']) ?? _readInt(json['position']) ?? 0,
      name: (json['name'] ?? '').toString(),
      points: _readInt(json['points_total']) ?? _readInt(json['points']) ?? 0,
      email: json['email']?.toString(),
      areaName: json['area_name']?.toString(),
      avatarUrl: json['avatar_url']?.toString(),
      badgeCount: _readInt(json['badge_count']) ?? 0,
    );
  }
}

class PublicConsultantProfile {
  PublicConsultantProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.pointsTotal,
    required this.ranking,
    required this.badges,
    this.areaId,
    this.areaName,
    this.avatarUrl,
  });

  final int id;
  final String name;
  final String email;
  final int pointsTotal;
  final int ranking;
  final List<BadgeItem> badges;
  final int? areaId;
  final String? areaName;
  final String? avatarUrl;

  factory PublicConsultantProfile.fromJson(Map<String, dynamic> json) {
    final rawBadges = json['badges'];
    return PublicConsultantProfile(
      id: _readInt(json['id']) ?? 0,
      name: (json['name'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      pointsTotal: _readInt(json['points_total']) ?? 0,
      ranking: _readInt(json['ranking']) ?? 0,
      areaId: _readInt(json['area_id']),
      areaName: json['area_name']?.toString(),
      avatarUrl: json['avatar_url']?.toString(),
      badges:
          rawBadges is List
              ? rawBadges
                  .whereType<Map<String, dynamic>>()
                  .map(BadgeItem.fromJson)
                  .toList()
              : <BadgeItem>[],
    );
  }
}

class CatalogBadgeItem {
  CatalogBadgeItem({
    required this.id,
    required this.name,
    required this.description,
    required this.points,
    required this.level,
    required this.levelLabel,
    this.areaName,
    this.areaId,
    this.imageUrl,
  });

  final int id;
  final String name;
  final String description;
  final int points;
  final int level;
  final String levelLabel;
  final String? areaName;
  final int? areaId;
  final String? imageUrl;

  factory CatalogBadgeItem.fromJson(Map<String, dynamic> json) {
    final area = json['area'];
    final rawLevel = json['level'];

    return CatalogBadgeItem(
      id: _readInt(json['id']) ?? 0,
      name:
          (json['name'] ?? json['title'] ?? json['description'] ?? 'Badge')
              .toString(),
      description: (json['description'] ?? '').toString(),
      points: _readInt(json['points']) ?? 0,
      level: _readLevel(rawLevel),
      levelLabel: rawLevel?.toString() ?? 'Nivel 1',
      areaName: area is Map<String, dynamic> ? area['name']?.toString() : null,
      areaId: _readInt(json['area_id']),
      imageUrl: json['image_url']?.toString(),
    );
  }
}

class PedidoBadgeStatus {
  PedidoBadgeStatus({
    required this.id,
    required this.badgeId,
    required this.status,
    required this.workflowStatus,
    required this.badgeName,
    this.createdAt,
    this.submittedAt,
    this.tmValidatedAt,
    this.tmComment,
    this.slValidatedAt,
    this.slComment,
    this.awardedAt,
  });

  final int id;
  final int badgeId;
  final String status;
  final String workflowStatus;
  final String badgeName;
  final String? createdAt;
  final String? submittedAt;
  final String? tmValidatedAt;
  final String? tmComment;
  final String? slValidatedAt;
  final String? slComment;
  final String? awardedAt;

  factory PedidoBadgeStatus.fromJson(Map<String, dynamic> json) {
    final badge = json['badge'];

    return PedidoBadgeStatus(
      id: _readInt(json['id']) ?? 0,
      badgeId:
          _readInt(json['badge_id']) ??
          (badge is Map<String, dynamic> ? _readInt(badge['id']) : null) ??
          0,
      status: (json['status'] ?? '').toString(),
      workflowStatus: (json['workflow_status'] ?? '').toString(),
      badgeName:
          badge is Map<String, dynamic>
              ? (badge['name'] ?? badge['description'] ?? 'Badge').toString()
              : 'Badge',
      createdAt: (json['created_at'] ?? json['createdAt'])?.toString(),
      submittedAt: json['submitted_at']?.toString(),
      tmValidatedAt: json['tm_validated_at']?.toString(),
      tmComment: json['tm_comment']?.toString(),
      slValidatedAt: json['sl_validated_at']?.toString(),
      slComment: json['sl_comment']?.toString(),
      awardedAt: json['data_atribuicao']?.toString(),
    );
  }
}

class UserNotificationItem {
  UserNotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.read,
  });

  final int id;
  final String title;
  final String message;
  final bool read;

  factory UserNotificationItem.fromJson(Map<String, dynamic> json) {
    return UserNotificationItem(
      id: _readInt(json['id']) ?? 0,
      title: (json['titulo'] ?? '').toString(),
      message: (json['mensagem'] ?? '').toString(),
      read: json['lido'] == true,
    );
  }
}

int? _readInt(dynamic value) {
  if (value == null) return null;
  if (value is int) return value;
  return int.tryParse(value.toString());
}

int _readLevel(dynamic value) {
  final numeric = _readInt(value);
  if (numeric != null) return numeric;

  switch ((value ?? '').toString().toLowerCase()) {
    case 'junior':
      return 1;
    case 'intermedio':
    case 'intermédio':
      return 2;
    case 'senior':
      return 3;
    case 'especialista':
      return 4;
    case 'lider':
    case 'líder':
      return 5;
    default:
      return 1;
  }
}
