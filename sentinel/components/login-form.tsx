"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { authSchema } from "@/lib/validations/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const validation = authSchema.safeParse({ email, password });
      if (!validation.success) {
        setError(validation.error.issues[0].message);
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        setError("Credentials not recognized");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("CONENCTION_LOST: Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 px-2 select-none">
      <CardHeader>
        <CardTitle className="text-primary">Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        {error && (
          <div className="mb-4 p-2 bg-red-950 border border-red-500 text-red-500 text-xs uppercase animate-pulse">
            [!] {error}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                disabled={loading}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field>
              <div className="flex justify-between">
                <FieldLabel>Password</FieldLabel>
                <Link
                  href="forgot-password"
                  className="hover:underline underline-offset-4"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                type="password"
                id="password"
                placeholder="••••••••"
                disabled={loading}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field>
              <Button type="submit" disabled={loading}>
                {loading ? "Loading..." : "Login"}
              </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <Link href="register">Sign up</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
