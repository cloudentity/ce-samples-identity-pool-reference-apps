import { Controller } from 'react-hook-form';

import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { pathOr } from 'ramda';

export default function SelectField({
  validate,
  id,
  form,
  name,
  label,
  hideLabel,
  options,
  defaultValue = '',
  helperText = '',
  optional,
  onChange,
  style = {},
  ...props
}) {
  const inputID = `${id}-${name}`;

  return (
    <div style={{ marginBottom: 20, ...style }}>
      {!hideLabel && (
        <InputLabel id={`${inputID}-label`} style={{marginBottom: 10}}>{label}</InputLabel>
      )}
      <FormControl
        variant="outlined"
        fullWidth
        error={!!pathOr(null, ['errors', ...name.split('.')], form.formState)}
        style={{ marginBottom: 32 }}
      >
        <Controller
          render={() => (
            <Select
              id={id}
              onChange={e => {
                if (typeof onChange === 'function') {
                  onChange(e.target.value);
                }
                form.setValue(name, e.target.value);
              }}
              value={form.watch(name)}
              name={name}
              displayEmpty={props.displayEmpty}
              disabled={props.disabled}
              inputProps={props['inputProps']}
            >
              {(options || []).map((option, i) => (
                <MenuItem
                  key={`select-option-${option.value || (option && typeof option === 'string' ? option : i)}`}
                  value={option.value || option}
                  disabled={option.disabled || false}
                >
                  {option.name || option}
                </MenuItem>
              ))}
            </Select>
          )}
          rules={{ ...validate }}
          control={form.control}
          name={name}
          defaultValue={defaultValue}
        />
        <FormHelperText id={`${id}-helper-text`}>
          {pathOr(helperText, ['errors', ...name.split('.'), 'message'], form.formState)}
        </FormHelperText>
      </FormControl>
    </div>
  );
};
