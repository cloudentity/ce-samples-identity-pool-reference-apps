 const authConfig = {
      // Basic ACP authorization flow configs:
      domain: 'localhost:8443', // e.g. 'example.authz.cloudentity.io' (domain only, without 'https://' prefix)
      tenantId: 'default', // If using ACP SaaS, this is generally in the subdomain of your ACP SaaS URL. For local ACP, value is 'default'
      authorizationServerId: 'admin', // This is generally the name of the workspace you created the OAuth application in.
      // NOTE: authorizationServerId value must be 'admin' to enable admin views/actions!
      clientId: '****your-client-id-here****', // Find this value by viewing the details of your OAuth application
      redirectUri: 'http://localhost:3000/', // Make sure to add this exact value (including trailing slash) to the 'redirect_uri' list of your OAuth application settings
      scopes: ['profile', 'email', 'openid'], // 'revoke_tokens' scope must be present for 'logout' action to revoke token. Without it, token will only be deleted from browser's local storage.
      responseType: ['code'],
      accessTokenName: 'identity_demo_access_token',
      idTokenName: 'identity_demo_id_token',
      loginHintEnabled: true,

      childOrgSchemaId: '****your-schema-id-here****',
      superadminOrgId: 'demoadmin',
      b2borganizationGroupLabel: 'demogroup',

      env: 'dev',
      mockAccessTokenData: {org: 'demoadmin', identity_role: 'superadmin'},
      mockPermissions: ['read', 'write', 'copy', 'delete'],
      hierarchicalPoolList: false
  };

 export default authConfig;
