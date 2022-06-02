 const authConfig = {
      domain: 'localhost:8443', // e.g. 'example.authz.cloudentity.io' (domain only, without 'https://' prefix)
      tenantId: 'default', // If using ACP SaaS, this is generally in the subdomain of your ACP SaaS URL. For local ACP, value is 'default'
      authorizationServerId: 'login-demo', // This is generally the name of the workspace you created the OAuth application in.
      clientId: 'login-demo', // Find this value by viewing the details of your OAuth application
      redirectUri: 'http://localhost:3000/', // Make sure to add this exact value (including trailing slash) to the 'redirect_uri' list of your OAuth application settings
      scopes: ['profile', 'email', 'openid'], // 'revoke_tokens' scope must be present for 'logout' action to revoke token. Without it, token will only be deleted from browser's local storage.
      accessTokenName: 'identity_demo_access_token',
      idTokenName: 'identity_demo_id_token',
      nodeJsBackendEnabled: false, // Set to 'true' if 'identity-pool-reference-ui-services-nodejs' is set up and running. When set to 'false,' custom schema will not be fetched for self-update profile action.
      customLoginEnabled: false // Set to 'true' if 'identity-pool-reference-ui-authn-app-nodejs' is set up and running, and a custom IDP has been set up for your ACP workspace.
  };

 export default authConfig;
