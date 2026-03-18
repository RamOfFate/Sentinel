import { VaultGuard } from "@/components/auth/vault-gaurd";
import Image from "next/image";

export default function Home() {
  return (
    <VaultGuard>
      <p>Home</p>
    </VaultGuard>
  );
}
