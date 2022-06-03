'use strict';

const R = require('ramda');
const AcpApiService = require('./AcpApiService');
const ErrorService = require('./ErrorService');
const ipUserUuidKey = process.env.IDENTITY_POOL_USER_UUID_KEY;

class UserService {

  getUserSchema (systemToken) {
    return AcpApiService.getUserSchema(systemToken)
      .then(userSchemaRes => {
        return Promise.resolve(this._processUserPayloadSchema(userSchemaRes?.data?.schema));
      })
      .catch(err => ErrorService.handleAcpApiError(err));
  }

  getUser (systemToken, userId) {
    return AcpApiService.getUser(systemToken, userId)
      .then(getUserRes => {
        return Promise.resolve(this._processUserDataRes(getUserRes?.data));
      })
      .catch(err => ErrorService.handleAcpApiError(err));
  }

  updateUser (systemToken, userId, data) {
    return AcpApiService.updateUser(systemToken, userId, data)
      .then(updateUserRes => {
        return Promise.resolve(this._processUserDataRes(updateUserRes?.data));
      })
      .catch(err => ErrorService.handleAcpApiError(err));
  }

  changeUserPassword (systemToken, userId, data) {
    return AcpApiService.changeUserPassword(systemToken, userId, data)
      .then(changePasswordRes => {
        return Promise.resolve(changePasswordRes?.data);
      })
      .catch(err => ErrorService.handleAcpApiError(err));
  }

  _processUserPayloadSchema (schema) {
    const nonSystemSchemaProps = R.omit(['given_name', 'family_name', 'name'], schema.properties || {});
    const reqdFields = schema.required || [];
    let finalFields = [];
    for (const prop in nonSystemSchemaProps) {
      finalFields.push({
        ...nonSystemSchemaProps[prop],
        ...{
          id: prop,
          required: reqdFields.indexOf(prop) > -1
        }
      });
    }

    return finalFields;
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
