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

const app = express();
app.use(express.json());

const port = process.env.PORT || 5002;

app.use(cors());
app.use(morgan('combined'));

const apiPrefix = '/api';
const acpApiPrefix = `/api/identity/${process.env.ACP_TENANT_ID}/${process.env.ACP_AUTHORIZATION_SERVER_ID}`
const ipUserUuidKey = process.env.IDENTITY_POOL_USER_UUID_KEY;

let currentAdminAccessToken;
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

// Admin server OAuth application, for performing actions on behalf of non-admin client
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
  if (currentUserAccessToken) {
    const decodedUserToken = jwt_decode(currentUserAccessToken);
    if (decodedUserToken.exp && expiresWithinSeconds(decodedUserToken.exp, 180)) {
      setServerUserAccessToken();
    }
  }
}, 60000);

const handleApiError = (err, res) => {
  if (!res || typeof res.send !== 'function') {
    throw new Error('Could send response because res.send is not a function!');
  }

  res.status(err.status_code || 500);
  res.send(JSON.stringify({
    status_code: err.status_code || 500,
    error: err.error || '',
    details: err.details
  }));
};

app.get(apiPrefix + '/user/schema', (req, res) => {
  const userAccessTokenData = TokenService.decodeAccessToken(req);
  // console.log(userAccessTokenData);

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
          res.send(JSON.stringify(getUserRes))
        })
        .catch(err => {
          console.log('An error occurred');
          handleApiError(err, res);
        });
    })
    .catch(err => {
      handleApiError(err, res);
    });
});

app.put(apiPrefix + '/self/profile', (req, res) => {
  const requiredScopes = ['profile'];

  TokenService.validateClientAccessToken(req, currentUserAccessToken, requiredScopes)
    .then(validateTokenRes => {
      UserService.updateUser(currentAdminAccessToken, validateTokenRes[ipUserUuidKey], req.body)
        .then(updateUserRes => {
          res.status(200);
          res.send(JSON.stringify(updateUserRes))
        })
        .catch(err => {
          console.log('An error occurred');
          handleApiError(err, res);
        });
    })
    .catch(err => {
      handleApiError(err, res);
    });
});

app.get('/', (req, res) => {
  res.send('Service is alive');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
