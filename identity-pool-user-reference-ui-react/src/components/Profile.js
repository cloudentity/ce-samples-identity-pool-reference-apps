import { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import ReactJson from 'react-json-view';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import SelfUpdateIdentityPoolUser from './SelfUpdateIdentityPoolUser';
import SelfChangePassword from './SelfChangePassword';
import { pickBy } from 'ramda';
import { useQuery } from 'react-query';
import { api } from '../api/api';

import jwt_decode from 'jwt-decode';
import authConfig from '../authConfig';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  profileCard: {
    margin: '30px 0',
    padding: '10px 20px',
    width: 'calc(100vw - 80px)',
    [theme.breakpoints.up('sm')]: {
      padding: '30px 50px',
      width: 'calc(100vw - 300px)',
    }
  },
  buttonContainer: {
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  profileInfoContainer: {
    background: '#eefeef',
    width: 260,
    padding: 15,
    fontSize: '.8em',
    [theme.breakpoints.up('sm')]: {
      width: 300,
      fontSize: '.9em',
    },
    [theme.breakpoints.up('md')]: {
      width: 400,
      fontSize: '1em',
    }
  },
  profileInfoItem: {
    display: 'flex',
    margin: '5px 0',
    justifyContent: 'space-between'
  },
  profileInfoItemKey: {
    fontWeight: 700
  },
  profileInfoItemValue: {
    fontWeight: 'normal'
  },
  updateProfileButton: {
    color: '#fff',
    background: theme.palette.primary.main,
    padding: '10px 20px',
    marginLeft: 15,
    '&:hover': {
      color: theme.palette.primary.main,
    },
    [theme.breakpoints.down('md')]: {
      marginBottom: 10,
    },
  },
  dialogRootStyles: {
    padding: 16,
    minWidth: 270,
    [theme.breakpoints.up('sm')]: {
      padding: 40,
      minWidth: 300,
    },
    [theme.breakpoints.up('md')]: {
      padding: 40,
      minWidth: 500,
    }
  },
  dialogConfirmButton: {
    color: '#fff',
    background: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  formInput: {
    [theme.breakpoints.up('sm')]: {
      width: 450,
    },
    [theme.breakpoints.up('md')]: {
      width: 500,
    }
  },
  actionButtonsContainer: {
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  actionButtons: {
    [theme.breakpoints.down('sm')]: {
      marginTop: 15,
      width: '100%'
    }
  }
}));

const Profile = ({auth, handleLogout}) => {
  const classes = useStyles();

  const [updateProfileDialogOpen, setUpdateProfileDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [refreshProfile, initRefreshProfile] = useState(false);

  const fetchProfileApi = authConfig.customLoginEnabled ? api.fetchProfileCustomIdp : api.selfFetchProfile;

  const {
    isLoading: fetchProfileProgress,
    error: fetchProfileError,
    data: profileRes
  } = useQuery(['fetchProfile', refreshProfile], fetchProfileApi, {
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: profileRes => {
      console.log('profile response', profileRes);
    }
  });

  const {
    isLoading: fetchProfileSchemaProgress,
    error: fetchProfileSchemaError,
    data: profileSchemaRes
  } = useQuery(['fetchProfileSchema', refreshProfile], api.fetchProfileSchema, {
    enabled: authConfig.nodeJsBackendEnabled,
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: profileSchemaRes => {
      console.log('profile schema response', profileSchemaRes);
    }
  });

  const handleCloseUpdateProfileDialog = (action, data) => {
    if (action === 'cancel') {
      setUpdateProfileDialogOpen(false);
    }
    if (action === 'confirm') {
      const payload = {payload: pickBy(f => !!f, data)};
      const handleSuccess = () => {
        setUpdateProfileDialogOpen(false);
        initRefreshProfile(!refreshProfile);
      };
      const handleError = (err) => {
        console.log('API error', err);
        window.alert('There was an error. Please try again.');
      };

      if (authConfig.customLoginEnabled) {
        console.log('profile update', payload);
        api.updateProfileCustomIdp(payload)
        .then(() => handleSuccess())
        .catch(err => handleError(err));
      }
      if (!authConfig.customLoginEnabled) {
        api.selfUpdateProfile(payload)
        .then(() => handleSuccess())
        .catch(err => handleError(err));
      }
    }
  };

  const handleCloseChangePasswordDialog = (action, data) => {
    if (action === 'cancel') {
      setChangePasswordDialogOpen(false);
    }
    if (action === 'confirm') {
      api.changePasswordCustomIdp(data)
      .then(() => {
        setChangePasswordDialogOpen(false);
        initRefreshProfile(!refreshProfile);
      })
      .catch((err) => {
        console.log('API error', err);
        window.alert('There was an error. Please try again.');
      });
    }
  };

  // const {
  //   isLoading: fetchUserInfoProgress,
  //   error: fetchUserInfoError,
  //   data: userInfoRes
  // } = useQuery('fetchUserInfo', api.userinfo, {
  //   refetchOnWindowFocus: false,
  //   retry: false,
  //   onSuccess: userInfoRes => {
  //     console.log('user info response', userInfoRes);
  //   }
  // });

  const missingInfoPlaceholder = 'N/A';

  const processCustomAttributes = (schema, payload) => {
    return schema.map(attr => ({
      displayName: attr.description && attr.description.length > 1 && `${attr.description[0].toUpperCase()}${attr.description.substring(1)}`,
      value: payload[attr.id] || ''
    }));
  };

  const prepareUpdateProfileCustomAttributes = (schema, payload) => {
    return schema.reduce((acc, attr) => {
      if (payload[attr.id]) {
        return {...acc, ...{[attr.id]: payload[attr.id]}};
      }
      return acc;
    }, {});
  };

  const profile = profileRes ? [
    {
      displayName: 'First Name',
      value: profileRes.payload?.given_name || missingInfoPlaceholder
    },
    {
      displayName: 'Last Name',
      value: profileRes.payload?.family_name || missingInfoPlaceholder
    },
    {
      displayName: 'Full Name',
      value: profileRes.payload?.name || missingInfoPlaceholder
    },
    {
      displayName: 'ID',
      value: profileRes.id || missingInfoPlaceholder
    },
    {
      displayName: 'Identifiers',
      value: (profileRes.identifiers || []).map(i => i.identifier).join(', ') || 'no identifiers'
    },
    ...processCustomAttributes(profileSchemaRes || [], profileRes.payload || [])
  ] : [];

  const isLoading = fetchProfileProgress || fetchProfileSchemaProgress;

  const idToken = window.localStorage.getItem(authConfig.idTokenName);
  const idTokenData = idToken ? jwt_decode(idToken) : {};

  const accessToken = window.localStorage.getItem(authConfig.accessTokenName);
  const accessTokenData = accessToken ? jwt_decode(accessToken) : {};

  // console.log(idTokenData, idTokenData);

  return (
    <div className={classes.root}>
      <Card className={classes.profileCard}>
        <div className={classes.profileHeader}>
          <Typography variant="h5" component="h2">{profileRes?.payload?.name || ''}</Typography>
          <div className={classes.buttonContainer}>
            <Button color="primary" onClick={() => setUpdateProfileDialogOpen(true)} className={classes.updateProfileButton}>
              Update Profile
            </Button>
            {authConfig.customLoginEnabled && (
              <Button color="primary" onClick={() => setChangePasswordDialogOpen(true)} className={classes.updateProfileButton}>
                Change Password
              </Button>
            )}
          </div>
        </div>
        <div className={classes.profileInfoContainer}>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              {profile.map((p, i) => (
                <div key={i} className={classes.profileInfoItem}>
                  <div className={classes.profileInfoItemKey}>
                    {p.displayName + ':'}
                  </div>
                  <div className={classes.profileInfoItemValue}>
                    {p.value}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{marginTop: 20}}>
          <Typography>The contents of your OAuth Access token:</Typography>
        </div>
        <ReactJson style={{marginTop: 20}} src={accessTokenData} />
        <div style={{marginTop: 20}}>
          <Typography>The contents of your OAuth ID token:</Typography>
        </div>
        <ReactJson style={{marginTop: 20}} src={idTokenData} />
      </Card>
      {!isLoading && (
        <>
          <SelfUpdateIdentityPoolUser
            open={updateProfileDialogOpen}
            handleClose={handleCloseUpdateProfileDialog}
            customFields={profileSchemaRes}
            profileData={{
              given_name: profileRes?.payload?.given_name || '',
              family_name: profileRes?.payload?.family_name || '',
              name: profileRes?.payload?.name || '',
              ...prepareUpdateProfileCustomAttributes(profileSchemaRes || [], profileRes?.payload || [])
            }}
            classes={classes}
          />
          <SelfChangePassword
            open={changePasswordDialogOpen}
            handleClose={handleCloseChangePasswordDialog}
            classes={classes}
          />
        </>
      )}
    </div>
  );
};

export default Profile;
