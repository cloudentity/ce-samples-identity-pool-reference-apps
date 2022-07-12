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

export default function CreateIdentityPoolDialog ({open, handleClose, classes}) {

  const formFactory = useFormFactory({
    id: 'create-identity-pool',
    data: {
      authentication_mechanisms: ['password'],
      public_registration_allowed: false
    },
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
          <Typography variant="h5" component="h5">Create an Identity Pool</Typography>
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
          label: 'Organization identifier',
          placeholder: 'Enter an identifier for the organization...',
          validate: {
            onlyAlphanumeric: validators.onlyAlphanumeric({label: 'Name'})
          },
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

        {formFactory.createField({
          name: 'location',
          label: 'Location',
          placeholder: 'Enter a location...',
          validate: {},
        })}

        {formFactory.createField({
          name: 'salesforceAccount',
          label: 'Salesforce account',
          placeholder: 'Enter a Salesforce account ID...',
          validate: {},
        })}

        {formFactory.createField({
          name: 'bp',
          label: 'BP',
          placeholder: 'Enter a BP value...',
          validate: {},
        })}

        {formFactory.createField({
          name: 'industry',
          label: 'Industry',
          placeholder: 'Enter an industry category...',
          validate: {},
        })}

        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          {formFactory.createFormFooter({
            onCancel: () => handleClose('cancel'),
            onSubmit: processSubmit,
            submitText: 'Create',
          })}
        </div>
      </div>
    </Dialog>
  );
};
