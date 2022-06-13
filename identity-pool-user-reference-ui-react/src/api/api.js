import {acpBase, nodeAppBase} from './api-base';
import authConfig from '../authConfig';
const identityAdminApiBase = `/identity/${authConfig.tenantId}/${authConfig.authorizationServerId}`;
const identitySelfApiBase = `/${authConfig.tenantId}/${authConfig.authorizationServerId}/identity/self`;

export const api = {
  // Can only be called if user logged in with standard Identity Pool IDP
  selfFetchProfile: () => acpBase.get({url: `${identitySelfApiBase}/me`}),
  selfUpdateProfile: (body) => acpBase.put({url: `${identitySelfApiBase}/me`, body}),

  // Must be called if custom IDP/login page being used
  identifierPasswordLogin: (body) => nodeAppBase.post({url: '/authenticate/identifierpassword', body}),
  fetchProfileSchema: () => nodeAppBase.get({url: '/userschema'}),
  fetchProfileCustomIdp: () => nodeAppBase.get({url: '/self/profile'}),
  updateProfileCustomIdp: (body) => nodeAppBase.put({url: '/self/profile', body}),
  changePasswordCustomIdp: (body) => nodeAppBase.post({url: '/self/password/changepassword', body})
};
