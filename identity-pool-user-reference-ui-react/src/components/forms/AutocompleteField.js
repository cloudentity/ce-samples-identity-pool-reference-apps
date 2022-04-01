import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import { Controller } from 'react-hook-form';
import { pathOr } from 'ramda';

export default function AutocompleteField({
  id,
  form,
  name,
  label,
  hideLabel,
  helperText,
  labelIcon,
  labelCaption,
  placeholder,
  optional,
  style,
  options,
  ...props
}) {
  const { required, ...rest } = props.validate || {};

  const isOptional =
    optional !== undefined ? optional : !pathOr(false, ['validate', 'required'], props);

  const inputID = `${id}-${name}`;

  return (
    <div style={{ marginBottom: 20, ...style }}>
      {!hideLabel && (
        <InputLabel id={`${inputID}-label`} style={{marginBottom: 10}}>{label}</InputLabel>
      )}
      <FormControl
        style={{ width: '100%', ...(style || {}) }}
        error={!!pathOr('', ['errors', ...name.split('.')], form.formState)}
      >
        <Controller
          render={() => (
            <Autocomplete
              id={`${id}-${name}-checkbox`}
              value={form.watch(name)}
              onChange={(e, option) => {
                form.setValue(name, option, { shouldValidate: true });
              }}
              loading={props.loading}
              renderInput={params => (
                <TextField
                  {...params}
                  error={!!pathOr('', ['errors', ...name.split('.')], form.formState)}
                  variant="outlined"
                  placeholder={placeholder}
                  fullWidth
                  disabled={props.disabled}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {props.loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              filterSelectedOptions
              autoHighlight
              options={options}
              {...props}
            />
          )}
          name={name}
          rules={{ required, validate: rest }}
          control={form.control}
        />
        <FormHelperText id={`${id}-${name}-helper-text`} style={{ marginTop: 3 }}>
          {pathOr(helperText, ['errors', ...name.split('.'), 'message'], form.formState)}
        </FormHelperText>
      </FormControl>
    </div>
  );
}
