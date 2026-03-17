"use client";

import { Cog, Github, LogOutIcon, User, User2, User2Icon } from "lucide-react";
import { DynamicBreadcrumb } from "./dynamic-breadcrumb";
import { Avatar, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarTrigger } from "./ui/sidebar";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export default function Header() {
  const { status, data } = useSession();
  return (
    <div className="border-b border-border w-full p-2 px-4 flex items-center justify-between sticky top-0 bg-background">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <DynamicBreadcrumb />
      </div>
      {status === "authenticated" ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full flex items-center justify-center w-8 h-8 hover:bg-accent cursor-pointer">
            <Avatar>
              <AvatarImage
                src="https://github.com/ramoffate.png"
                alt="RamOfFate"
              />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={"select-none"}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className={"text-primary truncate"}>
                {data?.user?.name || "username"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={"hover:bg-border"}
                render={<Link href={"/settings"} />}
              >
                <Cog />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Github />
                RamOfFate
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={"text-destructive"}
            >
              <LogOutIcon />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : status === "unauthenticated" ? (
        <Button variant="default" size="sm" render={<Link href="/login" />}>
          Sign In
        </Button>
      ) : (
        <Skeleton className="rounded-full h-8 w-8" />
      )}
    </div>
  );
}
