'use strict';

const express = require('express');
const router = express.Router();
const ServerAuth = require('../services/utils/ServerAuth');
const RegisterService = require('../services/RegisterService');
const ErrorService = require('../services/utils/ErrorService');

router.post('/', (req, res) => {
  console.log('req.body')
  console.log(req.body);
  RegisterService.registerUser(ServerAuth.getServerSystemAccessToken(), req.body)
    .then(registerUserRes => {
      res.status(201);
      res.send(JSON.stringify({}));
    })
    .catch(err => {
      ErrorService.sendErrorResponse(err, res);
    });
});

module.exports = router;
