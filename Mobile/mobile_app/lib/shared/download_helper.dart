import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:universal_html/html.dart' as html;

class DownloadHelper {
  static Future<bool> savePdf(Uint8List bytes, String fileName) async {
    try {
      if (kIsWeb) {
        _webDownload(bytes, fileName);
        return true;
      }

      // Try SAF file-picker dialog (lets the user choose where to save).
      final pickerPath = await FilePicker.platform.saveFile(
        dialogTitle: 'Guardar certificado',
        fileName: fileName,
        type: FileType.custom,
        allowedExtensions: <String>['pdf'],
        bytes: bytes,
      );
      if (pickerPath != null) return true;

      // Fallback: save to app documents directory (no dialog needed).
      final dir = await getApplicationDocumentsDirectory();
      await File('${dir.path}/$fileName').writeAsBytes(bytes, flush: true);
      return true;
    } catch (_) {
      return false;
    }
  }

  static void _webDownload(Uint8List bytes, String fileName) {
    final blob = html.Blob(<dynamic>[bytes], 'application/pdf');
    final url = html.Url.createObjectUrlFromBlob(blob);
    final anchor = html.AnchorElement(href: url)
      ..download = fileName
      ..style.display = 'none';
    html.document.body?.append(anchor);
    anchor.click();
    anchor.remove();
    html.Url.revokeObjectUrl(url);
  }
}
