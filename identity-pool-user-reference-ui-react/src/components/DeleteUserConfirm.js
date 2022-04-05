import {useState} from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';

import {useFormFactory} from './forms/formFactory';
import {validators} from './forms/validation';

export default function DeleteUserConfirmDialog ({open, poolId, userId, userData, handleClose, classes}) {

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <div className={classes.dialogRootStyles}>
        <div style={{display: 'flex', justifyContent: 'space-around', marginBottom: 20}}>
          <Typography variant="h5" component="h5">Are you sure you want to delete the user?</Typography>
        </div>
        <div>
          This action cannot be undone.
        </div>
        <div className={classes.editUserButtonContainer}>
          <Button
            id="edit-user-details-button"
            variant="contained"
            size="large"
            onClick={() => handleClose('cancel')}
            style={{marginRight: 5}}
            sx={{
              width: 170,
              color: '#fff',
            }}
          >
            Cancel
          </Button>
          <Button
            id="delete-details-button"
            variant="contained"
            color="error"
            size="large"
            onClick={() => handleClose('confirm')}
            style={{marginLeft: 5}}
            sx={{
              width: 170,
              color: '#fff',
            }}
          >
            Delete User
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
