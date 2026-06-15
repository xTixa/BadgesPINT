import 'package:flutter/foundation.dart';
import 'package:file_picker/file_picker.dart';
import 'package:universal_html/html.dart' as html;

class DownloadHelper {
  static Future<bool> savePdf(Uint8List bytes, String fileName) async {
    if (!kIsWeb) {
      final path = await FilePicker.platform.saveFile(
        dialogTitle: 'Guardar certificado',
        fileName: fileName,
        type: FileType.custom,
        allowedExtensions: <String>['pdf'],
        bytes: bytes,
      );
      return path != null;
    }

    final blob = html.Blob(<dynamic>[bytes], 'application/pdf');
    final url = html.Url.createObjectUrlFromBlob(blob);

    final anchor = html.AnchorElement(href: url)
      ..download = fileName
      ..style.display = 'none';

    html.document.body?.append(anchor);
    anchor.click();
    anchor.remove();
    html.Url.revokeObjectUrl(url);

    return true;
  }
}
