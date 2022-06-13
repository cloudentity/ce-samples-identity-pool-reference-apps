'use strict';

const R = require('ramda');
const AcpApiService = require('./api/AcpApiService');
const ErrorService = require('./utils/ErrorService');

class SchemaService {

  getUserSchema (serverToken) {
    return AcpApiService.getUserSchema(serverToken)
      .then(userSchemaRes => {
        return Promise.resolve(this._processUserPayloadSchema(userSchemaRes?.data?.schema));
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
}

module.exports = new SchemaService();
