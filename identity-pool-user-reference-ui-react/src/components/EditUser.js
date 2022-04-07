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

export default function EditUserDialog ({open, poolId, userId, userData, handleClose, classes}) {

  const formFactory = useFormFactory({
    id: 'create-user',
    data: open ? {
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: userData.fullName,
    } : {},
    formIsActive: open
  });

  const processSubmit = (formData) => {
    handleClose('confirm', formData);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <div className={classes.dialogRootStyles}>
        <div style={{display: 'flex', justifyContent: 'space-around', marginBottom: 20}}>
          <Typography variant="h5" component="h5">Edit User</Typography>
        </div>

        {formFactory.createRequiredField({
          name: 'firstName',
          label: 'First name',
          validate: {},
        })}

        {formFactory.createRequiredField({
          name: 'lastName',
          label: 'Last name',
          validate: {},
        })}

        {formFactory.createRequiredField({
          name: 'name',
          label: 'Full name',
          validate: {},
        })}

        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          {formFactory.createFormFooter({
            onCancel: () => handleClose('cancel'),
            onSubmit: processSubmit,
            submitText: 'Submit',
          })}
        </div>
      </div>
    </Dialog>
  );
};
