import { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import IdentityPools from './IdentityPools';
import Users from './Users';
import { useQuery } from 'react-query';
import { api } from '../api/api';
import Progress from './Progress';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  }
}));

export default function Dashboard ({onConnectClick, onDisconnect, onReconnect}) {
  const classes = useStyles();

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
      <Grid container className={classes.root}>
        <Grid item xs={2} style={{background: '#F7FAFF', padding: '16px 32px', borderRight: '1px solid #EAECF1'}}>
          <div>
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
        <Grid item xs={10} style={{background: '#FCFCFF', padding: '32px 32px 16px 32px'}}>
          {currentView === 'pools' && (
            <IdentityPools />
          )}
          {currentView === 'users' && (
            <Users />
          )}
        </Grid>
      </Grid>
    </>
  )
};
