import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Paperclip, SquareUser } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sentinel",
  description: "A comprehensive, dossier-style PRM",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const savedState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen = savedState === "true";
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <ThemeProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <Sidebar collapsible="icon">
              <SidebarHeader className="flex flex-row items-center px-4 py-4 text-sm text-primary">
                <Paperclip className="shrink-0" size={16} />
                <span className=" select-none group-data-[collapsible=icon]:hidden ">
                  Sentinel
                </span>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className="cursor-pointer"
                        render={<Link href={"/"} />}
                      >
                        <LayoutDashboard /> Dashboard
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className="cursor-pointer"
                        render={<Link href={"/contacts"} />}
                      >
                        <SquareUser /> Contacts
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <ThemeToggle />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </Sidebar>
            <div className="w-full">
              <Header />
              <main>{children}</main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
