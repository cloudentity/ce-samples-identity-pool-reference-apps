import {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Dialog from '@mui/material/Dialog';
import Card from '@material-ui/core/Card';
import Checkbox from '@material-ui/core/Checkbox';

import {useFormFactory} from './forms/formFactory';
import {validators} from './forms/validation';

export default function SelfUpdateIdentityPoolUser ({open, handleClose, profileData, classes}) {

  const formFactory = useFormFactory({
    id: 'self-update-identity-pool-user',
    data: profileData,
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
          <Typography variant="h5" component="h5">Update your profile info</Typography>
        </div>

        {formFactory.createRequiredField({
          name: 'given_name',
          label: 'Given Name',
          placeholder: '',
          validate: {},
        })}

        {formFactory.createRequiredField({
          name: 'family_name',
          label: 'Family Name',
          placeholder: '',
          validate: {},
        })}

        {formFactory.createRequiredField({
          name: 'name',
          label: 'Full Name',
          placeholder: '',
          validate: {},
        })}

        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          {formFactory.createFormFooter({
            onCancel: () => handleClose('cancel'),
            onSubmit: processSubmit,
            submitText: 'Update',
          })}
        </div>
      </div>
    </Dialog>
  );
};
