#!/usr/bin/env node
// Interop test: encrypt using backend algorithm (Node crypto) and decrypt using frontend (crypto-js), and vice-versa.
// Usage: set env Decryptkey to the shared 16-byte key, then run:
//   Decryptkey=your16bytekey node tests/interop-test.js

const crypto = require("crypto");
const CryptoJS = require("crypto-js");

const secret = process.env.Decryptkey || process.env.DECRYPTKEY;
if (!secret) {
  console.error(
    "ERROR: set environment variable Decryptkey (the shared 16-byte key)",
  );
  process.exit(1);
}
if (secret.length !== 16)
  console.warn(
    "Warning: key length is not 16 bytes (backend expects 16 bytes for AES-128-CBC)",
  );

const ivBuffer = Buffer.alloc(16, 0);
const ivWordArray = CryptoJS.lib.WordArray.create(new Uint8Array(16));

function backendEncrypt(obj, keyStr) {
  const key = Buffer.from(keyStr, "utf8");
  const cipher = crypto.createCipheriv("aes-128-cbc", key, ivBuffer);
  let enc = cipher.update(JSON.stringify(obj), "utf8", "base64");
  enc += cipher.final("base64");
  return enc;
}

function backendDecrypt(base64Str, keyStr) {
  const key = Buffer.from(keyStr, "utf8");
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, ivBuffer);
  let dec = decipher.update(base64Str, "base64", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

function frontendEncrypt(obj, keyStr) {
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const message = typeof obj === "string" ? obj : JSON.stringify(obj);
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(message),
    key,
    {
      iv: ivWordArray,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}

function frontendDecrypt(base64Str, keyStr) {
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(base64Str),
  });
  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

(async () => {
  const sample = { hello: "world", n: 42 };
  console.log("Sample object:", sample);

  // Backend -> Frontend
  const encFromBackend = backendEncrypt(sample, secret);
  console.log("\nEncrypted by backend (base64):", encFromBackend);
  const decByFrontend = frontendDecrypt(encFromBackend, secret);
  console.log("Frontend decrypted (string):", decByFrontend);
  try {
    console.log("Parsed JSON:", JSON.parse(decByFrontend));
  } catch (e) {
    console.log("Could not parse JSON from frontend decryption");
  }

  // Frontend -> Backend
  const encFromFrontend = frontendEncrypt(sample, secret);
  console.log("\nEncrypted by frontend (base64):", encFromFrontend);
  const decByBackend = backendDecrypt(encFromFrontend, secret);
  console.log("Backend decrypted (string):", decByBackend);
  try {
    console.log("Parsed JSON:", JSON.parse(decByBackend));
  } catch (e) {
    console.log("Could not parse JSON from backend decryption");
  }

  // Result checks
  const ok1 = decByFrontend === JSON.stringify(sample);
  const ok2 = decByBackend === JSON.stringify(sample);
  console.log("\nResults:");
  console.log(" Backend->Frontend match:", ok1);
  console.log(" Frontend->Backend match:", ok2);

  if (!ok1 || !ok2) process.exit(2);
  process.exit(0);
})();
