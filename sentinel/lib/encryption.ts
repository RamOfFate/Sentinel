const ALGO = "AES-GCM";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function encryptData(
  plaintext: string,
  masterKey: CryptoKey,
): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: ALGO, iv },
    masterKey,
    encoder.encode(plaintext),
  );

  const ivBase64 = btoa(String.fromCharCode(...iv));
  const cipherBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encryptedBuffer)),
  );

  return `${ivBase64}.${cipherBase64}`;
}

export async function decryptData(
  encryptedString: string,
  masterKey: CryptoKey,
): Promise<string> {
  try {
    const [ivBase64, cipherBase64] = encryptedString.split(".");

    const iv = new Uint8Array(
      atob(ivBase64)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );
    const ciphertext = new Uint8Array(
      atob(cipherBase64)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: ALGO, iv },
      masterKey,
      ciphertext,
    );

    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error(
      "DECRYPTION_FAILED: Likely wrong key or tampered data.",
      error,
    );
    throw new Error("Could not decrypt data.");
  }
}
