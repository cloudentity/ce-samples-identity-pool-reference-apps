import { useState } from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {pathOr} from 'ramda';

export default function CommonTextField({
  validate,
  form,
  id,
  name,
  label,
  labelIcon,
  hideLabel,
  defaultValue = '',
  placeholder = '',
  helperText = '',
  disabled,
  externalErrors = null,
  style,
  onChange = () => {},
  optional,
  defaultVisibility = true,
  toggleVisibility,
  width,
  ...props
}) {
  const [visibility, setVisibility] = useState(defaultVisibility);

  const isOptional = optional !== undefined ? optional : !(validate && validate.length);

  const inputID = `${id}-${name}`;

  const activeError = !!pathOr(externalErrors, ['errors', ...name.split('.')], form.formState);

  return (
    <div style={{ marginBottom: 20, ...style }}>
      {!hideLabel && (
        <InputLabel id={`${inputID}-label`} style={{marginBottom: 10}}>{label}</InputLabel>
      )}
      <FormControl>
        <TextField
          id={`${inputID}-input`}
          name={name}
          type={props.type || (visibility ? 'text' : 'password')}
          placeholder={placeholder}
          onChange={onChange}
          disabled={!!disabled}
          {...form.register(name, {validate})}
          {...(defaultValue ? {defaultValue} : {})}
          error={activeError}
          variant="outlined"
          style={{width: width || 500}}
          InputProps={{
            endAdornment: (
              <InputAdornment
                position="end"
                style={{opacity: 0.6}}
              >
                {toggleVisibility && (
                  <IconButton
                    aria-label="toggle password visibility"
                    tabIndex={-1}
                    onClick={() => setVisibility(!visibility)}
                    size="large"
                  >
                    {visibility ? (
                      <Visibility />
                    ) : (
                      <VisibilityOff />
                    )}
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
          {...props}
        />
        <FormHelperText id={`${inputID}-helper-text`} error={activeError}>
          {pathOr(externalErrors || helperText, ['errors', ...name.split('.'), 'message'], form.formState)}
        </FormHelperText>
      </FormControl>
    </div>
  );
};
