## Getting started with the ACP Identity Pools User Auth React Reference App

> **IMPORTANT!** Before you begin, please make sure you have gone through the README guide in the main directory of this repository, and set up the ACP prerequisites. This guide is focused only on operational setup for this app.

This auth and profile management UI app is a React.js project bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
It offers the following features:

- Customized, brandable login page that works with a custom IDP
- Ability for users to view and update their profile attributes, including custom attributes that are configured in a custom schema
- Ability for users to reset their password from their profile page

Look for more features to be added soon.

> **IMPORTANT!** Running this app with a customized login page and a custom IDP requires the Node.js backend app in this repository, `identity-pool-reference-ui-services-nodejs`, to be configured and running. Please see the README in that repository for setup of that app, and see the README in the main directory of this repository for an overview of custom IDP setup in ACP.

**Minimum requirements for running the User Auth React Reference app:**

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
cd identity-pool-user-reference-ui-react

npm install --legacy-peer-deps
# --legacy-peer-deps flag required at this time due to Material-UI not having been updated for React 18
```

**To start the dev server:**

```bash
npm start
```

By default, the dev server for this app runs at http://localhost:3000.

> Note: The admin and user auth/profile management React apps in this repository cannot be run simultaneously unless they are running on different ports. This tutorial assumes you will be running only one at a time.

**How to configure the proxy for the API server & set up app to use an ACP SaaS tenant**

This app proxies some API requests to ACP through its dev server. By default, this app is configured for a locally running instance of ACP, which runs on https://localhost:8443. You must change this value prior to starting the dev server if your ACP location is different, e.g. an ACP SaaS tenant.

To configure proxying API requests made from the UI to ACP, open `identity-pool-user-reference-ui-react/package.json` and find line 5 (`"proxy": "https://localhost:8443",`). Change this value if you are using an ACP SaaS tenant, e.g `"proxy": "https://my-tenant.us.authz.cloudentity.io",`.

Additionally, to configure an ACP SaaS tenant with the user auth React app, make sure you edit the contents of the file `identity-pool-user-reference-ui-react/src/authConfig.js`. This file is configured for a locally running ACP dev server by default, but you can easily configure your ACP SaaS tenant as in the example below:

```js
const authConfig = {
     // Basic ACP authorization flow configs:
     domain: 'my-tenant.us.authz.cloudentity.io', // e.g. 'example.authz.cloudentity.io' (domain only, without 'https://' prefix)
     tenantId: 'my-tenant', // If using ACP SaaS, this is generally in the subdomain of your ACP SaaS URL. For local ACP, value is 'default'
     authorizationServerId: 'my-demo-workspace', // This is generally the name of the workspace you created the OAuth client in.
     clientId: 'c74ugh6tdb84g2wugku0', // Find this value by viewing the details of your OAuth client
     redirectUri: 'http://localhost:3000/', // Make sure to add this exact value (including trailing slash) to the 'redirect_uri' list of your OAuth client settings
     scopes: ['profile', 'email', 'openid'], // 'revoke_tokens' scope must be present for 'logout' action to revoke token! Without it, token will only be deleted from browser's local storage.
     responseType: ['code'], // default required value, do not edit
     accessTokenName: 'identity_demo_access_token', // optional; defaults to '{tenantId}_{authorizationServerId}_access_token'
     idTokenName: 'identity_demo_id_token', // optional; defaults to '{tenantId}_{authorizationServerId}_id_token'

     // App functionality configs:
     nodeJsBackendEnabled: false,
     // Set to 'true' if 'identity-pool-reference-ui-services-nodejs' is set up and running, and a custom user schema is being utilized.
     // When set to 'false,' custom user schema will not be utilized for profile functionality, even if one exists for the configured identity pool.

     customLoginEnabled: false
     // Set to 'true' if 'identity-pool-reference-ui-authn-app-nodejs' is set up and running, and a custom IDP has been set up for the ACP workspace.
     // When set to 'false,' direct requests to ACP '/self/me' APIs will be used for profile functionality.
 };
