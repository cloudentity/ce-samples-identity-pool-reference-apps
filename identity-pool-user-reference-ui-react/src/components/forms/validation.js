import isEmail from 'validator/lib/isEmail';

const ALPHANUMERIC = /^[a-zA-Z0-9]+$/;
const UPPERCASE_ALPHANUMERIC = /^[A-Z0-9]+$/;

export const validators = {
  length:
    ({ label }) =>
    v =>
      v?.trim().length > 0 || `${label} is required`,
  minLength:
    ({ label, min = 1 }) =>
    v =>
      v?.trim().length >= min || `${label} minimum length is ${min} characters`,
  minLengthIfExists:
    ({ label, min = 1 }) =>
    v =>
      !v || v?.trim().length >= min || `${label} minimum length is ${min} characters`,
  maxLength:
    ({ label, max = 255 }) =>
    v =>
      v?.trim().length <= max || `${label} maximum length is ${max} characters`,
  validEmail:
    ({ label }) =>
    v =>
      !v || isEmail(v.trim()) || `${label} is not valid email`,
  validPhone:
    ({ label, required, selector }) =>
    () => {
      const input = document.querySelector(selector);
      const iti = window.intlTelInputGlobals.getInstance(input);
      if (!iti) return true;
      const number = iti.getNumber();
      return (
        (required && !number ? 'Phone value is required' : !number) ||
        iti.isValidNumber() ||
        `${label} is not valid phone number`
      );
    },
  notUniq:
    ({ label, options }) =>
    v =>
      options.indexOf(v.trim()) === -1 || `${label} with given value already exists`,
  oneOf:
    ({ label, options }) =>
    v =>
      options.indexOf(v) > -1 || `${label} must be one of: ${options.join(', ')}`,
  noDuplicatedElements:
    ({ label }) =>
    v => {
      const values = v.map(v => v.value);
      return new Set(values).size === values.length || `${label} has duplicated elements`;
    },
  onlyAlphanumeric:
    ({ label }) =>
    v =>
      ALPHANUMERIC.test(v.trim()) ||
      `${label} is not valid. Only alphanumeric characters are allowed a-zA-Z0-9`,
  onlyUppercaseAlphanumeric:
    ({ label }) =>
    v =>
      UPPERCASE_ALPHANUMERIC.test(v.trim()) ||
      `${label} is not valid. Only uppercase alphanumeric characters are allowed A-Z0-9`,
  notEmpty:
    ({ label }) =>
    v => {
      return (v && v.length !== 0) || `At least one value in the ${label} field is required`;
    },
};
