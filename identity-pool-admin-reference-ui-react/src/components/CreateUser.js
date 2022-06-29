import {useState} from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';

import {processPayloadSchema} from './Users';
import {useFormFactory} from './forms/formFactory';
import {validators} from './forms/validation';

export default function CreateUserDialog ({open, poolId, payloadSchema, handleClose, classes}) {

  const formFactory = useFormFactory({
    id: 'create-user',
    data: {},
    formIsActive: open
  });

  const customFields = processPayloadSchema(payloadSchema);

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
          <Typography variant="h5" component="h5">Create a User</Typography>
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
          name: 'email',
          label: 'Email',
          placeholder: 'Enter an email address...',
          validate: {
            validEmail: validators.validEmail({ label: 'Input' }),
          }
        })}

        {formFactory.createField({
          name: 'password',
          label: 'Password',
          toggleVisibility: true,
          defaultVisibility: false,
          validate: {
            minLength: validators.minLengthIfExists({ label: 'Password', min: 8 })
          }
        })}
        <div style={{marginBottom: 30}}>
          <span style={{fontWeight: 700}}>Note:</span> if password is left blank, the user will be sent an invitation to set up their password.
        </div>

        {!!customFields.length && (
          <>
            <div style={{fontWeight: 700, marginTop: 30, marginBottom: 20, textDecoration: 'underline'}}>
              Custom attributes:
            </div>
            {customFields.map((f, i) => {
              const label = f.description && f.description.length > 1 && `${f.description[0].toUpperCase()}${f.description.substring(1)}`;

              return (
                <>
                  {f.required ? (
                    <>
                      {f.enum && f.enum.length ? (
                        <>
                          {formFactory.createRequiredSelect({
                            key: i,
                            name: f.id,
                            label: label,
                            options: f.enum
                          })}
                        </>
                      ) : (
                        <>
                          {formFactory.createRequiredField({
                            key: i,
                            name: f.id,
                            label: label,
                            validate: {},
                          })}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {f.enum && f.enum.length ? (
                        <>
                          {formFactory.createSelect({
                            key: i,
                            name: f.id,
                            label: label,
                            options: f.enum
                          })}
                        </>
                      ) : (
                        <>
                          {formFactory.createField({
                            key: i,
                            name: f.id,
                            label: label,
                            validate: {},
                          })}
                        </>
                      )}
                    </>
                  )}
                </>
              );
            })}
          </>
        )}

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
