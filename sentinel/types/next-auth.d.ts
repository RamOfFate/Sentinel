import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      salt?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    salt?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    salt?: string;
  }
}
