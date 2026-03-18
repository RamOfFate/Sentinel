"use client";

import { useSecurity } from "@/context/security-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function VaultGuard({ children }: { children: React.ReactNode }) {
  const { masterKey, isLocked } = useSecurity();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLocked) {
      router.replace("/auth/lock");
    } else {
      setIsAuthorized(true);
    }
  }, [isLocked, router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background font-mono text-xs animate-pulse">
        [VALIDATING_VAULT_INTEGRITY...]
      </div>
    );
  }

  return <>{children}</>;
}
