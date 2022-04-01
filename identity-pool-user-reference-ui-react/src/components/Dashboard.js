import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IdentityPools from './IdentityPools';
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

  return (
    <>
      <Grid container className={classes.root}>
        <Grid item xs={2} style={{background: '#F7FAFF', padding: '16px 32px', borderRight: '1px solid #EAECF1'}}>
          <div>
            <div style={{marginBottom: 20, textDecoration: 'underline'}}>Identity Pools</div>
            <div>Users</div>
          </div>
        </Grid>
        <Grid item xs={10} style={{background: '#FCFCFF', padding: '32px 32px 16px 32px'}}>
          <IdentityPools />
        </Grid>
      </Grid>
    </>
  )
};
