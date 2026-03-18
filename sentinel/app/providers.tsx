"use client";

import { SecurityProvider } from "@/context/security-context";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SecurityProvider>{children}</SecurityProvider>
    </SessionProvider>
  );
}
