import {useState, useEffect} from 'react';
import IdentityPoolsTable, {mapPoolsToData} from './IdentityPoolsTable';
import CreateIdentityPoolDialog from './CreateIdentityPool';
import Button from '@mui/material/Button';
import makeStyles from '@mui/styles/makeStyles';
import { useQuery } from 'react-query';
import { api } from '../api/api';
import Progress from './Progress';
import authConfig from '../authConfig';
import { pick } from 'ramda';

const useStyles = makeStyles((theme) => ({
  createIdentityPoolButton: {
    color: '#fff',
    background: theme.palette.primary.main,
    padding: '10px 20px',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  dialogRootStyles: {
    padding: 40,
    minWidth: 300
  },
  dialogInputContainer: {

  },
  dialogConfirmButton: {
    color: '#fff',
    background: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  dialogCancelButton: {

  }
}));

export default function IdentityPools () {
  const classes = useStyles();

  const [createPoolDialogOpen, setCreatePoolDialogOpen] = useState(false);
  const [refreshList, initRefreshList] = useState(false);

  const handleChangeCreatePoolDialogState = (action, data) => {
    if (action === 'cancel') {
      setCreatePoolDialogOpen(false);
    }
    if (action === 'confirm') {
      console.log('data', data)
      api.createIdentityPool({tenant_id: authConfig.tenantId, ...data})
      .then(() => {
        setCreatePoolDialogOpen(false);
        initRefreshList(!refreshList);
      })
      .catch((err) => {
        console.log('API error', err);
        window.alert('There was an error. Please try again.');
      });
    }
  };

  const {
    isLoading: fetchIdentityPoolsProgress,
    error: fetchIdentityPoolsError,
    data: identityPoolsRes
  } = useQuery(['fetchIdentityPools', refreshList], api.fetchIdentityPools, {
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: identityPoolsRes => {
      console.log('identity pools response', identityPoolsRes);
    }
  });

  const identityPools = identityPoolsRes?.pools || [];

  const tableData = identityPools.map(mapPoolsToData);

  const isLoading = fetchIdentityPoolsProgress;

  useEffect(() => {
    if (createPoolDialogOpen === false) {
      console.log('dialog closed');
    }
  }, [createPoolDialogOpen]);

  if (isLoading) {
    return <Progress/>;
  }

  return (
    <>
      {/* chart card here */}
      <div style={{display: 'flex', justifyContent: 'flex-end'}}>
        <Button color="primary" onClick={() => setCreatePoolDialogOpen(true)} className={classes.createIdentityPoolButton}>
          Create Identity Pool
        </Button>
      </div>
      <IdentityPoolsTable data={tableData} style={{marginTop: 24, height: 'calc(100% - 332px - 24px'}}/>
      <CreateIdentityPoolDialog
        open={createPoolDialogOpen}
        handleClose={handleChangeCreatePoolDialogState}
        classes={classes}
      />
    </>
  )
};
