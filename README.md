## Quickstart and customization guide for React Identity Pools reference UI

This set of reference apps is intended to demonstrate a basic auth, profile management and admin UI that is wired up to an ACP Identity Pool.

This guide assumes some basic familiarity with ACP and the Identity Pools feature in ACP. Please see the developer guide for [Identity Pools](https://developer.cloudentity.com/howtos/tenant_configuration/configuring_identity_pools/) if you are unfamiliar with this topic.

In this repository, there are several individual apps that fall into two categories: **user auth/profile management** and **admin**:

- The **user auth & profile management** UI project comes as a set of two apps: `identity-pool-user-reference-ui-react` (we'll call it the **"user auth React app"** from now on), a simple React.js SPA, and a Node.js/Express backend app, `identity-pool-reference-ui-services-nodejs` (we'll call it the **"Node.js backend app"**), which acts as a backend-for-frontend between ACP and the user auth React app. This set of apps demonstrates how a robust profile management tool for ACP Identity Pool users can be set up, with a flexible & fully customized login page that works with a custom IDP configured in ACP.

- The **admin app**, located in the directory `identity-pool-admin-reference-ui-react`, is a simple React.js SPA like the user auth React app. ACP has a built-in UI feature for Identity Pools management, but it is possible to build a custom API for this purpose that fits the needs of your organization. This app demonstrates how ACP admin APIs for Identity Pools can be integrated into a custom UI app.

> **IMPORTANT!** For any of the reference apps to work, you must have access to an ACP tenant with admin/system workspace privileges, and with the Identity Pools feature flag enabled. Please contact us through our support portal if you need these features turned on for your ACP SaaS tenant.

Please note that this guide will focus mostly on setting up and configuring ACP to meet the prerequisites for running these apps, while each individual app has a `README` file in its root project directory with documentation on topics like how to install dependencies, configure environment variables, and run the dev server.

At a high level, there are two basic categories of prerequisites that must be configured in ACP prior to running these reference apps:

- An **identity provider (IDP)**
- At least one **OAuth client**

The IDP and OAuth clients together provide the means for users, whether admin or non-admin users, to log in to the frontend apps via an OAuth authorization flow (Multiple OAuth clients come into play if using a custom IDP with a combination of the user auth React app and the Node.js backend app; more about that later in this article).

The frontend apps utilize a lightweight, open-source JS authorization library, [@cloudentity/auth](https://www.npmjs.com/package/@cloudentity/auth), to handle initiating OAuth authorization flows and handling redirects between the reference app and the IDP configured in ACP. This library has 0 dependencies and can be used with any frontend JS framework, such as React, Angular, Vue, etc.

## ACP setup (User Auth React App)

**Basic ACP Configuration for the User Auth React App**

The user auth React app is designed to be used only by ACP Identity Pool users. There are two ways an Identity Pool user can log in to manage their account: with a default Identity Pool IDP, which is automatically configured by ACP (simpler to implement, but limited ability to customize), and with a custom IDP (more complex, but allows implementing a fully customized, branded login page that matches the look-and-feel of the rest of the UI).

Let's cover the simple use case first.

**To set up an Identity Pool as an IDP:**

- Log into your ACP tenant as an admin
- In the top-right navigation menu, click on the gear icon, and select "Identity Pools" from the list of options. Alternatively, in the left-hand navigation, click on the workspace icon to see the options menu, select "View all workspaces," and then select "Identity Pools" from the left-hand navigation menu
- Click on "Create Pool"

> OPTIONAL: After your pool is created, you may click on the "Schemas" tab and create a custom schema. To use it in your pool, select the pool, go to the "Advanced" tab, and under "Payload schema," select the schema you have created, then click "Save." For this basic reference example, please preserve the core attributes (`name`, `family_name` and `given_name`) as they are when creating a custom schema. An example custom schema is provided in this repository in the `identity-pool-example-custom-schemas` directory, which can be copied and pasted into the schema editor in ACP.

- Navigate to the dashboard of the workspace where you wish to use your Identity Pool as an IDP.

> OPTIONAL: To create a new workspace just for this tutorial (recommend for the user auth React app):
> - In the top-right navigation menu, click on the gear icon, and select "Workspaces" from the list of options
> - Click on "Create Workspace," and select "Demo."
> - Create a workspace Name and ID. Make a note of the ID, as you will need it later to configure reference app environment variables, and click "Next"
> - You can ignore the rest of the steps and exit the create workspace tool by clicking the "X" in the upper-right of the "Connect user pool" screen, as we will configure this from the main workspace dashboard
> - After exiting, your workspace will be visible in the main list of workspaces. Select your new workspace from the list, and continue with the instructions

- In the left-hand navigation, select "Identity Data" > "Identity Providers"
- Click on "Create Identity," and click "No thanks" when the IDP discovery prompt is shown
- Your pool should be shown as an option in "User Pools." Select it, and click "Next"
- Enter a name for your Identity Pool IDP, and click "Save"
- Now your Identity Pool IDP should be shown as an IDP option on the login page for that tenant/workspace

**To set up an ACP OAuth client to use with the reference UI:**

- Make sure you are in the same workspace where you set up your IDP
- On the workspace dashboard, in the left-hand navigation, select "Applications" > "Clients"
- Click on "Create Application"
- Give the application a name, and select "Single Page" as the application type
- Under "Redirect URI," click on "Setup a redirect URI for your application"
- Enter `http://localhost:3000/` and click "Save"
- Have the "Client ID" value handy for the Reference UI app setup

After this configuration has been completed, go to `identity-pool-user-reference-ui-react/README.md` for instructions on how to install the user auth React app dependencies, populate the ACP values you've configured in the app's environment variables, and run the app.

> **Note:** Having followed these basic instructions, you do not need the Node.js backend app at this point.

After following the user auth React app instructions, click on the "Login" button and you should be redirected to an Identity Pool login page if everything has been configured correctly. Once logged in, you will be able to view and edit the profile of your logged-in Identity Pool user.

> **Note:** if you are using a workspace that has more than one IDP set up, you will be presented with a choice of IDPs with which to log in after clicking the "Login" button. In this case, you must select the Identity Pool IDP for the user auth React app to work. For clarity, we recommend that you create a workspace to use just for this tutorial.

**Advanced ACP Configuration for the User Auth React App: Setting up a Custom IDP and Login Page**

In the basic examples above, the use of an Identity Pool IDP meant that the login page was generated by ACP, and we had only limited control over its appearance. To make a fully custom login page possible, it is necessary to create a custom IDP and wire the series of requests required for the authorization flow in a backend server. This is where the Node.js backend app `identity-pool-reference-ui-services-nodejs` comes in. It will act as an intermediary between our frontend and the resource server, i.e. our ACP Identity Pool.

**Concepts Behind the Backend-for-Frontend (BFF) Pattern used for Custom IDP Login in the User Auth React App**

In our first, basic example above, the frontend was directly calling a set of profile management APIs exposed by ACP Identity Pools, which internally are able to determine the user's identity from the authentication context, as long as the user possesses an access token that was issued by an Identity Pool IDP.

With a custom IDP, which we need to implement a fully customized login page, an access token minted for the same identity pool user will not have this context, and requests to profile management APIs will fail. We must manually configure the authentication context to map the user's UUID into the access token, but even then, this is not enough to allow calling Identity Pool profile management API endpoints. We must set up an intermediary backend application (the Node.js backend app in this project) that internally calls Identity Pool admin APIs on behalf of the user, and passes the data we want to expose to the frontend.

At a high level, the BFF pattern for the user auth React app plus the Node.js backend app works like this:

- The user clicks "Login" on the user auth React app, and is redirected to the custom IDP login page (which looks like the rest of the reference app, creating the illusion that no redirect took place at all)
- The user enters their identifier and password
- The backend application internally calls the Identity Pool [Verify Password](https://docs.authorization.cloudentity.com/api/identity/#tag/Users/operation/verifyPassword) API, and if that request is successful, it next calls the ACP System [Accept Login](https://docs.authorization.cloudentity.com/api/system/#tag/logins/operation/acceptLoginRequest) API, passing the user's UUID (which was returned in the Verify Password response) into the `authentication_context` parameter of the request body
- The Accept Login response contains a redirect URL to ACP to complete the authorization flow, and the frontend redirects to this URL
- If there are scopes for which the user must grant consent, a consent page is shown, and the user grants their consent
- ACP mints the access token and redirects back to the reference UI, and the reference UI sets the access token
- With the user now logged in and on the profile page, the frontend makes a request to the backend for the user's profile
- The backend checks the user's access token, then internally calls the resource server, our ACP Identity Pool, with the [Admin Get User](https://docs.authorization.cloudentity.com/api/identity/#tag/Users/operation/getUser) API (using the user's UUID from their access token, which we mapped in the authentication context), then returns the data (or a subset of the data) back to the frontend for the user to view
- The same process happens when the user updates their profile or changes their password: the [Admin Update User](https://docs.authorization.cloudentity.com/api/identity/#tag/Users/operation/updateUser) or the [Change Password](https://docs.authorization.cloudentity.com/api/identity/#tag/Users/operation/changePassword) APIs are called by the backend after receiving a request from the frontend

The backend is able to call ACP Admin & System APIs by authorizing with ACP Admin and System OAuth clients using the Client Credentials flow. When the backend server first starts, it obtains access tokens for each of these clients, and refreshes the tokens as they expire for as long as the server is running. This way, the admin credentials are never exposed to the frontend.

For this tutorial, the user auth React app has a pre-built custom login view and route that is ready to be connected to a custom IDP. However, the login page could be any type of frontend app that connects to the backend server that is responsible for processing the custom IDP login.

Finally, in this example, the Node.js backend app exposes REST endpoints to be utilized by a stateless SPA, but this pattern could be just as easily implemented for a server-side-rendered frontend, including a mobile app.

**How to configure ACP for custom login flow:**

First, we will create a custom IDP, and configure it so it can also double as a System OAuth client we can use to call System APIs. These include the [Accept Login](https://docs.authorization.cloudentity.com/api/system/#tag/logins/operation/acceptLoginRequest) API and certain Identity Pool APIs such as the [Verify Password](https://docs.authorization.cloudentity.com/api/identity/#tag/Users/operation/verifyPassword) and [Change Password](https://docs.authorization.cloudentity.com/api/identity/#tag/Users/operation/changePassword) APIs.

- Log into your ACP tenant as an admin, and navigate to the dashboard of the workspace in which we created the "Single Page"-type OAuth client for the user auth React app at the start of this tutorial
- In the left-hand navigation, select "Identity Data" > "Identity Providers"
- Click on "Create Identity," and click "No thanks" when the IDP discovery prompt is shown
- Under the category "Custom and test connections," select "Custom IDP" and click "Next"
- Give your custom IDP a name, and for the login URL, enter `http://localhost:3000/login` and click "Save"
- Navigate to the System workspace, and under "Applications" > "Clients" find the OAuth client associated with your custom IDP, and open it to view its details. Open the "Scopes" tab, check "Identity," and click "Save"

> **Note:** We are activating the `identity` scope for this OAuth client because we need a client in the System workspace to call certain Identity Pool and ACP System APIs. In this case, creating a custom IDP automatically creates such a client, so we will double-purpose it for simplicity's sake. However, it is perfectly fine to create an OAuth client in the System workspace to be used only for calling APIs (just note that it must have `identity` and `manage_logins` scopes enabled)

Now, regardless of which workspace we're using for the Identity Pools IDP, we need to create a "Server Web"-type OAuth client in the Admin workspace so the backend can call Identity Pool admin APIs.

- Navigate to the "Admin" workspace dashboard
- In the left-hand navigation, select "Applications" > "Clients"
- Click on "Create Application"
- Give the application a name, and select "Server Web" as the application type
- Under the "OAuth" tab, add `client_credentials` to "Grant Types," and set "Token Endpoint Authentication Method" to "Client Secret Basic"

> **Note:** In case `client_credentials` is not an option when selecting "Grant Types," from the workspace dashboard, select "Auth Settings" > "OAuth" in the left-hand navigation. Under the "General" tab, check "Client credentials" and click "Save changes."

Now that we have a custom IDP, as well as System and Admin OAuth clients configured for the backend, we need one more "Server Web"-type OAuth client.

We must verify that the logged in user is authorized to call the REST endpoints we're exposing in the Node.js backend app, which allow profile management CRUD operations. To do this, we will set up an additional "Server Web"-type OAuth client in the same workspace in which we've created the custom IDP. This additional client will be used to call the token introspection endpoint to check the user's token.

> **Note:** This OAuth client must be different than the "Single Page"-type client you already created in this workspace. After going through these steps, you will have 2 clients in this workspace related to this tutorial, one exclusively for the frontend, and one exclusively for the backend.

- Navigate to the dashboard of the workspace in which we have set up the custom IDP
- On the workspace dashboard, in the left-hand navigation, select "Applications" > "Clients"
- Create a "Server Web" application and modify it to use "client_credentials" and "Client Secret Basic" as in the previous examples
- Additionally, under the "Scopes" tab, expand "OAuth2" options, check "Introspect tokens" and click "Save"

Finally, we need to configure ACP to map the Identity Pool user's UUID into the access token, as this value is not available by default, and without it, there is no way for our APIs to get this context. We could configure the name of the access token key that will hold this value to anything we want, but for this reference app, we will call it `identity_pool_uuid`. To configure this:

- Navigate to the dashboard of the workspace in which we have set up the custom IDP
- Navigate to "Auth Settings" > "AuthN Context" and click on "Create Attribute"
- Under "Name," enter `identity_pool_uuid`; under "Data type," select "string," and (optionally) under "Description," enter a description you can easily reference later, such as "Identity pool user uuid"
- Navigate to "Auth Settings" > "Tokens" and select the "Claims" tab
- In the "Claims list" section, select the "Access Tokens" tab, and click the "Add Claim" button
- Under "Claim name," enter `identity_pool_uuid`; under "Source type," make sure "AuthN Context" is selected; and under "Source path," select your newly created authN context attribute
- Navigate to the details of your Custom IDP, select the "Attributes" tab, and click on the "Add attribute" button
- Under "Attribute name," enter `user.id`; under "Display name," add a description such as "Identity pool user uuid," and select "string" as the data type
- Select the "Mappings" tab in your custom IDP details. If you just created this custom IDP for this tutorial, there should be no mappings configured yet, and a "Custom" option should be shown with a pair of fields that contain only a `.` symbol; use this option for the next step
- Under the "Source name" column, select your newly created name, and under the "Target Names" column, select your authN context attribute you created in the previous steps, then click "Save mappings"

Now, when you log in with your custom IDP, the access token will contain the `identity_pool_uuid` mapping, and the Node.js backend app will be able to call Identity Pool admin APIs with this value from the token.

Having configured everything we need on the ACP side, all that is left to do is configure the necessary environment variables in the frontend and backend apps.

- In the user auth React app codebase, go to `identity-pool-user-reference-ui-react/src/authConfig.js` and set the value of `customLoginEnabled` and `nodeJsBackendEnabled` to `true`
- In the Node.js backend app code base, go to `identity-pool-reference-ui-services-nodejs/README.md` and follow the instructions for populating the environment variables, installing the dependencies, and running the server.

With the frontend and backend apps configured and both dev servers running, you should now be able to login with the custom IDP we've set up, and perform all the available profile management operations.

## ACP setup (Admin app)

For the admin app, the IDP does not need to be associated with an Identity Pool. It can be the Cloudentity IDP you use to log into your ACP SaaS account, or it could be an external IDP, such as Microsoft or Google. In order for an admin to have access to the functionality of the admin app, however, the IDP must be set up in the Admin workspace in ACP.

This guide will not cover all IDP setup use cases for the admin app in detail. If you want to set up an Identity Pool as an IDP for the admin app, refer back to the **Basic ACP Configuration for the User Auth React App** section of this article for IDP/OAuth client setup. Just make sure you select the "Admin" workspace when following the directions.

If using a different type of IDP for the admin app, after setting it up, refer to the **Basic ACP Configuration for the User Auth React App** section of this article for OAuth client setup only, again making sure you are still in the "Admin" workspace.

After this configuration has been completed, go to `identity-pool-admin-reference-ui-react/README.md` for instructions on how to install the admin app dependencies, populate the ACP values you've configured in the app's environment variables, and run the app.

> **Note:** You do not need the Node.js backend app for the admin UI app.
