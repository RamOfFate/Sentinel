import { VaultGuard } from "@/components/auth/vault-gaurd";

export default function Records() {
  return (
    <VaultGuard>
      <p>Records</p>
    </VaultGuard>
  );
}
