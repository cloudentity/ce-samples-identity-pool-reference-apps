## Quickstart and customization guide for React Identity Pools reference UI

This set of example apps is intended to demonstrate a basic admin and self service UI that is wired up to an ACP Identity Pool.

There are 2 frontend apps: one for admin functionality, and a self-service app. These are built with React.js.

There are 2 backend apps: one to expose self-service APIs, and one to assist with login using a custom IDP. These are built with Node.js/Express.

The backend apps are necessary for the self-service frontend app because in most situations, self-service functionality for Identity Pool users requires calling admin APIs on the server side. There are self-service APIs available in the ACP Identity Pools feature, but they can be called only if the user has logged in through an Identity Pool IDP, rather than a custom login flow. The self-service app supports both Identity Pool and custom IDP flows.

**ACP setup:**

For this reference app to work, you must have access to an ACP tenant with admin/system workspace privileges, and with the Identity Pools feature flag enabled.

In the case of the self-service app, there are 2 ways an Identity Pool user can log in to manage their account: with a Cloudentity-branded Identity Pool IDP (simpler to implement), and with a custom IDP (more complex, but allows implementing a fully customized, branded login page that matches the look-and-feel of the rest of the UI).

To set up an Identity Pool as an IDP:

- Log into your ACP tenant as an admin. If you are not in the workspace management view already, go the workspaces menu and select "View all workspaces"
- Click on "Identity Pools" in the left-hand navigation
- Click on "Create Pool"
- OPTIONAL: After your pool is created, you may click on the "Schemas" tab and create a custom schema. To use it in your pool, select the pool, go to the "Advanced" tab, and under "Payload schema," select the schema you have created, then click "Save." For this basic reference example, please preserve the core attributes (`name`, `family_name` and `given_name`) as they are when creating a custom schema. An example custom schema is provided in this repository in the `identity-pool-example-custom-schemas` directory, which can be copied and pasted into the schema editor in ACP.
- Navigate to the dashboard of the workspace where you wish to use your pool as an IDP
- In the left-hand navigation, select "Identity Data" > "Identity Providers"
- Click on "Create Identity," and click "No thanks" when the IDP discovery prompt is shown
- Your pool should be shown as an option in "User Pools." Select it, and click "Next"
- Enter a name for your Identity Pool IDP, and click "Save"
- Now your Identity Pool IDP should be shown as an IDP option on the login page for that tenant/workspace.

To set up an ACP OAuth application to use with the reference UI:

- Make sure you are in the same workspace where you set up your Identity Pools IDP
- On the workspace dashboard, in the left-hand navigation, select "Applications" > "Clients"
- Click on "Create Application"
- Give the application a name, and select "Single Page" as the application type
- Under "Redirect URI," click on "Setup a redirect URI for your application"
- Enter `http://localhost:3000/` and click "Save"
- Have the "Client ID" value handy for the Reference UI app setup

**Minimum requirements for running the Reference UI app:**

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

# For the admin frontend app:
cd identity-pool-admin-reference-ui-react

npm install

# For the self-service frontend app:
cd identity-pool-user-reference-ui-react

npm install
```

**To start the dev server for either app:**

```bash
npm start
```

By default, the app runs at http://localhost:3000. Note: The admin and self-service apps cannot be run simultaneously unless they are running on different ports. This tutorial assumes you will be running only one at a time.

**How to change the proxy for the API server, set up app to use an ACP SaaS tenant**

Currently this app proxies some API requests to ACP, while others are made directly to ACP. By default, the settings for this app are configured for a locally running instance of ACP, which runs on https://localhost:8443.

To configure the proxied requests, open the `package.json` of the React app (line 5, `"proxy": "https://localhost:8443",`). Change this value if you are not using ACP running locally, for example an ACP SaaS tenant, e.g `"proxy": "https://my-tenant.us.authz.cloudentity.io",`.

To configure an ACP SaaS tenant, make sure you edit the contents of the file `identity-pool-{{admin/user}}-reference-ui-react/src/authConfig.js`. This file is configured for a locally running ACP dev server by default, but you can easily configure your ACP SaaS tenant as in the example below:

```js
const authConfig = {
     domain: 'my-tenant.us.authz.cloudentity.io', // e.g. 'example.authz.cloudentity.io' (domain only, without 'https://' prefix)
     tenantId: 'my-tenant', // If using ACP SaaS, this is generally in the subdomain of your ACP SaaS URL. For local ACP, value is 'default'
     authorizationServerId: 'default', // This is generally the name of the workspace you created the OAuth application in.
     // NOTE: authorizationServerId value must be 'admin' to enable admin views/actions!
     clientId: 'c74ugh6tdb84g2wugku0', // Find this value by viewing the details of your OAuth application
     redirectUri: 'http://localhost:3000/', // Make sure to add this exact value (including trailing slash) to the 'redirect_uri' list of your OAuth application settings
     scopes: ['profile', 'email', 'openid'], // 'revoke_tokens' scope must be present for 'logout' action to revoke token! Without it, token will only be deleted from browser's local storage.
     responseType: ['code'],
     accessTokenName: 'identity_demo_access_token', // optional; defaults to '{tenantId}_{authorizationServerId}_access_token'
     idTokenName: 'identity_demo_id_token', // optional; defaults to '{tenantId}_{authorizationServerId}_id_token'

     // etc..
 };
