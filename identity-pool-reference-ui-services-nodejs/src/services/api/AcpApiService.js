'use strict';

const axios = require('axios');
const qs = require('qs');

const acpBaseUrl = `https://${process.env.ACP_HOST}${process.env.ACP_PORT ? ':' + process.env.ACP_PORT : ''}`;
const acpIpApiPrefix = `/api/identity/${process.env.ACP_TENANT_ID}/${process.env.ACP_AUTHORIZATION_SERVER_ID}`;
const acpIpSystemApiPrefix = `/api/identity/${process.env.ACP_TENANT_ID}/system`;
const acpTokenIntrospectionUrl = `${acpBaseUrl}/${process.env.ACP_TENANT_ID}${process.env.USER_OAUTH_TOKEN_INTROSPECTION_PATH}`;
const ipId = process.env.IDENTITY_POOL_ID;

class AcpApiService {

  introspectToken (userToken, serverToken) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${serverToken}`
      },
      data: qs.stringify({token: userToken}),
      url: acpTokenIntrospectionUrl,
    };

    return axios(options);
  }

  verifyPassword (serverToken, data) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serverToken}`
      },
      data: data,
      url: `${acpBaseUrl}${acpIpSystemApiPrefix}/pools/${ipId}/user/password/verify`,
    };

    return axios(options);
  }

  acceptLogin (serverToken, loginId, data) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serverToken}`
      },
      data: data,
      url: `${acpBaseUrl}/api/system/${process.env.ACP_TENANT_ID}/logins/${loginId}/accept`,
    };

    return axios(options);
  }

  getUserSchema (serverToken) {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serverToken}`
      },
      url: `${acpBaseUrl}${acpIpApiPrefix}/schemas/${process.env.USER_SCHEMA_ID}`
    };

    return axios(options);
  }

  createUser (serverToken, data) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serverToken}`
      },
      data: data,
      url: `${acpBaseUrl}${acpIpSystemApiPrefix}/pools/${ipId}/users`,
    };

    console.log(options);

    return axios(options);
  }

  getUser (serverToken, userId) {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serverToken}`
      },
      url: `${acpBaseUrl}${acpIpApiPrefix}/pools/${ipId}/users/${userId}`,
    };

    return axios(options);
  }

  updateUser (serverToken, userId, data) {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serverToken}`
      },
      data: data,
      url: `${acpBaseUrl}${acpIpApiPrefix}/pools/${ipId}/users/${userId}`,
    };

    return axios(options);
  }

  changeUserPassword (serverToken, userId, data) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serverToken}`
      },
      data: data,
      url: `${acpBaseUrl}${acpIpSystemApiPrefix}/pools/${ipId}/users/${userId}/change_password`,
    };

    return axios(options);
  }
}

module.exports = new AcpApiService();
