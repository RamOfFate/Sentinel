"use client";
import { VaultGuard } from "@/components/auth/vault-gaurd";

export default function Contacts() {
  return (
    <VaultGuard>
      <p>Contacts</p>
    </VaultGuard>
  );
}
