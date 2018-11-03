import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  // Url of the Identity Provider
  issuer: 'http://localhost:5000',

  // URL of the SPA to redirect the user to after login
  redirectUri: `${window.location.origin}/index.html`,

  // URL to be used for the silent refresh callback redirect
  silentRefreshRedirectUri: `${window.location.origin}/silent-refresh.html`,

  // The SPA's id. The SPA is registerd with this id at the auth-server
  clientId: 'implicit',

  // set the scope for the permissions the client should request
  scope: 'openid profile email api',
};