```

> **IMPORTANT!** Make sure you set the redirect URI value in your ACP Oauth client configuration _exactly_ as it is configured here; i.e. with a forward slash at the end. See the README in the main directory of this repository for more information on ACP OAuth client configuration.

### Behind the scenes

#### Custom Identity provider using Identity pool APIs as Authn provider

As mentioned before we will use Backend for frontend (BFF) design pattern to talk to Identity Pool APIs. The Node.js backend app `identity-pool-reference-ui-services-nodejs` will act as an intermediary between the React.js app and Identity Pool API.

Some of the Identity Pool APIs needs a trusted backend to initiate a secure communication channel and retrieve user information on behalf of the authenticated user. Later in the article, we will see couple of configurations to enable this.

Let's take a sequence of activities that are relevant to this entire call flow
* User clicks "Login" on the user auth React app, which initiates an OAuth authorize flow in Cloudentity and is redirected to the "Custom IDP login page"
* User enters their identifier and password
* Backend application calls the Identity Pool [Verify Password](https://developer.cloudentity.com/api/identity/#tag/Users/operation/verifyPassword) API
    * If verification is successful, it calls the ACP System [Accept Login](https://docs.authorization.cloudentity.com/api/system/#tag/logins/operation/acceptLoginRequest) API, passing the user's UUID (which was returned in the Verify Password response)
* Accept Login response contains a redirect URL to Cloudentity as a callback and the application must redirect to this URL
* Cloudentity returns and OAuth authorization code and the authentication application can now exchange it for  idToken & accessToken
* Now the react authentication application can store the access & idTokens to represent an authenticated user

#### Cloudentity Identity pool identity provider as Authn provider

Let's take a sequence of activities that are relevant to this entire call flow
* User clicks "Login" on the user auth React app, which initiates an OAuth authorize flow in Cloudentity and is redirected to the "Cloudentity identity pool" identity provide authentication page
* User enters their identifier and password
* Cloudentity returns  OAuth authorization code and the authentication application can now exchange it for  idToken & accessToken
* Now the react authentication application can store the access & idTokens to represent an authenticated user

Irrespective of the mechanism through which user authentication, user can now manage their profile using below integration APIs

#### Manage User profile

Above flow authenticated the user, and to allow the user to update their profile or change password etc, they need to present the accessToken to the backend app which internally proxies the calls to Cloudentity backends
for the user represented within the accessToken using following APIs
* [Get User details](https://developer.cloudentity.com/api/identity/#tag/Users/operation/getUser) API
* [Update User details](https://docs.authorization.cloudentity.com/api/identity/#tag/Users/operation/updateUser) API
* [Change Password](https://docs.authorization.cloudentity.com/api/identity/#tag/Users/operation/changePassword) API

For the backend Nodejs application to call Cloudentity APIs, it needs to be a trusted application and needs to
identity itself by obtaining an access Token. We will use OAuth client credentials flow to obtains these tokens
for this backed to call aboe APIs. The backend app will keep track of token expiry and refresh as required.

Even though this tutorial uses a frontend and backend pattern, this could also be used for fully server side rendered applications.

#### Custom user self-registration page

This demo app additionally features an example of how to set up a user registration page that uses the same BFF design to call the Identity Pool system Create User API, and subsequently the Send Activation Message API, when the new user fills out a registration form and submits it.

This approach allows complete control of styling and form inputs on your custom registration page, as long as the form data is mapped into a payload that the Identity Pool API is able to process, and your user schema is configured to support any custom fields. (See the docs on the system [Create User](https://cloudentity.com/developers/api/identity_apis/identity-system-api/#tag/Users/operation/systemCreateUser) API, the [Send Activation Message](https://cloudentity.com/developers/api/identity_apis/identity-system-api/#tag/Users/operation/selfSendActivationMessage) API, and on [configuring a custom User schema](https://cloudentity.com/developers/howtos/tenant-configuration/configuring-identity-pools/)).

In this scenario, be aware that configuring the option to enable self-registration in ACP does not matter, as your application is bypassing this functionality by using your own custom application and calling the underlying system API directly to create the user and send the activation message.

## Optional steps for enhanced customization use cases

**How to change the default theme color**

By default, the UI uses a soft pastel green color (`#36C6AF`) as the default primary theme color.

It's possible to change this color everywhere by opening `identity-pool-user-reference-ui-react/src/theme.js` and changing the `palette.primary.main` value to the hex code of your choice:

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

To use a custom logo image, first add an SVG or PNG to the directory `identity-pool-user-reference-ui-react/src/assets`.

Then, in `identity-pool-user-reference-ui-react/src/components/common/PageToolbar.js`, in the imports section, find the following block and follow the directions in the comments:

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
