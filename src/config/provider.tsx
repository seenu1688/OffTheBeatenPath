import { OAuthUserConfig, OAuthConfig } from 'next-auth/providers';
import qs from 'qs';

export interface SalesforceProfile extends Record<string, any> {
  sub: string;
  nickname: string;
  email: string;
  picture: string;
}

export function Salesforce<P extends SalesforceProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  const { issuer = process.env.AUTH_SALESFORCE_ISSUER } = options;

  var query = qs.stringify({
    scope: 'id refresh_token offline_access',
  });

  return {
    id: 'salesforce',
    name: 'Salesforce',
    type: 'oauth',
    authorization: `${issuer}/services/oauth2/authorize?display=page&${query}`,
    token: `${issuer}/services/oauth2/token`,
    userinfo: `${issuer}/services/oauth2/userinfo`,
    profile(profile) {
      return {
        id: profile.user_id,
        ...profile,
      };
    },
  };
}
