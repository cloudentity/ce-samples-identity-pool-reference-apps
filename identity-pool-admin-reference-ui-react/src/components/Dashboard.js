import { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import IdentityPools from './IdentityPools';
import Users from './Users';
import Progress from './Progress';

import { useQuery } from 'react-query';
import { api } from '../api/api';
import jwt_decode from 'jwt-decode';
import authConfig from '../authConfig';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
  adminNavContainer: {
    marginTop: 20
  },
  notAdminMessageContainer: {
    width: '100%',
    textAlign: 'center'
  },
  notAdminMessageHeader: {
    fontSize: '2em',
    marginBottom: 20
  },
  inlineMonospace: {
    color: '#3c3da7',
    fontWeight: 700
  }
}));

export default function Dashboard ({onConnectClick, onDisconnect, onReconnect}) {
  const classes = useStyles();

  const accessToken = window.localStorage.getItem(authConfig.accessTokenName);
  let accessTokenData;

  if (authConfig.env === 'dev') {
    const preMockAccessTokenData = accessToken ? jwt_decode(accessToken) : {};
    accessTokenData = {...preMockAccessTokenData, ...authConfig.mockAccessTokenData};
  } else {
    accessTokenData = accessToken ? jwt_decode(accessToken) : {};
  }

  const canViewPoolsList = accessTokenData.identity_role === 'superadmin'
    || accessTokenData.identity_role === 'pools_admin'
    || accessTokenData.identity_role === 'pools_read';

  const adminViewEnabled = authConfig.authorizationServerId === 'admin';

  const [currentView, setCurrentView] = useState(canViewPoolsList ? 'pools' : 'users');

  const updateCurrentView = (view) => {
    if (view !== currentView) {
      setCurrentView(view);
    }
  };

  const leftNavItems = canViewPoolsList ? [
    {id: 'pools', label: 'Identity Pools'},
    {id: 'users', label: 'Users'}
  ] : [
    {id: 'users', label: 'Users'}
  ];

  return (
    <>
      <Grid container sx={{ flexDirection: { xs: 'column', sm: 'column', md: 'row'} }} className={classes.root}>
        <Grid item xs={0} sm={0} md={2} style={{background: '#F7FAFF', padding: '16px 32px', borderRight: '1px solid #EAECF1'}}>
          <div className={classes.adminNavContainer}>
            {accessTokenData.org && accessTokenData.identity_role && (
              <>
                {leftNavItems.map((n, i) => (
                  <div
                    key={i}
                    style={{marginBottom: 20, textDecoration: currentView === n.id ? 'underline' : 'none'}}
                    onClick={() => updateCurrentView(n.id)}
                  >
                   {n.label}
                  </div>
                ))}
              </>
            )}
          </div>
        </Grid>
        {adminViewEnabled ? (
          <>
            {accessTokenData.org && accessTokenData.identity_role ? (
              <Grid item xs={0} sm={0} md={10} style={{background: '#FCFCFF', padding: '32px 32px 16px 32px'}}>
                {currentView === 'pools' && canViewPoolsList && (
                  <IdentityPools org={accessTokenData.org} identityRole={accessTokenData.identity_role} />
                )}
                {currentView === 'users' && (
                  <Users org={accessTokenData.org} identityRole={accessTokenData.identity_role} />
                )}
              </Grid>
            ) : (
              <div className={classes.notAdminMessageContainer}>
                <div className={classes.notAdminMessageHeader}>You must configure ACP to view this demo.</div>
                <div>Make sure that the attributes <code className={classes.inlineMonospace}>org</code> and <code className={classes.inlineMonospace}>identity_role</code> are mapped in the access token before continuing.</div>
              </div>
            )}
          </>
        ) : (
          <div className={classes.notAdminMessageContainer}>
            <div className={classes.notAdminMessageHeader}>You are currently not signed in as an admin.</div>
            <div>Go to <code className={classes.inlineMonospace}>identity-pool-admin-reference-ui-react/src/authConfig.js</code></div>
            <div>and make sure the <code className={classes.inlineMonospace}>authorizationServerId</code> value is set to <code className={classes.inlineMonospace}>admin</code></div>
          </div>
        )}
      </Grid>
    </>
  )
};
