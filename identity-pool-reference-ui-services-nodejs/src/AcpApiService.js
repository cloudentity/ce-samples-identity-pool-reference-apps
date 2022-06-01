'use strict';

const axios = require('axios');
const qs = require('qs');

const acpBaseUrl = `https://${process.env.ACP_HOST}${process.env.ACP_PORT ? ':' + process.env.ACP_PORT : ''}`;
const acpApiPrefix = `/api/identity/${process.env.ACP_TENANT_ID}/${process.env.ACP_AUTHORIZATION_SERVER_ID}`;
const acpSystemApiPrefix = `/api/identity/${process.env.ACP_TENANT_ID}/system`;
const acpTokenIntrospectionUrl = `${process.env.USER_OAUTH_TOKEN_HOST}${process.env.USER_OAUTH_TOKEN_INTROSPECTION_PATH}`;
const ipId = process.env.IDENTITY_POOL_ID;

class AcpApiService {

  introspectToken (userToken, systemToken) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${systemToken}`
      },
      data: qs.stringify({token: userToken}),
      url: acpTokenIntrospectionUrl,
    };

    return axios(options);
  }

  getUser (systemToken, userId) {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${systemToken}`
      },
      url: `${acpBaseUrl}${acpApiPrefix}/pools/${ipId}/users/${userId}`,
    };

    return axios(options);
  }

  updateUser (systemToken, userId, data) {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${systemToken}`
      },
      data: data,
      url: `${acpBaseUrl}${acpApiPrefix}/pools/${ipId}/users/${userId}`,
    };

    return axios(options);
  }

  changeUserPassword (systemToken, userId, data) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${systemToken}`
      },
      data: data,
      url: `${acpBaseUrl}${acpSystemApiPrefix}/pools/${ipId}/users/${userId}/change_password`,
    };

    return axios(options);
  }
}

module.exports = new AcpApiService();
