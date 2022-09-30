import {useState} from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Profile from './Profile';
import PageContent from './common/PageContent';
import PageToolbar from './common/PageToolbar';
import { includes, omit } from 'ramda';

import jwt_decode from 'jwt-decode';
import authConfig from '../authConfig';

import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient();


const Authorized = ({auth, handleLogout}) => {
  const idToken = window.localStorage.getItem(authConfig.idTokenName);
  const idTokenData = idToken ? jwt_decode(idToken) : {};

  const accessToken = window.localStorage.getItem(authConfig.accessTokenName);
  let accessTokenData;

  if (authConfig.env === 'dev') {
    const preMockAccessTokenData = accessToken ? jwt_decode(accessToken) : {};
    accessTokenData = omit(['identity_role'], {...preMockAccessTokenData, ...authConfig.mockAccessTokenData});
  } else {
    accessTokenData = accessToken ? jwt_decode(accessToken) : {};
  }

  const adminRoles = (Array.isArray(accessTokenData.roles) && accessTokenData.roles) || [];

  const canViewPoolsList = includes('superadmin', adminRoles)
    || includes('pools_admin', adminRoles)
    || includes('pools_read', adminRoles);

  // const adminViewEnabled = authConfig.authorizationServerId === 'admin';
  const adminViewEnabled = canViewPoolsList || includes('list_users', adminRoles);

  const [currentTab, setCurrentTab] = useState(adminViewEnabled ? 'admin' : 'profile');

  const handleTabChange = (id) => {
    setCurrentTab(id);
  }

  // console.log(idTokenData, idTokenData.iat);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <div>
          {auth === null && <div>Loading...</div>}
          {auth === false && <Navigate to='/' />}
          {auth && (
            <div style={{ position: 'relative' }}>
              <PageToolbar
                mode="main"
                tab={currentTab}
                adminViewEnabled={adminViewEnabled}
                authorizationServerId={authConfig.authorizationServerId}
                tenantId={'tenantId'}
                handleTabChange={handleTabChange}
                handleLogout={handleLogout}
              />
              <PageContent>
                {currentTab === 'admin' && (
                  <Dashboard
                    org={accessTokenData.org}
                    adminRoles={adminRoles}
                    adminViewEnabled={adminViewEnabled}
                    canViewPoolsList={canViewPoolsList}
                  />
                )}
                {currentTab === 'profile' && <Profile />}
              </PageContent>
            </div>
          )}
        </div>
      </QueryClientProvider>
    </>
  );
};

export default Authorized;
