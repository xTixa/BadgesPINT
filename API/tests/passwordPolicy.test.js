import { test } from "node:test";
import assert from "node:assert/strict";
import { getPasswordPolicyError } from "../src/utils/passwordPolicy.js";

test("rejeita password vazia ou undefined", () => {
  assert.ok(getPasswordPolicyError(""));
  assert.ok(getPasswordPolicyError(undefined));
});

test("rejeita password com menos de 8 caracteres", () => {
  assert.ok(getPasswordPolicyError("abc123"));
});

test("rejeita password só com letras", () => {
  assert.ok(getPasswordPolicyError("abcdefgh"));
});

test("rejeita password só com números", () => {
  assert.ok(getPasswordPolicyError("12345678"));
});

test("aceita password com pelo menos 8 caracteres, uma letra e um número", () => {
  assert.equal(getPasswordPolicyError("abcd1234"), null);
});
