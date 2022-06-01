const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt_decode = require('jwt-decode');
const R = require('ramda');
const https = require('https');

require('dotenv').config();
const { ClientCredentials } = require('simple-oauth2');
const TokenService = require('./TokenService');
const UserService = require('./UserService');
const ErrorService = require('./ErrorService');

const app = express();
app.use(express.json());

const port = process.env.PORT || 5002;

app.use(cors());
app.use(morgan('combined'));

const apiPrefix = '/api';
const acpApiPrefix = `/api/identity/${process.env.ACP_TENANT_ID}/${process.env.ACP_AUTHORIZATION_SERVER_ID}`
const ipUserUuidKey = process.env.IDENTITY_POOL_USER_UUID_KEY;

let currentAdminAccessToken;
let currentSystemAccessToken;
let currentUserAccessToken;

const acpAdminConfig = {
  client: {
    id: process.env.ADMIN_OAUTH_CLIENT_ID,
    secret: process.env.ADMIN_OAUTH_CLIENT_SECRET
  },
  auth: {
    tokenHost: process.env.ADMIN_OAUTH_TOKEN_HOST,
    tokenPath: process.env.ADMIN_OAUTH_TOKEN_PATH
  }
};

const acpSystemConfig = {
  client: {
    id: process.env.SYSTEM_OAUTH_CLIENT_ID,
    secret: process.env.SYSTEM_OAUTH_CLIENT_SECRET
  },
  auth: {
    tokenHost: process.env.SYSTEM_OAUTH_TOKEN_HOST,
    tokenPath: process.env.SYSTEM_OAUTH_TOKEN_PATH
  }
};

const acpUserConfig = {
  client: {
    id: process.env.USER_OAUTH_CLIENT_ID,
    secret: process.env.USER_OAUTH_CLIENT_SECRET
  },
  auth: {
    tokenHost: process.env.USER_OAUTH_TOKEN_HOST,
    tokenPath: process.env.USER_OAUTH_TOKEN_PATH
  }
};

// Admin server OAuth application, for performing profile actions on behalf of non-admin client
async function setServerAdminAccessToken () {
  const client = new ClientCredentials(acpAdminConfig);

  const tokenParams = {
    scope: '',
  };

  try {
    const accessToken = await client.getToken(tokenParams);
    currentAdminAccessToken = accessToken?.token?.access_token || null;
  } catch (error) {
    console.log('Server Admin Access Token error:', error.message);
  }
};

// System server OAuth application, for performing credentials-related actions on behalf of non-admin client
async function setServerSystemAccessToken () {
  const client = new ClientCredentials(acpSystemConfig);

  const tokenParams = {
    scope: '',
  };

  try {
    const accessToken = await client.getToken(tokenParams);
    currentSystemAccessToken = accessToken?.token?.access_token || null;
  } catch (error) {
    console.log('Server System Access Token error:', error.message);
  }
};

// Non-admin server OAuth application in same workspace as frontend OAuth application, for introspect token flow
async function setServerUserAccessToken () {
  const client = new ClientCredentials(acpUserConfig);

  const tokenParams = {
    scope: 'introspect_tokens',
  };

  try {
    const accessToken = await client.getToken(tokenParams);
    currentUserAccessToken = accessToken?.token?.access_token || null;
  } catch (error) {
    console.log('Server User Access Token error:', error.message);
  }
};

// Set access tokens when server starts
setServerAdminAccessToken();
setServerSystemAccessToken();
setServerUserAccessToken();

// Refresh access token about 3 min before it expires
const expiresWithinSeconds = (exp, seconds) => exp - Math.floor(Date.now()/1000) < seconds;
const checkServerAuth = setInterval(() => {
  if (currentAdminAccessToken) {
    const decodedAdminToken = jwt_decode(currentAdminAccessToken);
    if (decodedAdminToken.exp && expiresWithinSeconds(decodedAdminToken.exp, 180)) {
      setServerAdminAccessToken();
    }
  }
  if (currentSystemAccessToken) {
    const decodedSystemToken = jwt_decode(currentAdminAccessToken);
    if (decodedSystemToken.exp && expiresWithinSeconds(decodedSystemToken.exp, 180)) {
      setServerSystemAccessToken();
    }
  }
  if (currentUserAccessToken) {
    const decodedUserToken = jwt_decode(currentUserAccessToken);
    if (decodedUserToken.exp && expiresWithinSeconds(decodedUserToken.exp, 180)) {
      setServerUserAccessToken();
    }
  }
}, 60000);

app.get(apiPrefix + '/user/schema', (req, res) => {
  const userAccessTokenData = TokenService.decodeAccessToken(req);

  const getSchemaOptions = {
    method: 'GET',
    hostname: process.env.ACP_HOST,
    port: process.env.ACP_PORT,
    path: `${acpApiPrefix}/schemas/${process.env.USER_SCHEMA_ID}`,
    headers: {
      'Authorization': `Bearer ${currentAdminAccessToken}`
    }
  };

  function processUserPayloadSchema (schema) {
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
  };

  const schemaReq = https.request(getSchemaOptions, function (schemaRes) {
    const chunks = [];

    schemaRes.on('data', function (chunk) {
      chunks.push(chunk);
    });

    schemaRes.on('end', function () {
      const bodyRaw = Buffer.concat(chunks);
      const bodyJson = JSON.parse(bodyRaw.toString());

      if (!bodyJson.schema) {
        res.status(500);
        res.json({
          error: 'Internal Server Error',
          message: 'The application was unable to process the response from identity pool server'
        });
      } else {
        res.send(JSON.stringify(processUserPayloadSchema(bodyJson.schema)));
      }
    });
  });

  schemaReq.end();
});

app.get(apiPrefix + '/self/profile', (req, res) => {
  const requiredScopes = ['profile'];

  TokenService.validateClientAccessToken(req, currentUserAccessToken, requiredScopes)
    .then(validateTokenRes => {
      UserService.getUser(currentAdminAccessToken, validateTokenRes[ipUserUuidKey])
        .then(getUserRes => {
          res.status(200);
          res.send(JSON.stringify(getUserRes));
        })
        .catch(err => {
          ErrorService.sendErrorResponse(err, res);
        });
    })
    .catch(err => {
      ErrorService.sendErrorResponse(err, res);
    });
});

app.put(apiPrefix + '/self/profile', (req, res) => {
  const requiredScopes = ['profile'];

  TokenService.validateClientAccessToken(req, currentUserAccessToken, requiredScopes)
    .then(validateTokenRes => {
      UserService.updateUser(currentAdminAccessToken, validateTokenRes[ipUserUuidKey], req.body)
        .then(updateUserRes => {
          res.status(200);
          res.send(JSON.stringify(updateUserRes));
        })
        .catch(err => {
          ErrorService.sendErrorResponse(err, res);
        });
    })
    .catch(err => {
      ErrorService.sendErrorResponse(err, res);
    });
});

app.post(apiPrefix + '/self/changepassword', (req, res) => {
  const requiredScopes = ['profile'];

  TokenService.validateClientAccessToken(req, currentUserAccessToken, requiredScopes)
    .then(validateTokenRes => {
      UserService.changeUserPassword(currentSystemAccessToken, validateTokenRes[ipUserUuidKey], req.body)
        .then(changePasswordRes => {
          res.status(200);
          res.send(JSON.stringify(changePasswordRes));
        })
        .catch(err => {
          ErrorService.sendErrorResponse(err, res);
        });
    })
    .catch(err => {
      ErrorService.sendErrorResponse(err, res);
    });
});

app.get('/', (req, res) => {
  res.send('Service is alive');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
