'use strict';

const express = require('express');
const router = express.Router();
const ServerAuth = require('../services/utils/ServerAuth');
const SchemaService = require('../services/SchemaService');
const ErrorService = require('../services/utils/ErrorService');

router.get('/', (req, res) => {
  SchemaService.getUserSchema(ServerAuth.getServerAdminAccessToken())
    .then(userSchemaRes => {
      res.status(200);
      res.send(JSON.stringify(userSchemaRes));
    })
    .catch(err => {
      ErrorService.sendErrorResponse(err, res);
    });
});

module.exports = router;
