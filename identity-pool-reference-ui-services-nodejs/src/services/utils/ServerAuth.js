'use strict';

const { ClientCredentials } = require('simple-oauth2');
const jwt_decode = require('jwt-decode');

const acpTokenBaseUrl = `https://${process.env.ACP_HOST}${process.env.ACP_PORT ? ':' + process.env.ACP_PORT : ''}`;

const acpAdminConfig = {
  client: {
    id: process.env.ADMIN_OAUTH_CLIENT_ID,
    secret: process.env.ADMIN_OAUTH_CLIENT_SECRET
  },
  auth: {
    tokenHost: acpTokenBaseUrl,
    tokenPath: `/${process.env.ACP_TENANT_ID}${process.env.ADMIN_OAUTH_TOKEN_PATH}`
  }
};

const acpSystemConfig = {
  client: {
    id: process.env.SYSTEM_OAUTH_CLIENT_ID,
    secret: process.env.SYSTEM_OAUTH_CLIENT_SECRET
  },
  auth: {
    tokenHost: acpTokenBaseUrl,
    tokenPath: `/${process.env.ACP_TENANT_ID}${process.env.SYSTEM_OAUTH_TOKEN_PATH}`
  }
};

const acpUserConfig = {
  client: {
    id: process.env.USER_OAUTH_CLIENT_ID,
    secret: process.env.USER_OAUTH_CLIENT_SECRET
  },
  auth: {
    tokenHost: acpTokenBaseUrl,
    tokenPath: `/${process.env.ACP_TENANT_ID}${process.env.USER_OAUTH_TOKEN_PATH}`
  }
};

let currentAdminAccessToken;
let currentSystemAccessToken;
let currentUserAccessToken;

class ServerAuth {

  // Admin server OAuth application, for performing profile actions on behalf of non-admin client
  setServerAdminAccessToken () {
    const scopes = '';
    this._setServerAccessToken('Admin', acpAdminConfig, scopes, currentAdminAccessToken);
  }

  getServerAdminAccessToken () {
    return currentAdminAccessToken;
  }

  // System server OAuth application, for performing credentials-related actions on behalf of non-admin client
  setServerSystemAccessToken () {
    const scopes = 'identity manage_logins';
    this._setServerAccessToken('System', acpSystemConfig, scopes, currentSystemAccessToken);
  }

  getServerSystemAccessToken () {
    return currentSystemAccessToken;
  }

  // Non-admin server OAuth application in same workspace as frontend OAuth application, for introspect token flow
  setServerUserAccessToken () {
    const scopes = 'introspect_tokens';
    this._setServerAccessToken('User', acpUserConfig, scopes, currentUserAccessToken);
  }

  getServerUserAccessToken () {
    return currentUserAccessToken;
  }

  checkServerAuth () {
    const expiresWithinSeconds = (exp, seconds) => exp - Math.floor(Date.now()/1000) < seconds;

    if (currentAdminAccessToken) {
      const decodedAdminToken = jwt_decode(currentAdminAccessToken);
      if (decodedAdminToken.exp && expiresWithinSeconds(decodedAdminToken.exp, 180)) {
        this.setServerAdminAccessToken();
      }
    }
    if (currentSystemAccessToken) {
      const decodedSystemToken = jwt_decode(currentAdminAccessToken);
      if (decodedSystemToken.exp && expiresWithinSeconds(decodedSystemToken.exp, 180)) {
        this.setServerSystemAccessToken();
      }
    }
    if (currentUserAccessToken) {
      const decodedUserToken = jwt_decode(currentUserAccessToken);
      if (decodedUserToken.exp && expiresWithinSeconds(decodedUserToken.exp, 180)) {
        this.setServerUserAccessToken();
      }
    }
  }

  async _setServerAccessToken (clientType, config, scopes, currentToken) {
    const client = new ClientCredentials(config);

    const tokenParams = {
      scope: scopes,
    };

    try {
      const accessToken = await client.getToken(tokenParams);
      if (clientType === 'Admin') { currentAdminAccessToken = accessToken?.token?.access_token || null; }
      if (clientType === 'System') { currentSystemAccessToken = accessToken?.token?.access_token || null; }
      if (clientType === 'User') { currentUserAccessToken = accessToken?.token?.access_token || null; }
    } catch (error) {
      console.log(`Server ${clientType} Access Token error:`, error.message);
    }
  }
}

module.exports = new ServerAuth();
