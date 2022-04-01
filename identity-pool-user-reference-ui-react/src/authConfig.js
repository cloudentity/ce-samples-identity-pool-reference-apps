 const authConfig = {
     domain: 'localhost:8443', // e.g. 'example.authz.cloudentity.io.' Recommended; always generates URLs with 'https' protocol.
      // baseUrl: optional alternative to 'domain.' Protocol required, e.g. 'https://example.demo.cloudentity.com.'
      // In situations where protocol may dynamically resolve to 'http' rather than 'https' (for example in dev mode), use 'baseUrl' rather than 'domain'.
      tenantId: 'default', // This is generally in the subdomain of your Cloudentity ACP URL
      authorizationServerId: 'admin', // This is generally the name of the workspace you created the OAuth application in.
      clientId: 'admin',
      redirectUri: 'http://localhost:3000/',
      scopes: ['profile', 'email', 'openid'], // 'revoke_tokens' scope must be present for 'logout' action to revoke token! Without it, token will only be deleted from browser's local storage.
      accessTokenName: 'identity_demo_access_token', // optional; defaults to '{tenantId}_{authorizationServerId}_access_token'
      idTokenName: 'identity_demo_id_token', // optional; defaults to '{tenantId}_{authorizationServerId}_id_token'
  };

 export default authConfig;
