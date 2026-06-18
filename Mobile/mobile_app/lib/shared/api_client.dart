import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app_config.dart';

class ApiClient {
  ApiClient({Dio? dio}) : _dio = dio ?? Dio() {
    _dio.options = BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 20),
      validateStatus: (_) => true,
    );
    _dio.interceptors.add(_CookieInterceptor());
  }

  final Dio _dio;

  static Future<void> clearCookies() => _CookieInterceptor.clear();

  Map<String, String> _headers({String? token, bool jsonBody = false}) {
    return <String, String>{
      if (jsonBody) 'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> get(String path, {String? token}) async {
    final response = await _dio.get<dynamic>(
      path,
      options: Options(headers: _headers(token: token)),
    );

    return _decodeResponse(response);
  }

  Future<dynamic> post(String path, {String? token, Map<String, dynamic>? body}) async {
    final response = await _dio.post<dynamic>(
      path,
      data: body ?? <String, dynamic>{},
      options: Options(headers: _headers(token: token, jsonBody: true)),
    );

    return _decodeResponse(response);
  }

  Future<dynamic> put(String path, {String? token, Map<String, dynamic>? body}) async {
    final response = await _dio.put<dynamic>(
      path,
      data: body ?? <String, dynamic>{},
      options: Options(headers: _headers(token: token, jsonBody: true)),
    );

    return _decodeResponse(response);
  }

  Future<Uint8List?> postBytes(String path, {String? token, Map<String, dynamic>? body}) async {
    final response = await _dio.post<List<int>>(
      path,
      data: body ?? <String, dynamic>{},
      options: Options(
        headers: _headers(token: token, jsonBody: true),
        responseType: ResponseType.bytes,
      ),
    );

    if (response.statusCode != null &&
        response.statusCode! >= 200 &&
        response.statusCode! < 300 &&
        response.data != null) {
      return Uint8List.fromList(response.data!);
    }

    return null;
  }

  dynamic _decodeResponse(Response<dynamic> response) {
    final statusCode = response.statusCode;

    if (statusCode != null && statusCode >= 200 && statusCode < 300) {
      return response.data;
    }

    throw ApiException(
      statusCode: statusCode ?? 0,
      message:
          response.data is Map || response.data is List
              ? jsonEncode(response.data)
              : response.data?.toString() ?? '',
    );
  }
}

class _CookieInterceptor extends Interceptor {
  static const String _cookieKey = 'api_cookie_header';

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final cookie = prefs.getString(_cookieKey);
    if (cookie != null && cookie.isNotEmpty) {
      options.headers['Cookie'] = cookie;
    }
    handler.next(options);
  }

  @override
  Future<void> onResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) async {
    final cookies = response.headers.map['set-cookie'];
    if (cookies != null && cookies.isNotEmpty) {
      final cookieHeader =
          cookies.map((cookie) => cookie.split(';').first).join('; ');
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_cookieKey, cookieHeader);
    }
    handler.next(response);
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_cookieKey);
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
