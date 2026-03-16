"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <SidebarMenuButton
      className="cursor-pointer"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {mounted ? theme === "dark" ? <Sun /> : <Moon /> : <Sun />}
      Theme Toggle
    </SidebarMenuButton>
  );
}
