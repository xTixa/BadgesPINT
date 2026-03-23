import 'dart:convert';

import 'package:http/http.dart' as http;

import 'app_config.dart';

class ApiClient {
  const ApiClient();

  Uri _resolveUri(String path) {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('${AppConfig.apiBaseUrl}$normalizedPath');
  }

  Map<String, String> _headers({String? token, bool jsonBody = false}) {
    return <String, String>{
      if (jsonBody) 'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> get(String path, {String? token}) async {
    final response = await http.get(
      _resolveUri(path),
      headers: _headers(token: token),
    );

    return _decodeResponse(response);
  }

  Future<dynamic> post(String path, {String? token, Map<String, dynamic>? body}) async {
    final response = await http.post(
      _resolveUri(path),
      headers: _headers(token: token, jsonBody: true),
      body: jsonEncode(body ?? <String, dynamic>{}),
    );

    return _decodeResponse(response);
  }

  Future<dynamic> put(String path, {String? token, Map<String, dynamic>? body}) async {
    final response = await http.put(
      _resolveUri(path),
      headers: _headers(token: token, jsonBody: true),
      body: jsonEncode(body ?? <String, dynamic>{}),
    );

    return _decodeResponse(response);
  }

  dynamic _decodeResponse(http.Response response) {
    final statusCode = response.statusCode;

    if (statusCode >= 200 && statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    }

    throw ApiException(statusCode: statusCode, message: response.body);
  }
}

class ApiException implements Exception {
  ApiException({required this.statusCode, required this.message});

  final int statusCode;
  final String message;

  @override
  String toString() {
    return 'ApiException($statusCode): $message';
  }
}