```

Note: Make sure you set the redirect URI value in your ACP Oauth application _exactly_ as it is configured here; i.e. with a forward slash at the end.

**How to change the default theme color**

By default, the UI uses a soft pastel green color (`#36C6AF`) as the default primary theme color.

It's possible to change this color everywhere by opening `identity-pool-{{admin/user}}-reference-ui-react/src/theme.js` and changing the `palette.primary.main` value to the hex code of your choice:

```js
{
  // ...
  palette: {
    primary: {
      main: '#36C6AF',
    },
    secondary: {
      main: '#1F2D48',
    },
  }
  // ...
}
```

**How to use your own logo image**

By default, the logo is a plain text value, "Identity Pools Demo."

To use a custom logo image, first add an SVG or PNG to the directory `identity-pool-{{admin/user}}-reference-ui-react/src/assets`.

Then, in `identity-pool-{{admin/user}}-reference-ui-react/src/components/common/PageToolbar.js`, in the imports section, find the following block and follow the directions in the comments:

```js
// Uncomment and change the line below to point to your own logo image
// import logoImage from '../../assets/logo-example.svg';
```

Then in the same file, in the JSX section, find the following block and follow the directions in the comments:

```jsx
{/* <img alt="logo image" src={logoImage} /> */}
{/* To use your own logo, uncomment the line above (after editing the 'logoImage' import declaration to point to your own image)... */}
{/* ...and remove the div block directly below */}
<div className={classes.textLogo}>
  <Typography variant="h5" component="h1">Identity Pools Demo</Typography>
</div>
```

**To set up the Node.js backend servers**

The self-service reference UI app supports a custom login flow, available via a set of 2 Node.js backend apps.

One of them, `identity-pool-reference-ui-services-nodejs`, is designed to make admin requests to Identity Pool APIs on the server side, and return self-service data to the reference UI app on behalf of a non-admin user, without the UI having access to any admin credentials or tokens.

The other, `identity-pool-reference-ui-authn-app-nodejs`, is designed to support a fully customizable, branded login UX using a custom IDP. It exposes an identifier/password API, called from the custom login page, that internally verifies the user's credentials with ACP, accepts the login, and returns the authorization redirect URL from ACP that enables the client to obtain an access token.

Both of these Node.js backend apps are **required** for any flow involving login with a custom IDP. Without it, user self-service features are available only for Identity Pool users who log in through an Identity Pool IDP. This is a more simple flow, but locks the client into using a login view that cannot be customized/branded to match the look-and-feel of the self-service app. The backend apps make it possible to develop a fully customized login experience.

> Note: The admin frontend app does not contain any functionality requiring the backend apps. Our assumption is that admins will be logging into a custom admin app using either a Cloudentity IDP not connected to Identity Pools, or a non-customized Identity Pool IDP that is set up in the admin workspace.

To set up the required ACP OAuth applications to use with `identity-pool-reference-ui-services-nodejs` for a simple use case, with users logging in via a non-custom Identity Pools IDP:

- In the self-service reference UI codebase, go to `identity-pool-user-reference-ui-react/src/authConfig.js` and set the value of `nodeJsBackendEnabled` to `true`
- In your ACP tenant admin portal, make sure you are working in the "Admin" workspace, regardless of which workspace you are using for your Identity Pools IDP
- On the workspace dashboard, in the left-hand navigation, select "Applications" > "Clients"
- Click on "Create Application"
- Give the application a name, and select "Server Web" as the application type
- Under the "OAuth" tab, add `client_credentials` to "Grant Types," and set "Token Endpoint Authentication Method" to "Client Secret Basic"
- Under the "Overview" tab, copy the "Client ID" and "Client Secret" and add them to `identity-pool-reference-ui-services-nodejs/.env` in the values for `ADMIN_OAUTH_CLIENT_ID` and `ADMIN_OAUTH_CLIENT_SECRET` (ignore the `SYSTEM` and `USER` variables for now)
- Navigate to the Identity Pools management page ("View all Workspaces" > "Identity Pools")
- Click on the pool you will be using for the self-service app, copy the param in the URL in your browser that corresponds to the pool ID (`/pools/{poolId}/configuration`), and in `identity-pool-reference-ui-services-nodejs/.env`, add that value for `IDENTITY_POOL_ID`
- Return to the main Identity Pools management page, and go to the "Schemas" tab
- Click on the schema you will be using for the self-service app, copy the param in the URL in your browser that corresponds to the schema ID (`/schemas/{schemaId}/schema`), and in `identity-pool-reference-ui-services-nodejs/.env`, add that value for `USER_SCHEMA_ID`

After following the instructions above, install and run the app:

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

With both the Refernce UI app and the Node.js backend services app running, you will have access to the full functionality of the self-service features when using an Identity Pool with a custom user attributes schema.

