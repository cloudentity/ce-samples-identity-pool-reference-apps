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

import authConfig from '../authConfig';

export default function CreateIdentityPoolDialog ({open, handleClose, classes}) {

  const formFactory = useFormFactory({
    id: 'create-identity-pool',
    data: {
      authentication_mechanisms: ['password'],
      public_registration_allowed: false,
      isAuthenticationFederated: false
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
          <Typography variant="h5" component="h5">Create an Organization</Typography>
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

        {!authConfig.simplePoolCreateForm && (
          <>
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
          </>
        )}

        {formFactory.createCheckBox({
          name: "isAuthenticationFederated",
          label: "Is authentication federated",
        })}

        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 35}}>
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
