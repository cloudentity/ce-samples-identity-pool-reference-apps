const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');
const jwt_decode = require('jwt-decode');
// const R = require('ramda');
const path = require('path');

const app = express();
app.use(express.json());

require('dotenv').config();
const port = process.env.PORT || 5003;

app.use(cors());
app.use(morgan('combined'));

app.use('/login', express.static(path.join(__dirname, '../views')));

const acpBaseUrl = `https://${process.env.ACP_HOST}${process.env.ACP_PORT ? ':' + process.env.ACP_PORT : ''}`
const ipApiPrefix = `/api/identity/${process.env.ACP_TENANT_ID}/${process.env.ACP_AUTHORIZATION_SERVER_ID}`
const ipApiBaseUrl = acpBaseUrl + ipApiPrefix;

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

const { ClientCredentials } = require('simple-oauth2');

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

app.post('/identifierpassword', (req, res) => {
  const identifier = req.body?.identifier;
  const password = req.body?.password;
  const loginId = req.body?.loginId;
  const loginState = req.body?.loginState;

  if (!identifier || !password || !loginId || !loginState) {
    res.status(422);
    res.json({
      error: 'UnprocessableEntity',
      message: 'Request could not be processed due to missing parameters'
    });
  } else {
    axios.post(`${ipApiBaseUrl}/pools/${process.env.IDENTITY_POOL_ID}/user/password/verify`, {
      identifier: identifier,
      password: password
    },
    {
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    })
    .then(passwordVerifyRes => {
      console.log('Password verify response', passwordVerifyRes.data);
      axios.post(`${acpBaseUrl}/api/system/default/logins/${loginId}/accept`, {
        auth_time: (new Date()).toISOString(),
        subject: identifier,
        login_state: loginState,
        authentication_context: {
          user: {
            id: passwordVerifyRes?.data?.id || '',
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${currentAccessToken}`
        }
      })
      .then(loginAcceptRes => {
        console.log('Login accept response', loginAcceptRes.data);
        res.status(201);
        res.send(JSON.stringify(loginAcceptRes.data))
      })
      .catch(loginAcceptErr => {
        console.log('error!', loginAcceptErr);
        // TODO: expanded error handling
        res.status(500);
        res.send(JSON.stringify({}))
      });
    })
    .catch(passwordVerifyErr => {
      console.log('error!', passwordVerifyErr);
      // TODO: expanded error handling
      res.status(500);
      res.send(JSON.stringify({}))
    });
  }
});

app.get('/alive', (req, res) => {
  res.send(JSON.stringify({status: 'AuthN service is alive!'}));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
