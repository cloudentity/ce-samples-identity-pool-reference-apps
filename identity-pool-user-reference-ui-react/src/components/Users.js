import {useState, useEffect} from 'react';
import UsersTable, {mapUsersToData} from './UsersTable';
import CreateUserDialog from './CreateUser';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import { useQuery } from 'react-query';
import { api } from '../api/api';
import Progress from './Progress';
import authConfig from '../authConfig';

const useStyles = makeStyles((theme) => ({
  selectPoolInput: {
    width: 400
  },
  createUserButton: {
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

function UsersWithSelectedPool ({pool, refreshList, handleRefreshList}) {
  const {
    isLoading: fetchUsersInPoolProgress,
    error: fetchUsersInPoolError,
    data: usersInPoolRes
  } = useQuery(['fetchUsersInPool', pool, refreshList], () => api.fetchUsers(pool), {
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: usersInPoolRes => {
      console.log('users response', usersInPoolRes);
    }
  });

  const users = usersInPoolRes?.users || [];

  const tableData = users.map(mapUsersToData);

  const isLoading = fetchUsersInPoolProgress;

  if (isLoading) {
    return <Progress/>;
  }

  return (
    <UsersTable
      data={tableData}
      poolId={pool}
      refreshData={refreshList}
      handleRefreshList={handleRefreshList}
      style={{marginTop: 24, height: 'calc(100% - 332px - 24px'}}
    />
  );
};

export default function Users () {
  const classes = useStyles();

  const [currentPool, setCurrentPool] = useState('');
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [refreshList, initRefreshList] = useState(false);

  const handleSelectPool = (event) => {
    setCurrentPool(event.target.value);
  };

  const handleChangeCreateUserDialogState = (action, data) => {
    if (action === 'cancel') {
      setCreateUserDialogOpen(false);
    }
    if (action === 'confirm') {
      console.log('data', data)
      const payload = {
        credentials: data.password ? [{type: 'password', password: data.password}] : [],
        identifiers: [{identifier: data.email, type: 'email'}],
        payload: {
          given_name: data.firstName,
          family_name: data.lastName,
          name: `${data.firstName} ${data.lastName}`
        },
        status: data.password ? 'active' : 'new'
      };
      api.createUser(currentPool, payload)
      .then(() => {
        setCreateUserDialogOpen(false);
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
  } = useQuery('fetchIdentityPools', api.fetchIdentityPools, {
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: identityPoolsRes => {
      console.log('identity pools response', identityPoolsRes);
    }
  });

  const identityPools = identityPoolsRes?.pools || [];

  const isLoading = fetchIdentityPoolsProgress;

  useEffect(() => {
    if (createUserDialogOpen === false) {
      console.log('dialog closed');
    }
  }, [createUserDialogOpen]);

  if (isLoading) {
    return <Progress/>;
  }

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <FormControl className={classes.selectPoolInput}>
          <InputLabel id="select-identity-pool-label">Identity Pools</InputLabel>
          <Select
            labelId="select-identity-pool-label"
            id="select-identity-pool-input"
            value={currentPool}
            label="Identity Pools"
            onChange={handleSelectPool}
          >
            {identityPools.map((p, i) => (
              <MenuItem key={i} value={p.id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {currentPool && (
          <Button color="primary" onClick={() => setCreateUserDialogOpen(true)} className={classes.createUserButton}>
            Create User
          </Button>
        )}
      </div>
      {currentPool ? (
        <UsersWithSelectedPool pool={currentPool} refreshList={refreshList} handleRefreshList={() => initRefreshList(!refreshList)} />
      ) : (
        <div style={{marginTop: 80, textAlign: 'center'}}>Select an Identity Pool to see its users list</div>
      )}
      <CreateUserDialog
        open={createUserDialogOpen}
        poolId={currentPool}
        handleClose={handleChangeCreateUserDialogState}
        classes={classes}
      />
    </>
  )
};
