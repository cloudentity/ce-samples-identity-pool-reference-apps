'use strict';

const R = require('ramda');
const jwt_decode = require('jwt-decode');
const AcpApiService = require('../api/AcpApiService');
const ErrorService = require('./ErrorService');
const ipUserUuidKey = process.env.IDENTITY_POOL_USER_UUID_KEY;

class TokenService {

  decodeAccessToken (req) {
    if (req) {
      const userAccessTokenRaw = req.headers?.authorization?.split(' ')[1];
      return userAccessTokenRaw && userAccessTokenRaw !== 'null' ? jwt_decode(userAccessTokenRaw) : {};
    }
    return {};
  }

  validateClientAccessToken (req, serverToken, requiredScopes = []) {
    const introspectTokenRaw = req.headers?.authorization?.split(' ')[1];

    if (!introspectTokenRaw || introspectTokenRaw === 'null') {
      return Promise.reject({
        status_code: 401,
        error: 'access_denied',
        details: 'access token is missing'
      });
    }

    return AcpApiService.introspectToken(introspectTokenRaw, serverToken)
      .then(introspectTokenRes => {
        if (!introspectTokenRes.data?.active) {
          return Promise.reject({
            status_code: 401,
            error: 'access_denied',
            details: 'access token is expired or invalid'
          });
        }

        if ((introspectTokenRes.data || {})[ipUserUuidKey]) {
          const availableScopes = (introspectTokenRes.data.scope || '').split(' ');
          const missingScopes = R.without(availableScopes, requiredScopes);

          if (missingScopes.length) {
            return Promise.reject({
              status_code: 403,
              error: 'access_denied',
              details: `the following scopes are required: [${missingScopes.join(', ')}]`
            });
          }

          return Promise.resolve(introspectTokenRes.data);
        }

        return Promise.reject({
          status_code: 400,
          error: 'bad request',
          details: `expected access token parameter with key '${ipUserUuidKey}'`
        });
      })
      .catch(err => ErrorService.handleAcpApiError(err));
  }
}

module.exports = new TokenService();
