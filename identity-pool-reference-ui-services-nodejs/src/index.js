const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const R = require('ramda');

require('dotenv').config();
const ServerAuth = require('./services/utils/ServerAuth');
const authenticationRoute = require('./routes/Authentication');
const registerRoute = require('./routes/Register');
const schemaRoute = require('./routes/Schema');
const profileRoute = require('./routes/Profile');
const passwordRoute = require('./routes/Password');

const app = express();
app.use(express.json());

const port = process.env.PORT || 5002;

app.use(cors());
app.use(morgan('combined'));

const apiPrefix = '/api';
const acpApiPrefix = `/api/identity/${process.env.ACP_TENANT_ID}/${process.env.ACP_AUTHORIZATION_SERVER_ID}`;
const ipUserUuidKey = process.env.IDENTITY_POOL_USER_UUID_KEY;

// Set access tokens when server starts
ServerAuth.setServerAdminAccessToken();
ServerAuth.setServerSystemAccessToken();
ServerAuth.setServerUserAccessToken();

// Refresh access token about 3 min before it expires
const checkServerAuth = setInterval(() => {
  ServerAuth.checkServerAuth();
}, 60000);

app.use(apiPrefix + '/authenticate', authenticationRoute);
app.use(apiPrefix + '/register', registerRoute);
app.use(apiPrefix + '/userschema', schemaRoute);
app.use(apiPrefix + '/self/profile', profileRoute);
app.use(apiPrefix + '/self/password', passwordRoute);

app.get('/', (req, res) => {
  res.send('Service is alive');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
