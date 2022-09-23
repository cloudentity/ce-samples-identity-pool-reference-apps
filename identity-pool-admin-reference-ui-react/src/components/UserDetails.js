import EditUserDialog from './EditUser';
import ManageUserPermissionsDialog from './ManageUserPermissions';
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
import { processPayloadSchema } from './Users';
import { omit } from 'ramda';
import Progress from './Progress';

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
  isLoading,
  poolId,
  availablePoolsForPermissions,
  payloadSchema,
  userId,
  userData,
  refreshData,
  updateUserDialogOpen,
  handleOpenEditUserDialog,
  handleCloseUpdateUserDialog,
  manageUserPermissionsDialogOpen,
  handleOpenManageUserPermissionsDialog,
  handleCloseManageUserPermissionsDialog,
  deleteUserDialogOpen,
  handleOpenDeleteUserDialog,
  handleCloseDeleteUserDialog,
  onClose
}) {
  const classes = useStyles();

  const missingInfoPlaceholder = 'N/A';

  const userDetails = userData ? [
    {
      displayName: 'First Name',
      value: userData.payload?.given_name || missingInfoPlaceholder
    },
    {
      displayName: 'Last Name',
      value: userData.payload?.family_name || missingInfoPlaceholder
    },
    {
      displayName: 'Full Name',
      value: userData.payload?.name || missingInfoPlaceholder
    },
    {
      displayName: 'ID',
      value: userData.id || missingInfoPlaceholder
    },
    {
      displayName: 'Identifiers',
      value: (userData.identifiers || []).map(i => i.identifier).join(', ') || 'no identifiers'
    },
    {
      displayName: 'Status',
      value: userData.status || missingInfoPlaceholder
    },
    {
      displayName: 'Tenant ID',
      value: userData.tenant_id || missingInfoPlaceholder
    },
    {
      displayName: 'Created',
      value: userData.created_at || missingInfoPlaceholder
    },
    {
      displayName: 'Last modified',
      value: userData.updated_at || missingInfoPlaceholder
    }
  ] : [];

  const customDisplayUserData = userData ? processPayloadSchema(payloadSchema).map(f => ({
    displayName: f.description && f.description.length > 1 && `${f.description[0].toUpperCase()}${f.description.substring(1)}`,
    value: (userData.payload && userData.payload[f.id]) || ''
  })) : [];

  const customEditableUserData = userData && processPayloadSchema(payloadSchema)
    .map(f => ({ [f.id]: (userData.payload && userData.payload[f.id]) || '' }))
    .reduce((o, i) => ({...o, ...i}), {});

  const editableUserDetails = {
    firstName: userData?.payload?.given_name || '',
    lastName: userData?.payload?.family_name || '',
    fullName: userData?.payload?.name || '',
    ...customEditableUserData
  };

  const userPermissions = userData?.payload?.permissions || [];

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
        {!!customDisplayUserData.length && (
          <>
            <div style={{fontWeight: 700, marginTop: 20, marginBottom: 10, textDecoration: 'underline'}}>
              Custom attributes:
            </div>
            {customDisplayUserData.map((d, i) => (
              <div key={i} className={classes.userDetailsItem}>
                <div className={classes.userDetailsItemKey}>
                  {d.displayName + ':'}
                </div>
                <div className={classes.userDetailsItemValue}>
                  {d.value}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <div style={{width: '85%', margin: '25px auto 0 auto' }}>
        <Button
          fullWidth
          id="manage-permissions-button"
          variant="contained"
          size="large"
          onClick={() => handleOpenManageUserPermissionsDialog()}
          style={{marginLeft: 5}}
          sx={{
            color: '#fff',
          }}
        >
          Manage User Permissions
        </Button>
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
          payloadSchema={payloadSchema}
          userData={editableUserDetails}
          userPermissions={userPermissions}
          classes={classes}
        />
        <ManageUserPermissionsDialog
          open={manageUserPermissionsDialogOpen}
          handleClose={handleCloseManageUserPermissionsDialog}
          userData={editableUserDetails}
          userPermissions={userPermissions}
          availablePoolsForPermissions={availablePoolsForPermissions}
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
