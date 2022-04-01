import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
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
  width,
  ...props
}) {
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
          placeholder={placeholder}
          onChange={onChange}
          disabled={!!disabled}
          {...form.register(name, {validate})}
          {...(defaultValue ? {defaultValue} : {})}
          error={activeError}
          variant="outlined"
          style={{width: width || 500}}
          {...props}
        />
        <FormHelperText id={`${inputID}-helper-text`} error={activeError}>
          {pathOr(externalErrors || helperText, ['errors', ...name.split('.'), 'message'], form.formState)}
        </FormHelperText>
      </FormControl>
    </div>
  );
};
