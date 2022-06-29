'use strict';

const express = require('express');
const router = express.Router();
const ServerAuth = require('../services/utils/ServerAuth');
const ProfileService = require('../services/ProfileService');
const TokenService = require('../services/utils/TokenService');
const ErrorService = require('../services/utils/ErrorService');
const ipUserUuidKey = process.env.IDENTITY_POOL_USER_UUID_KEY;

router.get('/', (req, res) => {
  const requiredScopes = ['profile'];

  TokenService.validateClientAccessToken(req, ServerAuth.getServerUserAccessToken() || ServerAuth.getServerAdminAccessToken(), requiredScopes)
    .then(validateTokenRes => {
      ProfileService.getUser(ServerAuth.getServerAdminAccessToken(), validateTokenRes[ipUserUuidKey])
        .then(getUserRes => {
          res.status(200);
          res.send(JSON.stringify(getUserRes));
        })
        .catch(err => {
          ErrorService.sendErrorResponse(err, res);
        });
    })
    .catch(tokenIntrospectErr => {
      ErrorService.sendErrorResponse(tokenIntrospectErr, res);
    });
});

router.put('/', (req, res) => {
  const requiredScopes = ['profile'];

  TokenService.validateClientAccessToken(req, ServerAuth.getServerUserAccessToken() || currentAdminAccessToken, requiredScopes)
    .then(validateTokenRes => {
      ProfileService.updateUser(ServerAuth.getServerAdminAccessToken(), validateTokenRes[ipUserUuidKey], req.body)
        .then(updateUserRes => {
          res.status(200);
          res.send(JSON.stringify(updateUserRes));
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
