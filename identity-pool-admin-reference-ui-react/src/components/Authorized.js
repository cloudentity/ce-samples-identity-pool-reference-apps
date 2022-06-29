import {useState} from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Profile from './Profile';
import PageContent from './common/PageContent';
import PageToolbar from './common/PageToolbar';

import jwt_decode from 'jwt-decode';
import authConfig from '../authConfig';

import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient();

const Authorized = ({auth, handleLogout}) => {
  const idToken = window.localStorage.getItem(authConfig.idTokenName);
  const idTokenData = idToken ? jwt_decode(idToken) : {};
  const adminViewEnabled = authConfig.authorizationServerId === 'admin';

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
                authorizationServerId={authConfig.authorizationServerId}
                tenantId={'tenantId'}
                handleTabChange={handleTabChange}
                handleLogout={handleLogout}
              />
              <PageContent>
                {currentTab === 'admin' && <Dashboard />}
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
