'use strict';

const R = require('ramda');
const AcpApiService = require('./api/AcpApiService');
const ErrorService = require('./utils/ErrorService');

class ProfileService {

  getUser (serverToken, userId) {
    return AcpApiService.getUser(serverToken, userId)
      .then(getUserRes => {
        return Promise.resolve(this._processUserDataRes(getUserRes?.data));
      })
      .catch(err => ErrorService.handleAcpApiError(err));
  }

  updateUser (serverToken, userId, data) {
    return AcpApiService.updateUser(serverToken, userId, data)
      .then(updateUserRes => {
        return Promise.resolve(this._processUserDataRes(updateUserRes?.data));
      })
      .catch(err => ErrorService.handleAcpApiError(err));
  }

  _processUserDataRes (userRes) {
    if (!userRes) {
      return {};
    }

    const pickFields = R.pick(['id', 'status', 'payload', 'metadata', 'created_at', 'updated_at'], userRes);
    const identifiers = (userRes.identifiers || []).map(i => R.pick(['identifier', 'type'], i));

    return {...pickFields, ...{identifiers}};
  }
}

module.exports = new ProfileService();
