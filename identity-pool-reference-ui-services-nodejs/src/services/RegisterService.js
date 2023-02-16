'use strict';

const AcpApiService = require('./api/AcpApiService');
const ErrorService = require('./utils/ErrorService');

class RegisterService {

  registerUser (serverToken, data) {
    return AcpApiService.createUser(serverToken, data)
      .then(registerUserRes => {

        if (!registerUserRes?.data?.id) {
          return Promise.reject({
            status_code: 400,
            error: 'bad request',
            details: 'User identifier not found'
          });
        }

        const sendActivationMessagePayload = {
          address: data?.identifiers[0]?.identifier
        };

        return AcpApiService.sendActivationMessage(serverToken, registerUserRes?.data?.id, sendActivationMessagePayload)
          .then(sendActivationMessageRes => {
            return Promise.resolve(sendActivationMessageRes?.data);
          })
          .catch(sendActivationMessageErr => ErrorService.handleAcpApiError(sendActivationMessageErr));
      })
      .catch(registerUserErr => ErrorService.handleAcpApiError(registerUserErr));
  }
}

module.exports = new RegisterService();
