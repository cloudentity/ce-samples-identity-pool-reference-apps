import {useEffect, useState} from 'react';
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
import { omit, isEmpty } from 'ramda';

import authConfig from '../authConfig';

export default function ManageUserPermissionsDialog ({open, poolId, payloadSchema, userId, userData, userPermissions, handleClose, classes}) {

  const currentPermissionsIndexes = userPermissions.map((p, i) => i);
  const initialPermissionsState = isEmpty(currentPermissionsIndexes) ? [0] : currentPermissionsIndexes;

  const [permissions, setPermissions] = useState(initialPermissionsState);
  const [index, setIndex] = useState(initialPermissionsState.length);

  const resetState = () => {
    setPermissions(initialPermissionsState);
    setIndex(initialPermissionsState.length);
  }

  const registerExistingPermissionFields = () => {
    let counter = 0;
    return userPermissions.reduce((o, i) => {
      const fields = {
        [`permissions[${counter}].permission`]: i.permission,
        [`permissions[${counter}].resourceType`]: i.resourceType,
        [`permissions[${counter}].resourceValue`]: i.resourceValue,
      }
      counter += 1;
      return {...o, ...fields};
    }, {});
  };

  const formFactory = useFormFactory({
    id: 'manage-user-permissions',
    data: open ? {
      firstName: userData.firstName,
      lastName: userData.lastName,
      fullName: userData.fullName,
      ...omit(['firstName', 'lastName', 'fullName'], userData),
      ...registerExistingPermissionFields()
    } : {},
    formIsActive: open
  });

  const onAppendPermission = () => {
    setPermissions(currentPermissions => [...currentPermissions, index]);
    setIndex(currentIndex => currentIndex + 1);
  }

  const onRemovePermission = i => {
    setPermissions(currentPermissions => [...permissions.filter(p => ![permissions[i]].includes(p))]);
    formFactory.unregister(`permissions[${i}]`);
  };

  const processSubmit = (formData) => {
    const processedPermissions = (formData.permissions || []).filter(p => p);
    const processedFormData = {
      ...formData,
      ...{permissions: processedPermissions}
    }

    console.log('data submitted:', processedFormData);
    handleClose('confirm', processedFormData);
  };

  useEffect(() => {
    resetState();
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <div className={classes.dialogRootStyles}>
        <div style={{display: 'flex', justifyContent: 'space-around', marginBottom: 20}}>
          <Typography variant="h5" component="h5">Manage User Permissions</Typography>
        </div>

        {permissions.map((p, i) => (
          <div>
            <div style={{fontWeight: 700, marginBottom: 15}}>
              {`Permission ${i + 1}`}
            </div>
            <div>
              <div>
                {formFactory.createSelect({
                  name: `permissions[${p}].permission`,
                  label: 'Permission Name',
                  options: authConfig.mockPermissions
                })}
              </div>
              <div style={{marginTop: -30}}>
                {formFactory.createSelect({
                  name: `permissions[${p}].resourceType`,
                  label: 'Resource Type',
                  options: ['org'],
                  defaultValue: 'org'
                })}
              </div>
              <div style={{marginTop: -30}}>
                {formFactory.createRequiredField({
                  name: `permissions[${p}].resourceValue`,
                  label: 'Resource Value',
                  validate: {},
                })}
              </div>

              <div onClick={() => onRemovePermission(i)} style={{textDecoration: 'underline', marginTop: -8, marginBottom: 15}}>
                Remove
              </div>

              {permissions.at(i) !== permissions.at(-1) && (
                <div style={{height: 1, width: '100%', background: '#36C6AF', marginBottom: 15}}></div>
              )}
            </div>
          </div>
        ))}

        <div style={{marginTop: 25, marginBottom: 25}}>
          <Button
            fullWidth
            id="add-permission-button"
            variant="outlined"
            size="large"
            onClick={onAppendPermission}
          >
            Add Permission
          </Button>
        </div>

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
