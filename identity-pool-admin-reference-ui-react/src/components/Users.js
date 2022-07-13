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
import jwt_decode from 'jwt-decode';
import authConfig from '../authConfig';
import { pick, pickBy, omit, isEmpty } from 'ramda';
import Progress from './Progress';

const useStyles = makeStyles((theme) => ({
  selectPoolInput: {
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 250,
    },
    [theme.breakpoints.up('md')]: {
      width: 400,
    },
  },
  createUserButton: {
    marginLeft: 15,
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

export const processPayloadSchema = (schema) => {
  const nonSystemSchemaProps = omit(['given_name', 'family_name', 'name'], schema?.properties || {});
  const reqdFields = schema?.required || [];
  let finalFields = [];
  for (const prop in nonSystemSchemaProps) {
    finalFields.push({
      ...nonSystemSchemaProps[prop],
      ...{
        id: prop,
        required: reqdFields.indexOf(prop) > -1
      }
    });
  }
  return finalFields;
};

export default function Users ({org, identityRole}) {
  const classes = useStyles();

  const idToken = window.localStorage.getItem(authConfig.idTokenName);
  const idTokenData = idToken ? jwt_decode(idToken) : {};

  const [currentPool, setCurrentPool] = useState(org || '');
  const [selectedUser, setSelectedUser] = useState([]);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [refreshList, initRefreshList] = useState(false);

  const handleSelectPool = (event) => {
    setCurrentPool(event.target.value);
  };

// LOAD POOLS
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

  const isSuperadmin = org === authConfig.superadminOrgId;
  const canSeeOwnPoolOnly = identityRole === 'list_users' || identityRole === 'user';

  const identityPools = identityPoolsRes?.pools.filter(p => !isEmpty(p.metadata) || p.id === authConfig.superadminOrgId) || [];
  const filteredPools = identityPools.filter(p => p.id === org || p.metadata?.parentOrg === org);
  const listOwnPoolOnly = identityPools.filter(p => p.id === org);
  const identityPoolOptions = isSuperadmin ? identityPools : (canSeeOwnPoolOnly ? listOwnPoolOnly : filteredPools);

  const isPoolListLoading = fetchIdentityPoolsProgress;

// LOAD USERS
  const {
    isLoading: fetchUsersInPoolProgress,
    error: fetchUsersInPoolError,
    data: usersInPoolRes
  } = useQuery(['fetchUsersInPool', currentPool, refreshList], () => api.fetchUsers(currentPool), {
    enabled: !!currentPool,
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: usersInPoolRes => {
      console.log('users response', usersInPoolRes);
    }
  });

  const users = usersInPoolRes?.users || [];
  const tableData = users.map(mapUsersToData);
  const isUserListLoading = fetchUsersInPoolProgress;

// LOAD USER DETAILS
  const {
    isLoading: fetchUserDetailsProgress,
    error: fetchUserDetailsError,
    data: userDetailsRes
  } = useQuery(['fetchUserDetails', refreshList], () => api.fetchUserDetails(currentPool, selectedUser[0]), {
    enabled: !!currentPool && !!selectedUser[0],
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: userDetailsRes => {
      console.log('user details response', userDetailsRes);
    }
  });

  const isUserDataLoading = fetchUserDetailsProgress;

// LOAD USERS PAYLOAD SCHEMA BY SELECTED POOL
  const currentPayloadSchemaId = identityPools.find(p => p.id === currentPool)?.payload_schema_id;

  const {
    isLoading: fetchPayloadSchemaProgress,
    error: fetchPayloadSchemaError,
    data: payloadSchemaRes
  } = useQuery(['fetchPayloadSchema', currentPool], () => api.fetchSchema(currentPayloadSchemaId), {
    enabled: !!currentPayloadSchemaId,
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: payloadSchemaRes => {
      console.log('payload schema response', payloadSchemaRes);
    }
  });

  const payloadSchema = payloadSchemaRes?.schema || {};

  const handleCloseCreateUserDialog = (action, data) => {
    if (action === 'cancel') {
      setCreateUserDialogOpen(false);
    }
    if (action === 'confirm') {
      const payload = {
        credentials: data.password ? [{type: 'password', password: data.password}] : [],
        identifiers: [{identifier: data.email, type: 'email'}],
        payload: {
          given_name: data.firstName,
          family_name: data.lastName,
          name: `${data.firstName} ${data.lastName}`,
          ...pickBy(f => !!f, omit(['firstName', 'lastName', 'name', 'email', 'password'], data))
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

  if (isPoolListLoading) {
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
            {identityPoolOptions.map((p, i) => (
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
        <>
          {isUserListLoading ? (
            <Progress/>
          ) : (
            <UsersTable
              data={tableData}
              poolId={currentPool}
              payloadSchema={payloadSchema}
              selectedUser={selectedUser}
              setSelectedUser={u => setSelectedUser(u)}
              userData={userDetailsRes}
              isUserDataLoading={isUserDataLoading}
              refreshData={refreshList}
              handleRefreshList={() => initRefreshList(!refreshList)}
              style={{marginTop: 24, height: 'calc(100% - 332px - 24px'}}
            />
          )}
        </>
      ) : (
        <div style={{marginTop: 80, textAlign: 'center'}}>Select an Identity Pool to see its users list</div>
      )}
      <CreateUserDialog
        open={createUserDialogOpen}
        poolId={currentPool}
        payloadSchema={payloadSchema}
        handleClose={handleCloseCreateUserDialog}
        classes={classes}
      />
    </>
  )
};
