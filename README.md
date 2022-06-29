## Overview

Cloudentity Identity pools functionality provides a robust set of APIs that enables you to build custom authentication flows for user authentication. With Identity pools APIs, what you get is a hyper scale identity API set for user authentication and management. We will leave it up to your team to build the UX and CX associated with the user authentication journey while Cloudentity APIs provide the backbone for user profile storage.

This repo provides a set of apps that demonstrates how to utilize Cloudentity Identity pools API to build
* an authentication application
* a self service user profile management application
* admin application to manage set of users and organizations

and finally how to integrate the authentication application with Cloudentity authorization platform to mint
OAuth compliant tokens (accessToken, idToken, refresh tokens etc)

## Cloudentity Identity pools

Identity Pools allow for the persistent storage of user data within Cloudentity's infrastructure and we provide
highly flexible schema and high scale, low latency APIs to manage user authentication and attributes and can meet your hyper scale use cases.

To learn how to configure Identity pools in Cloudentity platform, first read these articles
* [Create an Identity pool with flexible schema](https://developer.cloudentity.com/howtos/tenant_configuration/configuring_identity_pools/?q=)
* [Create a custom schema](https://developer.cloudentity.com/howtos/tenant_configuration/configuring_identity_pools/#configure-identity-schemas)

We have provided a sample schema in the `identity-pool-example-custom-schemas` directory, which can be copied and pasted into the schema editor in Cloudentity.

## Repo layout

This repo has multiple modules to demonstrate couple of different functionalities as highlighted above
* [identity-pool-user-reference-ui-react](identity-pool-user-reference-ui-react) - React.js project that serves the UI for the authentication and user profile management application
* [identity-pool-reference-ui-services-nodejs](identity-pool-reference-ui-services-nodejs) - We use Backend for Frontend (BFF) pattern to talk to Cloudentity APIs and we use a simple Node.js project as the backend component.
* [identity-pool-admin-reference-ui-react](identity-pool-admin-reference-ui-react) - React.js project that serves the UI for an admin application that showcases how you can model business cases like partner organizations and partner user management using the multitudes of Identity pools that can be added within a Cloudentity tenant.

## Pre-requisites

- [Cloudentity tenant](https://authz.cloudentity.io/register)
- [Node.js](https://nodejs.org) - Recommended v16.x +
- [ExpressJS](https://expressjs.com) - Recommended 4.16.1 +

## Cloudentity Tenant configuration

Once you have a SaaS tenant registered:

- [Create a new worskpace within Cloudentity](https://developer.cloudentity.com/howtos/tenant_configuration/adding_workspaces/?q=)
- **Get System and Admin workspace access for your Cloudentity tenant** - This feature is not enabled for the free SaaS tenants, please contact [info@cloudentity.com](mailto:info@cloudentity.com) to get this enabled for your SaaS tenant

## Configuring the apps

This guide will focus on how to set up and configure Cloudentity platform to meet the prerequisites for running these apps, while each individual repo has a `README` file in its root project directory with documentation on topics like how to install dependencies, configure environment variables, and run the dev server.

## User authentication application

First let's take a look at what is required to configure the user authentication application. User authentication application can be configured to obtain the user authentication token (idToken) from Cloudentity authorization platform using one of the approaches below

* [**Using a Custom Identity provider that uses Identity pool APIs**](#custom-identity-provider-using-identity-pool-apis-as-authn-provider) - This pattern allows you to take control of the entire user experience journey. This means there is a need to run an application that handles the UX journey but behind the scenes it can talk to Cloudentity Identity Pool APIs along with other system APIs that it may want to interact with to have better UX. The UI screens that will be displayed to the user
will be totally under your control and is not limited.
* [**Using Cloudentity Identity pool identity provider**](#cloudentity-identity-pool-identity-provider-as-authn-provider) - This pattern hides the complexity of Identity pool API integration and there isn't a need to run any specific services that integrates with the APIs. The users will directly interact with a form that is exposed by Cloudentity for authentication. The UI screens that will be displayed to the user will be limited by the CSS/styling boundaries provided by Cloudentity

So choose a pattern that suits your needs and let's dive into details for each of these patterns

### Custom Identity provider using Identity pool APIs as Authn provider

As mentioned before we will use Backend for frontent (BFF) design pattern to talk to Identity Pool APIs. The Node.js backend app `identity-pool-reference-ui-services-nodejs` will act as an intermediary between the React.js app and Identity Pool API. Some of the Identity Pool APIs needs a trusted backend to initiate a secure communication channel and retrieve user information on behalf of the authenticated user. Later in the article, we will see couple of configurations to enable this.

#### Configure Cloudentity to use Custom Identity provider

* [Register a custom identity provider within Cloudentity](https://developer.cloudentity.com/howtos/identities/custom_idp/#connecting-custom-idps-to-cloudentity)
    * while configuring the identity provider for the login URL enter `http://localhost:3000/login`
* Configure `identity_pool_uuid` to be returned as an OIDC claim in access and idTokens
    * [Define `identity_pool_uuid` as an attribute in authentication context](https://developer.cloudentity.com/howtos/tenant_configuration/setting_up_identity_context/#define-authentication-context-schema)
    * [Configure `user.id` as an attribute returned by Custom Identity provider](https://developer.cloudentity.com/howtos/identities/custom_idp/#configure-authentication-context-attributes)
    * [Map `user.id` attribute to authentication context attribute `identity_pool_uuid`](https://developer.cloudentity.com/howtos/identities/custom_idp/#configure-mappings-of-the-attributes)

Now, when you log in with your custom IDP, the access token will contain the `identity_pool_uuid` mapping, and the Node.js backend app will be able to call Identity Pool admin APIs with this value from the token.

#### Register apps in Cloudentity to make API calls

* [Register a trusted OAuth client for BFF to call Identity Pool API](https://developer.cloudentity.com/howtos/applications/connecting_and_configuring_client_apps/#create-application)
    * Navigate to `admin` workspace an create an OAuth client application
    * The type of application must be `Service`
    * Subscribe to `identity` scopes
* [Register a trusted OAuth client for BFF to verify user accessToken](https://developer.cloudentity.com/howtos/applications/connecting_and_configuring_client_apps/#create-application)
    * Navigate to the workspace where the identity provider was register and create an OAuth client application
    * The type of application must be `Service`
    * Subscribe to `Introspect tokens` scope


#### Configure & run the applications

Having configured everything we need on the Cloudentity side, let's configure the necessary environment variables in the frontend and backend apps.
- In the user auth React app codebase, go to [identity-pool-user-reference-ui-react/src/authConfig.js](identity-pool-user-reference-ui-react/src/authConfig.js) and and configure the Cloudentity authorization server url, client id etc
- In the user auth React app codebase, go to [identity-pool-user-reference-ui-react/src/authConfig.js](identity-pool-user-reference-ui-react/src/authConfig.js) and set the value of `customLoginEnabled` and `nodeJsBackendEnabled` to `true`
- In the Node.js backend app code base, go to [identity-pool-reference-ui-services-nodejs/README.md](identity-pool-reference-ui-services-nodejs/README.md) and follow the instructions for populating the environment variables, installing the dependencies, and running the server.

With the frontend and backend apps configured and both dev servers running, you should now be able to login with the custom IDP we've set up, and perform all the available profile management operations.

### Cloudentity Identity pool identity provider as Authn provider

In this pattern we will use the identity pool identity provider natively to serve as the authentication provider. [This article highlights how to configure identity pool as an authentication provider](https://developer.cloudentity.com/howtos/identities/identity_pool_idp/?q=). So in this pattern, there isn't a need to utilize any Identity pool APIs directly.

#### Configure & run the applications

Having configured everything we need on the Cloudentity side, let's configure the necessary environment variables in the frontend and backend apps.

- In the user auth React app codebase, go to [identity-pool-user-reference-ui-react/src/authConfig.js](identity-pool-user-reference-ui-react/src/authConfig.js) and and configure the Cloudentity authorization server url, client id etc
- In the user auth React app codebase, go to `identity-pool-user-reference-ui-react/src/authConfig.js` and set the value of `customLoginEnabled` and `nodeJsBackendEnabled` to `false`
- In the Node.js backend app code base, go to `identity-pool-reference-ui-services-nodejs/README.md` and follow the instructions for populating the environment variables, installing the dependencies, and running the server.

With the frontend and backend apps configured and both dev servers running, you should now be able to login with the native Identity pool as authentication provider, and perform all the available profile management operations.
