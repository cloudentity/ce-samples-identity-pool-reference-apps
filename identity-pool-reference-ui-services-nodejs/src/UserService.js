'use strict';

const R = require('ramda');
const AcpApiService = require('./AcpApiService');
const ipUserUuidKey = process.env.IDENTITY_POOL_USER_UUID_KEY;

class UserService {

  getUser (systemToken, userId) {
    return AcpApiService.getUser(systemToken, userId)
      .then(getUserRes => {
        return Promise.resolve(this._processUserDataRes(getUserRes?.data));
      })
      .catch(err => {
        return Promise.reject({
          status_code: err.status_code || 500,
          error: err.error || 'internal server error',
          details: err.details || 'an unexpected error occured'
        });
      });
  }

  updateUser (systemToken, userId, data) {
    return AcpApiService.updateUser(systemToken, userId, data)
      .then(updateUserRes => {
        return Promise.resolve(this._processUserDataRes(updateUserRes?.data));
      })
      .catch(err => {
        return Promise.reject({
          status_code: err.status_code || 500,
          error: err.error || 'internal server error',
          details: err.details || 'an unexpected error occured'
        });
      });
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

module.exports = new UserService();
