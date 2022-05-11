import {base, acpBase, nodeAppBase, authAppBase} from './api-base';
import authConfig from '../authConfig';
const identityAdminApiBase = `/identity/${authConfig.tenantId}/${authConfig.authorizationServerId}`;
const identitySelfApiBase = `/${authConfig.tenantId}/${authConfig.authorizationServerId}/identity/self`;

export const api = {
  fetchIdentityPools: () => base.get({url: `${identityAdminApiBase}/pools`}),
  identityPoolDetails: (id) => base.get({url: `${identityAdminApiBase}/pools/${id}`}),
  createIdentityPool: (body) => base.post({url: `${identityAdminApiBase}/pools`, body}),
  editIdentityPool: (id, body) => base.put({url: `${identityAdminApiBase}/pools/${id}`, body}),
  fetchUsers: (poolId) => base.get({url: `${identityAdminApiBase}/pools/${poolId}/users`}),
  fetchUserDetails: (poolId, userId) => base.get({url: `${identityAdminApiBase}/pools/${poolId}/users/${userId}`}),
  createUser: (poolId, body) => base.post({url: `${identityAdminApiBase}/pools/${poolId}/users`, body}),
  updateUser: (poolId, userId, body) => base.put({url: `${identityAdminApiBase}/pools/${poolId}/users/${userId}`, body}),
  deleteUser: (poolId, userId) => base.delete({url: `${identityAdminApiBase}/pools/${poolId}/users/${userId}`}),
  fetchSchema: (schemaId) => base.get({url: `${identityAdminApiBase}/schemas/${schemaId}`}),
  selfFetchProfile: () => acpBase.get({url: `${identitySelfApiBase}/me`}),
  selfUpdateProfile: (body) => acpBase.put({url: `${identitySelfApiBase}/me`, body}),
  fetchProfile: () => nodeAppBase.get({url: '/profile'}),
  fetchProfileSchema: () => nodeAppBase.get({url: '/user/schema'}),
  identifierPasswordLogin: (body) => authAppBase.post({url: 'identifierpassword', body}),
  userinfo: () => acpBase.get({url: `/${authConfig.tenantId}/${authConfig.authorizationServerId}/userinfo`})
};
