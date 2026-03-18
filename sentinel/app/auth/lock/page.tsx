"use client";

import { useState } from "react";
import { useSecurity } from "@/context/security-context";
import { useSession, signIn, signOut } from "next-auth/react"; // Added signIn
import { derivedMasterKey } from "@/lib/crypto";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react"; // Optional: for a loading state
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function LockPage() {
  const { data: session } = useSession();
  const { setMasterKey } = useSecurity();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!session?.user?.email || !session?.user?.salt) {
      setIsLoading(false);
      return setError("Session Expired. Please Login again.");
    }

    try {
      const result = await signIn("credentials", {
        email: session.user.email,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setIsLoading(false);
        return setError("Invalid Vault Password");
      }

      const key = await derivedMasterKey(password, session.user.salt);

      setMasterKey(key);

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("UNEXPECTED_LOCK_ERROR:", err);
      setError("Vault Synchronization Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Card className="select-none">
        <CardHeader>
          <h1 className="text-xl font-mono text-destructive ">Data locked</h1>
          <p className="text-destructive">
            Security timeout or page refresh detected.
          </p>
          <CardAction>
            <ShieldAlert className="text-destructive" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Enter your password to re-derive your Master Key.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="••••••••"
                autoFocus
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
                className=""
              />
            </div>

            <Button
              className={"w-full"}
              variant={"default"}
              type="submit"
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlocking...
                </>
              ) : (
                "Unlock Data"
              )}
            </Button>
          </form>

          {error && (
            <p className="text-xs text-destructive font-mono text-center pt-3">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant={"outline"}
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full"
          >
            Exit Session Entirely
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
