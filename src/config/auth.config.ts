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
    redirect: async ({ url, baseUrl }) => {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/signin",
  },
  trustHost: true,
} satisfies NextAuthConfig;
