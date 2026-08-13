import CryptoJS from "crypto-js";

const SECRET = process.env.ENCRYPTION_SECRET || "default_super_secret_key_32_bytes_long_12345";

/**
 * Encrypt sensitive user data (e.g. Gemini Studio API key) before storage in DB
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return "";
  return CryptoJS.AES.encrypt(plainText, SECRET).toString();
}

/**
 * Decrypt sensitive user data only on backend when making AI API calls
 */
export function decryptSecret(cipherText: string): string {
  if (!cipherText) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("Failed to decrypt secret:", err);
    return "";
  }
}
