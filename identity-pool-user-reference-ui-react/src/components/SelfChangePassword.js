import {useState} from 'react';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';

import {useFormFactory} from './forms/formFactory';
import {validators} from './forms/validation';

export default function SelfChangePassword ({open, handleClose, classes}) {

  const formFactory = useFormFactory({
    id: 'self-change-password',
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

        {formFactory.createField({
          name: 'old_password',
          label: 'Current Password',
          toggleVisibility: true,
          defaultVisibility: false,
          validate: {
            minLength: validators.minLengthIfExists({ label: 'Password', min: 8 })
          }
        })}

        {formFactory.createField({
          name: 'new_password',
          label: 'New Password',
          toggleVisibility: true,
          defaultVisibility: false,
          validate: {
            minLength: validators.minLengthIfExists({ label: 'Password', min: 8 })
          }
        })}

        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          {formFactory.createFormFooter({
            onCancel: () => handleClose('cancel'),
            onSubmit: processSubmit,
            submitText: 'Submit',
            formFooterContainerClass: classes.actionButtonsContainer,
            className: classes.actionButtons
          })}
        </div>
      </div>
    </Dialog>
  );
};
