import {useState} from 'react';
import { Navigate } from 'react-router-dom';
import Profile from './Profile';
import PageContent from './common/PageContent';
import PageToolbar from './common/PageToolbar';

import jwt_decode from 'jwt-decode';
import authConfig from '../authConfig';

import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient();

const Authorized = ({auth, handleLogout}) => {

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
                tab={'profile'}
                tenantId={'tenantId'}
                handleLogout={handleLogout}
              />
              <PageContent>
                <Profile />
              </PageContent>
            </div>
          )}
        </div>
      </QueryClientProvider>
    </>
  );
};

export default Authorized;
