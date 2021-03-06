import { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import IdentityPools from './IdentityPools';
import Users from './Users';
import Progress from './Progress';

import { useQuery } from 'react-query';
import { api } from '../api/api';
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

  const adminViewEnabled = authConfig.authorizationServerId === 'admin';

  const [currentView, setCurrentView] = useState('users');

  const updateCurrentView = (view) => {
    if (view !== currentView) {
      setCurrentView(view);
    }
  };

  const leftNavItems = [
    {id: 'pools', label: 'Identity Pools'},
    {id: 'users', label: 'Users'}
  ];

  return (
    <>
      <Grid container sx={{ flexDirection: { xs: 'column', sm: 'column', md: 'row'} }} className={classes.root}>
        <Grid item xs={0} sm={0} md={2} style={{background: '#F7FAFF', padding: '16px 32px', borderRight: '1px solid #EAECF1'}}>
          <div className={classes.adminNavContainer}>
            {leftNavItems.map((n, i) => (
              <div
                key={i}
                style={{marginBottom: 20, textDecoration: currentView === n.id ? 'underline' : 'none'}}
                onClick={() => updateCurrentView(n.id)}
              >
               {n.label}
              </div>
            ))}
          </div>
        </Grid>
        {adminViewEnabled ? (
          <Grid item xs={0} sm={0} md={10} style={{background: '#FCFCFF', padding: '32px 32px 16px 32px'}}>
            {currentView === 'pools' && (
              <IdentityPools />
            )}
            {currentView === 'users' && (
              <Users />
            )}
          </Grid>
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
