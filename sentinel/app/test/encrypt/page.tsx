"use client";

import { VaultGuard } from "@/components/auth/vault-gaurd";
import { useSecurity } from "@/context/security-context";
import { encryptData, decryptData } from "@/lib/encryption";
import { useEffect } from "react";

export default function Encrypt() {
  const { masterKey } = useSecurity();

  useEffect(() => {
    const runCryptoTest = async () => {
      if (!masterKey) return;

      console.log("--- 🛡️ SENTINEL CRYPTO TEST START ---");

      const originalData =
        "Agent identity: Arthur Pendergast. Location: Sector 7.";
      console.log("ORIGINAL:", originalData);

      const encrypted = await encryptData(originalData, masterKey);
      console.log("ENCRYPTED (Stored in DB):", encrypted);

      const decrypted = await decryptData(encrypted, masterKey);
      console.log("DECRYPTED (Back to life):", decrypted);

      if (originalData === decrypted) {
        console.log("✅ SUCCESS: Data integrity verified.");
      } else {
        console.error("❌ FAILURE: Data mismatch!");
      }

      console.log("--- 🛡️ TEST END ---");
    };

    runCryptoTest();
  }, [masterKey]);
  return (
    <VaultGuard>
      <p>encrypt</p>
    </VaultGuard>
  );
}
