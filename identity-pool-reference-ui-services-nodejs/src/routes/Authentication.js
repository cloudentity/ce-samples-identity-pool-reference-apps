'use strict';

const express = require('express');
const router = express.Router();
const ServerAuth = require('../services/utils/ServerAuth');
const AuthenticationService = require('../services/AuthenticationService');
const ErrorService = require('../services/utils/ErrorService');

router.post('/identifierpassword', (req, res) => {
  const identifier = req.body?.identifier;
  const password = req.body?.password;
  const loginId = req.body?.loginId;
  const loginState = req.body?.loginState;

  if (!identifier || !password || !loginId || !loginState) {
    ErrorService.sendErrorResponse({
      status_code: 422,
      error: 'Unprocessable Entity',
      details: 'Request could not be processed due to missing parameters'
    }, res);
  } else {
    AuthenticationService.verifyPassword(ServerAuth.getServerSystemAccessToken(), identifier, password)
      .then(passwordVerifyRes => {
        const userUuid = passwordVerifyRes?.id || '';

        AuthenticationService.acceptLogin(ServerAuth.getServerSystemAccessToken(), loginId, loginState, identifier, userUuid)
          .then(loginAcceptRes => {
            res.status(201);
            res.send(JSON.stringify(loginAcceptRes))
          })
          .catch(loginAcceptErr => {
            ErrorService.sendErrorResponse(loginAcceptErr, res);
          });
      })
      .catch(passwordVerifyErr => {
        ErrorService.sendErrorResponse(passwordVerifyErr, res);
      });
  }
});

module.exports = router;
