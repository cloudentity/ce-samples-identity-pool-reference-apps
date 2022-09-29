import { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import IdentityPools from './IdentityPools';
import Users from './Users';
import Progress from './Progress';

import { useQuery } from 'react-query';
import { api } from '../api/api';
import jwt_decode from 'jwt-decode';
import authConfig from '../authConfig';
import { includes, omit } from 'ramda';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
  adminNavGrid: {
    background: '#F7FAFF',
    borderRight: '1px solid #EAECF1',
    padding: '16px 40px',
    [theme.breakpoints.up('lg')]: {
      padding: '16px 1.5%',
    },
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
    accessTokenData = omit(['identity_role'], {...preMockAccessTokenData, ...authConfig.mockAccessTokenData});
  } else {
    accessTokenData = accessToken ? jwt_decode(accessToken) : {};
  }

  const adminRoles = (Array.isArray(accessTokenData.roles) && accessTokenData.roles) || [];

  const canViewPoolsList = includes('superadmin', adminRoles)
    || includes('pools_admin', adminRoles)
    || includes('pools_read', adminRoles);

  // const adminViewEnabled = authConfig.authorizationServerId === 'admin';
  const adminViewEnabled = true;

  const [currentView, setCurrentView] = useState(canViewPoolsList ? 'pools' : 'users');

  const updateCurrentView = (view) => {
    if (view !== currentView) {
      setCurrentView(view);
    }
  };

  const leftNavItems = canViewPoolsList ? [
    {id: 'pools', label: 'Orgs', icon: (<WorkIcon />)},
    {id: 'users', label: 'Users', icon: (<PersonIcon />)}
  ] : [
    {id: 'users', label: 'Users', icon: (<PersonIcon />)}
  ];

  return (
    <>
      <Grid container sx={{ flexDirection: { xs: 'column', sm: 'column', md: 'row'} }} className={classes.root}>
        <Grid item xs={0} sm={0} md={2} lg={1} className={classes.adminNavGrid}>
          <div className={classes.adminNavContainer}>
            {accessTokenData.org && adminRoles.length > 0 && (
              <>
                {leftNavItems.map((n, i) => (
                  <div style={{display: 'flex'}}>
                    {n.icon}
                    <div
                      key={i}
                      style={{marginBottom: 20, marginLeft: 10, lineHeight: 1.6, textDecoration: currentView === n.id ? 'underline' : 'none'}}
                      onClick={() => updateCurrentView(n.id)}
                    >
                     {n.label}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </Grid>
        {adminViewEnabled ? (
          <>
            {accessTokenData.org && adminRoles.length > 0 ? (
              <Grid item xs={0} sm={0} md={10} lg={11} style={{background: '#FCFCFF', padding: '32px 32px 16px 32px'}}>
                {currentView === 'pools' && canViewPoolsList && (
                  <IdentityPools org={accessTokenData.org} identityRoles={adminRoles} />
                )}
                {currentView === 'users' && (
                  <Users org={accessTokenData.org} identityRoles={adminRoles} />
                )}
              </Grid>
            ) : (
              <div className={classes.notAdminMessageContainer}>
                <div className={classes.notAdminMessageHeader}>You must configure ACP to view this demo.</div>
                <div>Make sure that the attributes <code className={classes.inlineMonospace}>org</code> and <code className={classes.inlineMonospace}>roles</code> are mapped in the access token before continuing.</div>
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
