# Configurar Firebase Cloud Messaging no iOS

O Android já está configurado (`android/app/google-services.json` existe no repositório).
O iOS **não tem** o ficheiro `GoogleService-Info.plist`, por isso o push via Firebase não
funciona em builds iOS. Estes passos não podem ser executados automaticamente — precisam
de acesso à consola Firebase do projeto `badges-pint`.

## Passos

1. Consola Firebase → projeto **badges-pint** → **Definições do projeto** → separador **Geral**.
2. Em "Os teus apps", clica em **Adicionar app** → escolhe **iOS**.
3. Bundle ID: usar o mesmo valor definido em `ios/Runner.xcodeproj` (procurar
   `PRODUCT_BUNDLE_IDENTIFIER`, tipicamente algo como `com.softinsa.badgespint`).
4. Descarrega o ficheiro **`GoogleService-Info.plist`** gerado.
5. Coloca o ficheiro em `Mobile/mobile_app/ios/Runner/GoogleService-Info.plist`
   (mesma pasta do `Info.plist` existente).
6. No Xcode (ou via `flutter build ios`), garante que o ficheiro está incluído no target
   `Runner` — se abrires o projeto no Xcode, arrasta o ficheiro para o grupo `Runner` e
   confirma "Copy items if needed" + target membership `Runner`.

## Configurar APNs (obrigatório para push em iOS)

O FCM no iOS depende de uma chave APNs (Apple Push Notification service) associada ao projeto Firebase:

1. [Apple Developer Portal](https://developer.apple.com/account) → **Certificates, Identifiers & Profiles**
   → **Keys** → criar uma nova chave com o serviço **Apple Push Notifications service (APNs)** ativado.
2. Descarregar o ficheiro `.p8` gerado (só é possível uma vez).
3. Consola Firebase → **Definições do projeto** → separador **Cloud Messaging** → secção
   **Configuração da app Apple** → **Carregar** a chave APNs, indicando o **Key ID** e o **Team ID**
   (visíveis no Apple Developer Portal).

## Verificação

Depois de configurado, correr a app num dispositivo/simulador iOS real (simuladores não
recebem push do APNs, é necessário dispositivo físico) e confirmar nos logs que
`FirebaseMessaging.instance.getToken()` devolve um token e que
`registerDeviceToken` (`lib/consultor/consultor_repository.dart`) consegue registá-lo
com sucesso no backend (`POST /api/notifications/device-token`).
