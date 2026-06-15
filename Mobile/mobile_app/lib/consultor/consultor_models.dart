class ConsultantUser {
  ConsultantUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.pointsTotal,
    this.areaId,
    this.location,
  });

  final int id;
  final String name;
  final String email;
  final String role;
  final int pointsTotal;
  final int? areaId;
  final String? location;

  factory ConsultantUser.fromJson(Map<String, dynamic> json) {
    return ConsultantUser(
      id: _readInt(json['id']) ?? 0,
      name: (json['name'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      role: (json['role'] ?? 'consultant').toString(),
      pointsTotal: _readInt(json['points_total']) ?? 0,
      areaId: _readInt(json['area_id']),
      location: json['localizacao']?.toString(),
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
  });

  final int id;
  final String name;
  final String status;
  final int points;
  final String? area;
  final int? expireInDays;

  bool get isObtained => status.toLowerCase() == 'obtido';

  factory BadgeItem.fromJson(Map<String, dynamic> json) {
    return BadgeItem(
      id: _readInt(json['id']) ?? 0,
      name: (json['name'] ?? json['description'] ?? 'Badge').toString(),
      status: (json['status'] ?? 'pendente').toString(),
      points: _readInt(json['pontos']) ?? _readInt(json['points']) ?? 0,
      area: json['area']?.toString(),
      expireInDays: _readInt(json['expiraEmDias']) ?? _readInt(json['expire_in_days']),
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
}

class RankingItem {
  RankingItem({
    required this.position,
    required this.name,
    required this.points,
  });

  final int position;
  final String name;
  final int points;
}

class CatalogBadgeItem {
  CatalogBadgeItem({
    required this.id,
    required this.name,
    required this.description,
    required this.points,
    required this.level,
    this.areaName,
    this.areaId,
  });

  final int id;
  final String name;
  final String description;
  final int points;
  final int level;
  final String? areaName;
  final int? areaId;

  factory CatalogBadgeItem.fromJson(Map<String, dynamic> json) {
    final area = json['area'];

    return CatalogBadgeItem(
      id: _readInt(json['id']) ?? 0,
      name: (json['name'] ?? 'Badge').toString(),
      description: (json['description'] ?? '').toString(),
      points: _readInt(json['points']) ?? 0,
      level: _readInt(json['level']) ?? 1,
      areaName: area is Map<String, dynamic> ? area['name']?.toString() : null,
      areaId: _readInt(json['area_id']),
    );
  }
}

class PedidoBadgeStatus {
  PedidoBadgeStatus({
    required this.id,
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
      status: (json['status'] ?? '').toString(),
      workflowStatus: (json['workflow_status'] ?? '').toString(),
      badgeName: badge is Map<String, dynamic> ? (badge['name'] ?? 'Badge').toString() : 'Badge',
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
