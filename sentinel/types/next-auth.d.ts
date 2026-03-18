import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      salt?: string;
    } & DefaultSession["user"];
  }

  interface User {
    salt?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    salt?: string;
  }
}
