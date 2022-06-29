'use strict';

const AcpApiService = require('./api/AcpApiService');
const ErrorService = require('./utils/ErrorService');

class PasswordService {

  changeUserPassword (serverToken, userId, data) {
    return AcpApiService.changeUserPassword(serverToken, userId, data)
      .then(changePasswordRes => {
        return Promise.resolve(changePasswordRes?.data);
      })
      .catch(err => ErrorService.handleAcpApiError(err));
  }
}

module.exports = new PasswordService();
