import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ReactJson from 'react-json-view';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import SelfUpdateIdentityPoolUser from './SelfUpdateIdentityPoolUser';
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
    padding: '30px 50px',
    width: 'calc(100vw - 300px)',
  },
  profileInfoContainer: {
    background: '#eefeef',
    width: 400,
    padding: 15
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
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  dialogRootStyles: {
    padding: 40,
    minWidth: 300
  },
  dialogConfirmButton: {
    color: '#fff',
    background: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.main,
    },
  }
}));

const Profile = ({auth, handleLogout}) => {
  const classes = useStyles();

  const [updateProfileDialogOpen, setUpdateProfileDialogOpen] = useState(false);
  const [refreshProfile, initRefreshProfile] = useState(false);

  const {
    isLoading: fetchProfileProgress,
    error: fetchProfileError,
    data: profileRes
  } = useQuery(['fetchProfile', refreshProfile], api.selfFetchProfile, {
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: profileRes => {
      console.log('profile response', profileRes);
    }
  });

  const handleCloseUpdateProfileDialog = (action, data) => {
    if (action === 'cancel') {
      setUpdateProfileDialogOpen(false);
    }
    if (action === 'confirm') {
      console.log('data', data)
      api.selfUpdateProfile({payload: data})
      .then(() => {
        setUpdateProfileDialogOpen(false);
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
    }
  ] : [];

  const isLoading = fetchProfileProgress;

  const idToken = window.localStorage.getItem(authConfig.idTokenName);
  const idTokenData = idToken ? jwt_decode(idToken) : {};

  const accessToken = window.localStorage.getItem(authConfig.accessTokenName);
  const accessTokenData = accessToken ? jwt_decode(accessToken) : {};

  console.log(idTokenData, idTokenData);

  return (
    <div className={classes.root}>
      <Card className={classes.profileCard}>
        <div className={classes.profileHeader}>
          <Typography variant="h5" component="h2">{profileRes?.payload?.name || ''}</Typography>
          <Button color="primary" onClick={() => setUpdateProfileDialogOpen(true)} className={classes.updateProfileButton}>
            Update Profile
          </Button>
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
          <Typography>{`The contents of your OAuth ID token:`}</Typography>
        </div>
        <ReactJson style={{marginTop: 20}} src={idTokenData} />
        <div style={{marginTop: 20}}>
          <Typography>{`The contents of your OAuth Access token:`}</Typography>
        </div>
        <ReactJson style={{marginTop: 20}} src={accessTokenData} />
      </Card>
      <SelfUpdateIdentityPoolUser
        open={updateProfileDialogOpen}
        handleClose={handleCloseUpdateProfileDialog}
        profileData={{
          given_name: profileRes?.payload?.given_name || '',
          family_name: profileRes?.payload?.family_name || '',
          name: profileRes?.payload?.name || ''
        }}
        classes={classes}
      />
    </div>
  );
};

export default Profile;
