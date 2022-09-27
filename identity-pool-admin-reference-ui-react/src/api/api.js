import {base, authAppBase} from './api-base';
import authConfig from '../authConfig';
const identityAdminApiBase = `/identity/${authConfig.tenantId}/admin`;

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
  identifierPasswordLogin: (body) => authAppBase.post({url: 'identifierpassword', body})
};
