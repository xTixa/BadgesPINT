import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateBase64Bytes, isTrustedCloudinaryUrl, detectFileFormat } from "../src/controllers/evidenceController.js";

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

test("detectFileFormat reconhece um PNG pelos magic bytes", () => {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  assert.equal(detectFileFormat(pngHeader.toString("base64")), "png");
});

test("detectFileFormat reconhece um JPEG pelos magic bytes", () => {
  const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
  assert.equal(detectFileFormat(jpegHeader.toString("base64")), "jpg");
});

test("detectFileFormat reconhece um PDF pelos magic bytes", () => {
  const pdfHeader = Buffer.from("%PDF-1.7\n%âãÏÓ");
  assert.equal(detectFileFormat(pdfHeader.toString("base64")), "pdf");
});

test("detectFileFormat reconhece um WEBP pelos magic bytes", () => {
  const webpHeader = Buffer.concat([
    Buffer.from("RIFF"),
    Buffer.from([0, 0, 0, 0]),
    Buffer.from("WEBP"),
  ]);
  assert.equal(detectFileFormat(webpHeader.toString("base64")), "webp");
});

test("detectFileFormat rejeita conteúdo que não corresponde a nenhum formato aceite (ex.: extensão falsificada)", () => {
  const fakeImage = Buffer.from("<script>alert(1)</script>");
  assert.equal(detectFileFormat(fakeImage.toString("base64")), null);
});

test("detectFileFormat ignora o prefixo de data URI", () => {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  assert.equal(detectFileFormat(`data:image/png;base64,${pngHeader.toString("base64")}`), "png");
});
