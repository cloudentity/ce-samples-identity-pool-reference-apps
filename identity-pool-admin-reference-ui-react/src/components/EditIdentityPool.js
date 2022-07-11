import {useState} from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Card from '@mui/material/Card';

import {useFormFactory} from './forms/formFactory';
import {validators} from './forms/validation';
import { omit } from 'ramda';

export default function EditPoolDialog ({open, poolId, poolData, handleClose, classes}) {
  console.log(poolData);

  const formFactory = useFormFactory({
    id: 'update-identity-pool',
    data: open ? poolData : {},
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
          <Typography variant="h5" component="h5">Edit Identity Pool</Typography>
        </div>

        {formFactory.createRequiredField({
          name: 'name',
          label: 'Name',
          placeholder: 'Enter a name...',
          validate: {
            onlyAlphanumeric: validators.onlyAlphanumeric({label: 'Name'})
          },
        })}

        {formFactory.createRequiredField({
          name: 'id',
          label: 'Identifier',
          placeholder: 'Enter an identifier...',
          validate: {},
          disabled: true
        })}

        {formFactory.createField({
          name: 'description',
          label: 'Description',
          placeholder: 'Enter an description...',
          validate: {},
        })}

        {formFactory.createAutocompleteField({
          name: 'authentication_mechanisms',
          label: 'Authentication Mechanisms',
          options: [
            'password',
            'otp',
          ],
          multiple: true,
          optional: false,
          validate: {
            notEmpty: validators.notEmpty({
              label: 'Authentication Mechanisms',
            }),
          },
        })}

        {formFactory.createCheckBox({
          name: "public_registration_allowed",
          label: "Public Registration Allowed",
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
