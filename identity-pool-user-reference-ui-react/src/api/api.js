import {base, acpBase, nodeAppBase} from './api-base';
import authConfig from '../authConfig';
const identityAdminApiBase = `/identity/${authConfig.tenantId}/${authConfig.authorizationServerId}`;
const identitySelfApiBase = `/${authConfig.tenantId}/${authConfig.authorizationServerId}/identity/self`;

export const api = {
  fetchIdentityPools: () => base.get({url: `${identityAdminApiBase}/pools`}),
  identityPoolDetails: (id) => base.get({url: `${identityAdminApiBase}/pools/${id}`}),
  createIdentityPool: (body) => base.post({url: `${identityAdminApiBase}/pools`, body}),
  editIdentityPool: (id, body) => base.put({url: `${identityAdminApiBase}/pools/${id}`, body}),
  selfFetchProfile: () => acpBase.get({url: `${identitySelfApiBase}/me`}),
  selfUpdateProfile: (body) => acpBase.put({url: `${identitySelfApiBase}/me`, body}),
  fetchProfile: () => nodeAppBase.get({url: '/profile'}),
  userinfo: () => acpBase.get({url: `/${authConfig.tenantId}/${authConfig.authorizationServerId}/userinfo`})
};
