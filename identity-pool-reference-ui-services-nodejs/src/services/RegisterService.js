'use strict';

const AcpApiService = require('./api/AcpApiService');
const ErrorService = require('./utils/ErrorService');

class RegisterService {

  registerUser (serverToken, data) {
    return AcpApiService.createUser(serverToken, data)
      .then(registerUserRes => {
        return Promise.resolve(registerUserRes?.data);
      })
      .catch(err => ErrorService.handleAcpApiError(err));
  }
}

module.exports = new RegisterService();
