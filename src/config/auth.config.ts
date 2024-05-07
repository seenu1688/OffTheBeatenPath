import { NextAuthConfig } from "next-auth";

import { Salesforce } from "./provider";

export const authConfig = {
  providers: [Salesforce],
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return { ...token, ...account };
      }

      return token;
    },
    async session({ session, token }) {
      return { ...session, ...token };
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
