const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt_decode = require('jwt-decode');
const R = require('ramda');
const https = require('https');

const app = express();

require('dotenv').config();
const port = process.env.PORT || 5002;

app.use(cors());
app.use(morgan('combined'));

const apiPrefix = '/api';
const acpApiPrefix = `/api/identity/${process.env.ACP_TENANT_ID}/${process.env.ACP_AUTHORIZATION_SERVER_ID}`

let currentAccessToken;

const acpConfig = {
  client: {
    id: process.env.OAUTH_CLIENT_ID,
    secret: process.env.OAUTH_CLIENT_SECRET
  },
  auth: {
    tokenHost: process.env.OAUTH_TOKEN_HOST,
    tokenPath: process.env.OAUTH_TOKEN_PATH
  }
};

const { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } = require('simple-oauth2');

async function setServerAccessToken () {
  const client = new ClientCredentials(acpConfig);

  const tokenParams = {
    scope: '',
  };

  try {
    const accessToken = await client.getToken(tokenParams);
    currentAccessToken = accessToken?.token?.access_token || null;
  } catch (error) {
    console.log('Access Token error', error.message);
  }
};

// Set access token when server starts
setServerAccessToken();

// Refresh access token about 3 min before it expires
const checkAuth = setInterval(() => {
  if (currentAccessToken) {
    const decodedToken = jwt_decode(currentAccessToken);
    if (decodedToken.exp && decodedToken.exp - Math.floor(Date.now()/1000) < 180) {
      setServerAccessToken();
    }
  }
}, 60000);

function decodeAccessToken (req) {
  if (req) {
    const userAccessTokenRaw = req.headers?.authorization?.split(' ')[1];
    return userAccessTokenRaw ? jwt_decode(userAccessTokenRaw) : {};
  }
  return {};
}

app.get(apiPrefix + '/user/schema', (req, res) => {
  const userAccessTokenData = decodeAccessToken(req);
  // console.log(userAccessTokenData);

  const getSchemaOptions = {
    method: 'GET',
    hostname: process.env.ACP_HOST,
    port: process.env.ACP_PORT,
    path: `${acpApiPrefix}/schemas/${process.env.USER_SCHEMA_ID}`,
    headers: {
      'Authorization': `Bearer ${currentAccessToken}`
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
        res.send(processUserPayloadSchema(bodyJson.schema));
      }
    });
  });

  schemaReq.end();
});

app.get(apiPrefix + '/profile/:user', (req, res) => {
  const userAccessTokenData = decodeAccessToken(req);
  // console.log(userAccessTokenData);

  const getProfileOptions = {
    method: 'GET',
    hostname: process.env.ACP_HOST,
    port: process.env.ACP_PORT,
    path: `${acpApiPrefix}/pools/${process.env.IDENTITY_POOL_ID}/users/${req.params.user}`,
    headers: {
      'Authorization': `Bearer ${currentAccessToken}`
    }
  };

  const profileReq = https.request(getProfileOptions, function (profileRes) {
    const chunks = [];

    profileRes.on('data', function (chunk) {
      chunks.push(chunk);
    });

    profileRes.on('end', function () {
      const body = Buffer.concat(chunks);
      res.send(body.toString());
    });
  });

  profileReq.end();
});

app.get('/', (req, res) => {
  res.send('Service is alive');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
