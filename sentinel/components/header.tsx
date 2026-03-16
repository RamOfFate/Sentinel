import { Github, LogOutIcon } from "lucide-react";
import { DynamicBreadcrumb } from "./dynamic-breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarTrigger } from "./ui/sidebar";

export default function Header() {
  return (
    <div className="border-b border-primary/20 w-full p-2 px-4 flex items-center justify-between sticky top-0 bg-background">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <DynamicBreadcrumb />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full flex items-center justify-center w-8 h-8 hover:bg-accent">
          <Avatar>
            <AvatarImage
              src="https://github.com/ramoffate.png"
              alt="RamOfFate"
            />
            <AvatarFallback>ROF</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Github />
              RamOfFate
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          //TODO: implement sign out
          <DropdownMenuItem>
            <LogOutIcon />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
