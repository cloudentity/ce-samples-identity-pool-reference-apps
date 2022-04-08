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
import { omit } from 'ramda';

export default function EditUserDialog ({open, poolId, payloadSchema, userId, userData, handleClose, classes}) {

  const formFactory = useFormFactory({
    id: 'update-user',
    data: open ? {
      firstName: userData.firstName,
      lastName: userData.lastName,
      fullName: userData.fullName,
      ...omit(['firstName', 'lastName', 'fullName'], userData)
    } : {},
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
          name: 'fullName',
          label: 'Full name',
          validate: {},
        })}

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
                      {formFactory.createRequiredField({
                        key: i,
                        name: f.id,
                        label: label,
                        validate: {},
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
              );
            })}
          </>
        )}

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
