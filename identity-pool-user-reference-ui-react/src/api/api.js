import {acpBase, nodeAppBase, authAppBase} from './api-base';
import authConfig from '../authConfig';
const identityAdminApiBase = `/identity/${authConfig.tenantId}/${authConfig.authorizationServerId}`;
const identitySelfApiBase = `/${authConfig.tenantId}/${authConfig.authorizationServerId}/identity/self`;

export const api = {
  selfFetchProfile: () => acpBase.get({url: `${identitySelfApiBase}/me`}),
  selfUpdateProfile: (body) => acpBase.put({url: `${identitySelfApiBase}/me`, body}),
  fetchProfileCustomIdp: () => nodeAppBase.get({url: '/self/profile'}),
  updateProfileCustomIdp: (body) => nodeAppBase.put({url: '/self/profile', body}),
  changePasswordCustomIdp: (body) => nodeAppBase.post({url: '/self/changepassword', body}),
  fetchProfileSchema: () => nodeAppBase.get({url: '/user/schema'}),
  identifierPasswordLogin: (body) => authAppBase.post({url: 'identifierpassword', body})
};
