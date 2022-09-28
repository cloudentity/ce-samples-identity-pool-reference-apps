import { Controller } from 'react-hook-form';

import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
// import {pathOr} from 'ramda';

export default function ChipsField({
  form,
  id,
  name,
  label,
  defaultValue = [],
  helperText = '',
  disabled,
  ...props
}) {
  const validNamesError = null;
  // const validNamesError = _.get(form.errors, name) || null;

  return (
    <>
      <InputLabel id={`${id}-${name}-label`} style={{marginBottom: 10}}>{label}</InputLabel>
      <FormControl variant="outlined" fullWidth style={{ marginBottom: 15 }}>
        <Controller
          name={name}
          control={form.control}
          rules={{
            validate: {
              validNames: value => value.every(v => v.trim().length < 255) || 'Value is too long',
            },
          }}
          render={({ field: { onChange, value } }) => (
            <Autocomplete
              multiple
              id={`${id}-${name}-tags-input`}
              freeSolo
              options={[]}
              value={value}
              onChange={(_, value) => {
                onChange(value);
              }}
              autoSelect
              renderInput={params => (
                <TextField
                  {...params}
                  variant="outlined"
                  style={{ width: '100%' }}
                  helperText={
                    (validNamesError && validNamesError.message) ||
                    'Enter one or more values. Press the \'enter\' key after adding each value.'
                  }
                  error={!!validNamesError && !!validNamesError.message}
                  id={`${id}-input`}
                />
              )}
              renderTags={(values, getTagProps) =>
                values.map((value, index) => (
                  <Chip label={value} {...getTagProps({ index })} />
                ))
              }
              {...props}
            />
          )}
        />
      </FormControl>
    </>
  );
}
