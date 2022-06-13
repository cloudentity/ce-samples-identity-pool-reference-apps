'use strict';

const express = require('express');
const router = express.Router();
const ServerAuth = require('../services/utils/ServerAuth');
const PasswordService = require('../services/PasswordService');
const TokenService = require('../services/utils/TokenService');
const ErrorService = require('../services/utils/ErrorService');
const ipUserUuidKey = process.env.IDENTITY_POOL_USER_UUID_KEY;

router.post('/changepassword', (req, res) => {
  const requiredScopes = ['profile'];

  TokenService.validateClientAccessToken(req, ServerAuth.getServerUserAccessToken() || ServerAuth.getServerAdminAccessToken(), requiredScopes)
    .then(validateTokenRes => {
      PasswordService.changeUserPassword(ServerAuth.getServerSystemAccessToken(), validateTokenRes[ipUserUuidKey], req.body)
        .then(changePasswordRes => {
          res.status(200);
          res.send(JSON.stringify({}));
        })
        .catch(err => {
          ErrorService.sendErrorResponse(err, res);
        });
    })
    .catch(tokenIntrospectErr => {
      ErrorService.sendErrorResponse(tokenIntrospectErr, res);
    });
});

module.exports = router;
