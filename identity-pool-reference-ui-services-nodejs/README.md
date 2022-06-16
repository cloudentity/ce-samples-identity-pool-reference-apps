## Getting started with the ACP Identity Pools Node.js backend reference app

> **IMPORTANT!** Before you begin, please make sure you have gone through the README guide in the main directory of this repository, and set up the ACP prerequisites. This guide is focused only on operational setup for this app.

This Node.js and Express app is a "backend-for-frontend" that offers the following features:

- Supports custom IDP authorization flow by handling Identity Pool user authentication requests from a custom login page
- Exposes self-service REST endpoints that when called by the frontend, internally send requests to an ACP Identity Pool (the resource server), and return data to the frontend

Look for more features to be added soon.

**Minimum requirements for running the Admin Reference UI app:**

- NodeJS 16.x
- NPM 8.x

Note: if you are using NVM to set your Node.js version (recommended), you can install Node.js v.16 by running the following command:

```bash
nvm install 16
```

If you already have Node.js v.16 installed with NVM, but are currently running another version, you can run the following command:

```bash
nvm use 16
```

For more info, read the [NVM docs](https://github.com/nvm-sh/nvm#intro).

**To install dependencies:**

```bash
# Make sure you are in the correct app directory
cd identity-pool-reference-ui-services-nodejs

npm install
```

Start the dev server:

```bash
npm start
```

By default, the Node.js backend services app runs at http://localhost:5002.

**How to configure environment variables:**

> **IMPORTANT!** Before setting up this app, make sure that the self-service UI app is configured to use this backend app. In the self-service UI app codebase, go to `identity-pool-user-reference-ui-react/src/authConfig.js` and set the value of `customLoginEnabled` and `nodeJsBackendEnabled` to `true`

If you followed the ACP setup instructions in the main README file of this repository, you should have created:

- **_EITHER_** a custom IDP, which is configured to double as a System OAuth client for authorizing System API requests,
- **_OR_** a custom IDP, **plus** a separate System OAuth client for authorizing System API requests
- An Admin "Server Web"-type OAuth client for authorizing Admin API requests
- A "Server Web"-type OAuth client in the workspace in which you created your custom IDP, for making token introspection requests (this is a separate client from the "Single Page"-type client in the same workspace, which is used by the self-service UI app)

All of these OAuth clients should be configured to include `client_credentials` in the "Grant Types," and have "Token Endpoint Authentication Method" set to "Client Secret Basic."

Additionally, you should have followed the directions to map the user UUID value in the access token issued by the custom IDP.

Once you have fulfilled these prerequisites, to configure the environment variables for the backend app:

- Open the file `identity-pool-reference-ui-services-nodejs/.env`
- If using ACP SaaS, modify the values as follows:
  - `ACP_HOST`: Your ACP SaaS hostname (e.g. `mytenant.us.authz.cloudentity.io`)
  - `ACP_PORT`: Set this to a blank string
  - `ACP_TENANT_ID`: Your ACP SaaS subdomain (e.g. `mytenant` from the hostname example above)
- If using a local ACP dev environment, leave `ACP_HOST`, `ACP_PORT` and `ACP_TENANT_ID` as they are.
- From your ACP admin dashboard:
  - Get the client ID and secret for your System OAuth client and populate the values in the variables `SYSTEM_OAUTH_CLIENT_ID` and `SYSTEM_OAUTH_CLIENT_SECRET`
  - Get the client ID and secret for your Admin OAuth client and populate the values in the variables `ADMIN_OAUTH_CLIENT_ID` and `ADMIN_OAUTH_CLIENT_SECRET`
  - Get the client ID and secret of the token introspection OAuth client you created in your main self-service app workspace, and populate the values in the variables `USER_OAUTH_CLIENT_ID` and `USER_OAUTH_CLIENT_SECRET`
- Update the **first** URI parameter of `USER_OAUTH_TOKEN_PATH` and `USER_OAUTH_TOKEN_INTROSPECTION_PATH` to use the id of the workspace in which you created your custom IDP, e.g. `/my-custom-login-demo/oauth2/token` and `/my-custom-login-demo/oauth2/introspect`. If you are unsure of what your workspace ID is, you can find these token URIs from the details page of your OAuth client.

The last two variables that must be updated, `IDENTITY_POOL_ID` and `USER_SCHEMA_ID`, require extracting the UUID for the Identity Pool and custom schema (if you are using one) from the URLs of those resources in ACP. To do this:

- From your ACP admin dashboard, Navigate to the "Identity Pools" management page
- Click on the Identity Pool you will be using for the self-service app, copy the parameter from the URL in your browser tab that corresponds to the pool ID (e.g. `/pools/{poolId}/configuration`), and add that value for `IDENTITY_POOL_ID`
- Click on the schema you will be using for the self-service app, copy the parameter from the URL in your browser tab that corresponds to the schema ID (e.g. `/schemas/{schemaId}/schema`), and add that value for `USER_SCHEMA_ID`. If you are using the default schema instead of a custom schema, set this value to `default_payload`.

Now you can run the dev server and use the backend app together with the frontend self-service app.

**Special case: Using the Admin Workspace for the Self-Service App Custom IDP**

If you want to use the Admin workspace to set up your custom IDP for the self-service UI app, the same Admin OAuth client that supports calling Identity Pool Admin APIs can also be used for token introspection.

In this case, set `USER_OAUTH_CLIENT_ID`, `USER_OAUTH_CLIENT_SECRET` and `USER_OAUTH_TOKEN_PATH` to blank strings. For `USER_OAUTH_TOKEN_INTROSPECTION_PATH`, use the value `"/admin/oauth2/introspect"`. The backend app will then user the Admin OAuth client values for token introspection.