**To set up a custom IDP with a custom login page**

In the basic examples above, the use of an Identity Pool IDP means that the login page has been generated by ACP, and we don't have control over its appearance. To make a fully custom login page possible, it is necessary to create a custom IDP and wire the series of requests required for the authorization flow in a backend server. While this could be the same server as our previous example, this backend IDP service has been split into a separate app for clarity.

The reference frontend apps have a custom login view and route already built in and ready to be wired up to a custom IDP, but the login page could be any frontend app that connects to the backend server that will process the custom IDP login.

To configure the reference apps for custom login flow:

- In the reference app codebase, go to `identity-pool-user-reference-ui-react/src/authConfig.js` and set the value of `customLoginEnabled` to `true`
- In your ACP tenant admin portal, navigate to the dashboard of the workspace in which you intend to set up the custom IDP
- In the left-hand navigation, select "Identity Data" > "Identity Providers"
- Click on "Create Identity," and click "No thanks" when the IDP discovery prompt is shown
- Under the category "Custom and test connections," select "Custom IDP" and click "Next"
- Give your custom IDP a name, and for the login URL, enter `http://localhost:3000/login` and click "Save"
- On the IDP details page for your new custom IDP, copy the client ID and secret
- In the reference app codebase, open `identity-pool-reference-ui-authn-app-nodejs/.env` and use the custom IDP client ID and client secret as values for `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET`
- In the same file, modify the values for `ACP_HOST`, `ACP_PORT` (set to blank string for ACP SaaS), `ACP_TENANT_ID` and `IDENTITY_POOL_ID` with the values from your ACP tenant and the Identity Pool you are utilizing

After following the instructions above, install and run the app:

```bash
# Make sure you are in the correct app directory
cd identity-pool-reference-ui-authn-app-nodejs

npm install
```

Start the dev server:

```bash
npm start
```

By default, the Node.js backend services app runs at http://localhost:5003.

Now, we need to do some extra configuration of ACP and the `identity-pool-reference-ui-services-nodejs` app to fully enable Identity Pool features for a user logged in with a custom IDP.

To verify that the logged in user is able to call the REST endpoints we're exposing to fetch and manage profile data, we will set up an additional OAuth application in the workspace in which we've created the custom IDP. This application will use client credentials flow in our backend service app to call the token introspection endpoint to check the user's token.

- In your ACP tenant admin portal, navigate to the dashboard of the workspace in which have set up the custom IDP
- On the workspace dashboard, in the left-hand navigation, select "Applications" > "Clients"
- Create a "Server Web" application and modify it to use "client_credentials" and "Client Secret Basic" as in the previous examples
- Additionally, under the "Scopes" tab, expand "OAuth2" options, and check "Introspect tokens" and click "Save"
- Add this application's client ID and client secret to `identity-pool-reference-ui-services-nodejs/.env` for the variables `USER_OAUTH_CLIENT_ID` and `USER_OAUTH_CLIENT_SECRET`

> Note: the instructions above should be modified if using the `admin` workspace to set up your custom IDP. In this case, set `USER_OAUTH_CLIENT_ID`, `USER_OAUTH_CLIENT_SECRET` and `USER_OAUTH_TOKEN_PATH` to blank strings. The backend services app will then user the admin values for token introspection.

For the self-reset password flow, it is necessary for the underlying API to use an application in the system workspace, so we will need to fill in the values for `SYSTEM_OAUTH_CLIENT_ID` and `SYSTEM_OAUTH_CLIENT_SECRET` in `identity-pool-reference-ui-services-nodejs/.env` as well. It is fine to copy the same values from `identity-pool-reference-ui-authn-app-nodejs/.env`, or create a new OAuth Application following the previous instructions in the System workspace.

Finally, we need to configure ACP to map the Identity Pool user's UUID into the access token, as this value is not available by default, and without it, there is no way for our APIs to get this context. We can name the access token key that will hold this value to anything we want, but for this reference app, we will call it `identity_pool_uuid`. To configure this:

- In your ACP tenant admin portal, navigate to the dashboard of the workspace in which have set up the custom IDP
- Navigate to "Auth Settings" > "AuthN Context" and click on "Create Attribute"
- Under "Name," enter `identity_pool_uuid` and under "Data type," select "string."
- Navigate to "Auth Settings" > "Tokens" and select the "Claims" tab
- In the "Claims list" section, select the "Access Tokens" tab, and click the "Add Claim" button
- Under "Claim name," enter `identity_pool_uuid` and under "Source type," select your newly created authN context attribute
- Navigate to the details of your Custom IDP, select the "Attributes" tab, and click on the "Add attribute" button
- Under "Attribute name," enter `user.id`, and select "string" as the data type
- Select the "Mappings" tab in your custom IDP details, and click on the "Add mapping" button
- Under the "Source name" column, select your newly created name, and under the "Target Names" column, select your authN context attribute you created in the previous steps, then click "Save mappings"

Now, when you log in with your custom IDP, your access token will contain the `identity_pool_uuid` mapping, and the backend services app will be able to call admin APIs using the user's UUID gleaned from the token.
