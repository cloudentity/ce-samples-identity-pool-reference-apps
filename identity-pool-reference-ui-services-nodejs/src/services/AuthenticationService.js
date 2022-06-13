'use strict';

const R = require('ramda');
const AcpApiService = require('./api/AcpApiService');
const ErrorService = require('./utils/ErrorService');

class AuthenticationService {

  verifyPassword (serverToken, userIdentifier, password) {
    const verifyPasswordData = {
      identifier: userIdentifier,
      password: password
    };

    return AcpApiService.verifyPassword(serverToken, verifyPasswordData)
      .then(verifyPasswordRes => {
        return Promise.resolve(verifyPasswordRes?.data)
      })
      .catch(err => ErrorService.handleAcpApiError(err));
  }

  acceptLogin (serverToken, loginId, loginState, userIdentifier, userUuid) {
    const acceptLoginData = {
      auth_time: (new Date()).toISOString(),
      subject: userIdentifier,
      login_state: loginState,
      authentication_context: {
        user: {
          id: userUuid,
        }
      }
    };

    return AcpApiService.acceptLogin(serverToken, loginId, acceptLoginData)
      .then(acceptLoginRes => {
        return Promise.resolve(acceptLoginRes?.data)
      })
      .catch(err => ErrorService.handleAcpApiError(err));
  }
}

module.exports = new AuthenticationService();
