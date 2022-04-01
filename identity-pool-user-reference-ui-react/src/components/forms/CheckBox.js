import React, { useState } from 'react';
import { Controller } from 'react-hook-form';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';

export default function CheckBox({
  form,
  id,
  name,
  label,
  style = {},
  checkBoxProps = {},
  helperText,
  withConfirmation = false,
  confirmation = { title: '', content: '', confirmText: '' },
  ...props
}) {
  return (
    <div style={{ marginBottom: 32, width: '100%', ...style }}>
      <Controller
        render={() => {
          const CheckboxController = (
            <Checkbox
              checked={!!form.watch(name)}
              onChange={e => {
                const value = e.target.checked;
                props.onChange && props.onChange(e);
                form.setValue(name, value);
              }}
              disabled={props.disabled}
              {...checkBoxProps}
            />
          );

          return (
            <FormControlLabel
              id={`${id}-${name}-checkbox`}
              name={name}
              control={CheckboxController}
              label={label}
              {...props}
            />
          );
        }}
        name={name}
        control={form.control}
      />
      {helperText && <FormHelperText style={{ marginLeft: 28 }}>{helperText}</FormHelperText>}
    </div>
  );
};
