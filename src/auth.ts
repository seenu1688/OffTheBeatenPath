import NextAuth from 'next-auth';
import { OAuthUserConfig, OAuthConfig } from 'next-auth/providers';

export interface SalesforceProfile extends Record<string, any> {
  sub: string;
  nickname: string;
  email: string;
  picture: string;
}

function Salesforce<P extends SalesforceProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  const { issuer = 'https://test.salesforce.com' } = options;

  return {
    id: 'salesforce',
    name: 'Salesforce',
    type: 'oauth',
    authorization: `${issuer}/services/oauth2/authorize?display=page`,
    token: `${issuer}/services/oauth2/token`,
    userinfo: `${issuer}/services/oauth2/userinfo`,
    profile(profile) {
      return {
        id: profile.user_id,
        name: null,
        email: null,
        image: profile.picture,
      };
    },
    options,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Salesforce],
  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt(rest) {
      console.log(rest);

      return rest;
    },
    signIn: async (...rest) => {
      console.log(rest);

      return true;
    },
    // async session({ session, token }) {
    //   return { ...session, user: token };
    // },
  },
});
