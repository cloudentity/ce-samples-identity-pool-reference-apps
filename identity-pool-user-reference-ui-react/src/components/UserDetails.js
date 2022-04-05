import {useState, useEffect} from 'react';
import EditUserDialog from './EditUser';
import DeleteUserConfirmDialog from './DeleteUserConfirm';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { useQuery } from 'react-query';
import { api } from '../api/api';
import Progress from './Progress';
import authConfig from '../authConfig';

const useStyles = makeStyles((theme) => ({
  userDetailsHeader: {
    padding: 15,
    display: 'flex',
    justifyContent: 'space-between',
  },
  userDetailsContainer: {
    background: '#eefeef',
    width: 400,
    padding: 15
  },
  userDetailsItem: {
    display: 'flex',
    margin: '5px 0',
    justifyContent: 'space-between'
  },
  userDetailsItemKey: {
    fontWeight: 700
  },
  userDetailsItemValue: {
    fontWeight: 'normal'
  },
  editUserButtonContainer: {
    marginTop: 30,
    display: 'flex',
    justifyContent: 'center'
  },
  dialogRootStyles: {
    padding: 40,
    minWidth: 300
  }
}));

export default function UserDetails ({
  poolId,
  userId,
  refreshData,
  updateUserDialogOpen,
  handleOpenEditUserDialog,
  handleCloseUpdateUserDialog,
  deleteUserDialogOpen,
  handleOpenDeleteUserDialog,
  handleCloseDeleteUserDialog,
  onClose
}) {
  const classes = useStyles();

  const {
    isLoading: fetchUserDetailsProgress,
    error: fetchUserDetailsError,
    data: userDetailsRes
  } = useQuery(['fetchUserDetails', refreshData], () => api.fetchUserDetails(poolId, userId), {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: userDetailsRes => {
      console.log('user details response', userDetailsRes);
    }
  });

  const isLoading = fetchUserDetailsProgress;

  const missingInfoPlaceholder = 'N/A';

  const userDetails = userDetailsRes ? [
    {
      displayName: 'First Name',
      value: userDetailsRes.payload?.given_name || missingInfoPlaceholder
    },
    {
      displayName: 'Last Name',
      value: userDetailsRes.payload?.family_name || missingInfoPlaceholder
    },
    {
      displayName: 'Full Name',
      value: userDetailsRes.payload?.name || missingInfoPlaceholder
    },
    {
      displayName: 'ID',
      value: userDetailsRes.id || missingInfoPlaceholder
    },
    {
      displayName: 'Identifiers',
      value: (userDetailsRes.identifiers || []).map(i => i.identifier).join(', ') || 'no identifiers'
    },
    {
      displayName: 'Status',
      value: userDetailsRes.status || missingInfoPlaceholder
    },
    {
      displayName: 'Tenant ID',
      value: userDetailsRes.tenant_id || missingInfoPlaceholder
    },
    {
      displayName: 'Created',
      value: userDetailsRes.created_at || missingInfoPlaceholder
    },
    {
      displayName: 'Last modified',
      value: userDetailsRes.updated_at || missingInfoPlaceholder
    }
  ] : [];

  const editableUserDetails = {
    firstName: userDetailsRes?.payload?.given_name || '',
    lastName: userDetailsRes?.payload?.family_name || '',
    fullName: userDetailsRes?.payload?.name || ''
  };

  // useEffect(() => {
  //   if (editUserDialogOpen === false) {
  //     console.log('dialog closed');
  //   }
  // }, [editUserDialogOpen]);

  if (isLoading) {
    return <Progress/>;
  }

  return (
    <>
      <div className={classes.userDetailsHeader}>
        <Typography style={{marginTop: 8}} variant="h5" component="h3">User Details</Typography>
        <IconButton onClick={onClose} edge="start" color="inherit" aria-label="close" size="large">
          <CloseIcon />
        </IconButton>
      </div>
      <div className={classes.userDetailsContainer}>
        {userDetails.map((d, i) => (
          <div key={i} className={classes.userDetailsItem}>
            <div className={classes.userDetailsItemKey}>
              {d.displayName + ':'}
            </div>
            <div className={classes.userDetailsItemValue}>
              {d.value}
            </div>
          </div>
        ))}
      </div>
      <div className={classes.editUserButtonContainer}>
        <Button
          id="edit-user-details-button"
          variant="contained"
          size="large"
          onClick={() => handleOpenEditUserDialog()}
          style={{marginRight: 5}}
          sx={{
            width: 170,
            color: '#fff',
          }}
        >
          Edit User
        </Button>
        <Button
          id="delete-details-button"
          variant="contained"
          color="error"
          size="large"
          onClick={() => handleOpenDeleteUserDialog()}
          style={{marginLeft: 5}}
          sx={{
            width: 170,
            color: '#fff',
          }}
        >
          Delete User
        </Button>
        <EditUserDialog
          open={updateUserDialogOpen}
          handleClose={handleCloseUpdateUserDialog}
          userData={editableUserDetails}
          classes={classes}
        />
        <DeleteUserConfirmDialog
          open={deleteUserDialogOpen}
          handleClose={handleCloseDeleteUserDialog}
          classes={classes}
        />
      </div>
    </>
  )
};
