import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {validators} from './validation';
import CommonTextField from './CommonTextField';
import AutocompleteField from './AutocompleteField';
import CheckBox from './CheckBox';
import FormFooter from './FormFooter';

export const useFormFactory = ({
  id,
  data = {},
  progress,
  formIsActive,
  mode = 'onSubmit'
}) => {
  const [submitDisabled, setSubmitDisabled] = useState(false);

  const form = useForm({
    defaultValues: data,
    mode
  });

  useEffect(() => {
    form.reset(data);
  }, [formIsActive]);

  const createRequiredField = ({validate = {}, ...props}) => (
    <CommonTextField
      validate={{
        length: validators.length({label: props.label}),
        maxLength: validators.maxLength({ label: props.label }),
        ...validate,
      }}
      id={id}
      form={form}
      disabled={progress || props.disabled}
      {...props}
    />
  );

  const createField = ({validate = {}, ...props}) => (
    <CommonTextField
      validate={{
        maxLength: validators.maxLength({ label: props.label }),
        ...validate,
      }}
      id={id}
      form={form}
      disabled={progress || props.disabled}
      {...props}
    />
  );

  const createAutocompleteField = props => (
    <AutocompleteField id={id} form={form} {...props} disabled={progress || props.disabled} />
  );

  const createCheckBox = props => (
    <CheckBox id={id} form={form} {...props} disabled={progress || props.disabled} />
  );

  const createFormFooter = (props) => (
    <FormFooter
      id={id}
      form={form}
      {...props}
      progress={progress || props.progress}
      disabled={submitDisabled || props.disabled}
    />
  );

  const setSubmitButtonDisabled = v => setSubmitDisabled(v);

  return {
    ...form,
    createRequiredField,
    createField,
    createAutocompleteField,
    createCheckBox,
    createFormFooter
  };
};
