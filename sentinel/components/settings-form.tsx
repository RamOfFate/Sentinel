"use client";

import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { nameSchema } from "@/lib/validations/auth";

export default function SettingsForm() {
  const { data, update } = useSession();
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const validation = nameSchema.safeParse({ name: newName });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/update-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      const data = await res.json();

      if (res.ok) {
        await update({ name: newName });
        setNewName("");
        setError(null);
        router.refresh();
      } else {
        setError(data.error || "UPDATE_FAILED");
      }
    } catch (err) {
      setError("CONNECTION_LOST: Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="py-8 select-none">
      <CardHeader>
        <div className="px-2">
          <CardTitle className="text-primary tracking-widest">
            Settings
          </CardTitle>
          <CardDescription>Modify your user settings</CardDescription>
        </div>
        {error && (
          <div className="mt-4 p-2 bg-red-950 border border-red-500 text-red-500 text-xs uppercase animate-pulse">
            [!] {error}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateName} className="px-2 pb-4">
          <FieldGroup>
            <Field>
              <FieldLabel>
                Current Alias:
                <span className="text-primary">{data?.user?.name}</span>
              </FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Enter new codename..."
                value={newName}
                disabled={loading}
                onChange={(e) => setNewName(e.target.value)}
              />
            </Field>
            <Field>
              <div className="flex justify-end w-full">
                <Button type="submit" disabled={loading || !newName}>
                  {loading ? "UPDATING..." : "Save Changes"}
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="border-t border-red-900/30 mt-4 pt-6">
        <div className="flex justify-end w-full px-2">
          <Button
            variant={"destructive"}
            size="sm"
            className="opacity-50 hover:opacity-100"
          >
            Terminate Account
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
