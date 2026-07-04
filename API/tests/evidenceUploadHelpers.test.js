import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateBase64Bytes, isTrustedCloudinaryUrl } from "../src/controllers/evidenceController.js";

test("estimateBase64Bytes calcula o tamanho real de uma string base64 simples", () => {
  const original = "hello world!"; // 12 bytes
  const base64 = Buffer.from(original).toString("base64");
  assert.equal(estimateBase64Bytes(base64), 12);
});

test("estimateBase64Bytes ignora o prefixo de data URI", () => {
  const original = "abc"; // 3 bytes
  const base64 = Buffer.from(original).toString("base64");
  assert.equal(estimateBase64Bytes(`data:image/png;base64,${base64}`), 3);
});

test("isTrustedCloudinaryUrl aceita um URL do cloud name configurado", () => {
  process.env.CLOUDINARY_CLOUD_NAME = "meu-cloud";
  assert.equal(
    isTrustedCloudinaryUrl("https://res.cloudinary.com/meu-cloud/image/upload/v1/evidencias/foo.png"),
    true
  );
});

test("isTrustedCloudinaryUrl rejeita um domínio externo", () => {
  process.env.CLOUDINARY_CLOUD_NAME = "meu-cloud";
  assert.equal(isTrustedCloudinaryUrl("https://evil.example.com/foo.png"), false);
});

test("isTrustedCloudinaryUrl rejeita URL de outro cloud name", () => {
  process.env.CLOUDINARY_CLOUD_NAME = "meu-cloud";
  assert.equal(
    isTrustedCloudinaryUrl("https://res.cloudinary.com/outro-cloud/image/upload/v1/foo.png"),
    false
  );
});

test("isTrustedCloudinaryUrl rejeita URL inválido", () => {
  process.env.CLOUDINARY_CLOUD_NAME = "meu-cloud";
  assert.equal(isTrustedCloudinaryUrl("nao-e-um-url"), false);
});
