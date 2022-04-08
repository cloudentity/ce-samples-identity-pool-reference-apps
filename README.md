## Quickstart and customization guide for React Identity Pools reference UI

**Minimum requirements:**

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

npm install
```

**To start the dev server:**

```bash
npm start
```

By default, the app runs at http://localhost:3000.

**How to change the proxy for the API server, set up app to use an ACP SaaS tenant**

Currently this app proxies some API requests to ACP, while others are made directly to ACP. By default, the settings for this app are configured for a locally running instance of ACP, which runs on https://localhost:8443.

To configure the proxied requests, open the `package.json` of the React app (line 5, `"proxy": "https://localhost:8443",`). Change this value if you are not using ACP running locally, for example an ACP SaaS tenant, e.g `"proxy": "https://my-tenant.us.authz.cloudentity.io",`.

To configure an ACP SaaS tenant, make sure you edit the contents of the file `identity-pool-user-reference-ui-react/src/authConfig.js`. This file is configured for a locally running ACP dev server by default, but you can easily configure your ACP SaaS tenant as in the example below:

```js
const authConfig = {
    domain: 'my-tenant.us.authz.cloudentity.io', // e.g. 'example.authz.cloudentity.io.' Recommended; always generates URLs with 'https' protocol.
     // baseUrl: optional alternative to 'domain.' Protocol required, e.g. 'https://example.demo.cloudentity.com.'
     // In situations where protocol may dynamically resolve to 'http' rather than 'https' (for example in dev mode), use 'baseUrl' rather than 'domain'.
     tenantId: 'my-tenant', // This is generally in the subdomain of your Cloudentity ACP URL
     authorizationServerId: 'default', // This is generally the name of the workspace you created the OAuth application in.
     clientId: 'c74ugh6tdb84g2wugku0', // Find this value by viewing the details of your OAuth application
     redirectUri: 'http://localhost:3000/',
     scopes: ['profile', 'email', 'openid'], // 'revoke_tokens' scope must be present for 'logout' action to revoke token! Without it, token will only be deleted from browser's local storage.
     accessTokenName: 'identity_demo_access_token', // optional; defaults to '{tenantId}_{authorizationServerId}_access_token'
     idTokenName: 'identity_demo_id_token', // optional; defaults to '{tenantId}_{authorizationServerId}_id_token'
 };
```

Note: Make sure you set the redirect URI value in your ACP Oauth application _exactly_ as it is configured here; i.e. with a forward slash at the end.

Note: if you do not have access to configure the Admin or System workspaces in ACP, you will not be able to use the admin features of this demo app. You will only have access to the self user features.

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
