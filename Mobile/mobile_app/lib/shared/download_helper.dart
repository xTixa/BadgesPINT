import 'package:flutter/foundation.dart';
import 'package:universal_html/html.dart' as html;

class DownloadHelper {
  static bool savePdf(Uint8List bytes, String fileName) {
    if (!kIsWeb) return false;

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
