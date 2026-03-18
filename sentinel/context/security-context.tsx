"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

interface SecurityContextType {
  masterKey: CryptoKey | null;
  setMasterKey: (key: CryptoKey | null) => void;
  isLocked: boolean;
  purgeKey: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined,
);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const purgeKey = useCallback(() => {
    setMasterKey(null);
    if (pathname !== "/login" && pathname !== "/register") {
      router.push("/auth/lock");
    }
  }, [pathname, router]);

  useEffect(() => {
    if (status === "unauthenticated") setMasterKey(null);
  }, [status]);

  useEffect(() => {
    if (!masterKey) return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(
        () => {
          console.warn("VAULT_AUTO_LOCKED: Inactivity detected.");
          purgeKey();
        },
        15 * 60 * 1000,
      );
    };

    const events = ["mousedown", "keydown", "touchstart", "mousemove"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timeout);
    };
  }, [masterKey, purgeKey]);

  return (
    <SecurityContext.Provider
      value={{ masterKey, setMasterKey, isLocked: !masterKey, purgeKey }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context)
    throw new Error("useSecurity must be used within a SecurityProvider");
  return context;
};
