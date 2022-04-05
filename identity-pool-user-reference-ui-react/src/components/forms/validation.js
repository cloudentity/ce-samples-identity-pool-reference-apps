import isBase64 from 'validator/lib/isBase64';
import isEmail from 'validator/lib/isEmail';
import isFQDN from 'validator/lib/isFQDN';
import isNumeric from 'validator/lib/isNumeric';
import isURL from 'validator/lib/isURL';

const ID_PATTERN = /^[a-z0-9=._-]+$/;
const ALPHANUMERIC = /^[a-zA-Z0-9]+$/;
const UPPERCASE_ALPHANUMERIC = /^[A-Z0-9]+$/;

function parseDuration(value) {
  const {
    groups: { hours, minutes, seconds },
  } = /^((?<hours>[0-9]+)h)?((?<minutes>[0-9]+)m)?((?<seconds>[0-9]+)s)?$/.exec(value);
  const h = hours ? parseInt(hours, 10) : 0;
  const m = minutes ? parseInt(minutes, 10) : 0;
  const s = seconds ? parseInt(seconds, 10) : 0;

  return 60 * 60 * h + 60 * m + s;
}

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
  validURL:
    ({ label, options = {} }) =>
    v =>
      !v ||
      isURL(v.trim(), {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_tld: false,
        ...options,
      }) ||
      `${label} is not valid url`,
  validHttpsURL:
    ({ label }) =>
    v =>
      !v ||
      isURL(v.trim(), { protocols: ['https'], require_protocol: true, require_tld: false }) ||
      `${label} is not valid url with https protocol`,
  isUrlSafe:
    ({ label }) =>
    v =>
      !v || isBase64(v.trim(), { urlSafe: true }) || `${label} contains not URL safe characters`,
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
  validID:
    ({ label }) =>
    v =>
      ID_PATTERN.test(v.trim()) ||
      `${label} is not valid ID. Only following characters are allowed a-z0-9=._-`,
  isJSON:
    ({ label }) =>
    v => {
      try {
        JSON.parse(v);
        return true;
      } catch (e) {
        return `${label} is not valid JSON object`;
      }
    },
  notUniq:
    ({ label, options }) =>
    v =>
      options.indexOf(v.trim()) === -1 || `${label} with given value already exists`,
  oneOf:
    ({ label, options }) =>
    v =>
      options.indexOf(v) > -1 || `${label} must be one of: ${options.join(', ')}`,
  validURLExtension:
    ({ type, extensions }) =>
    v =>
      !v ||
      extensions.some(ext => v.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) ||
      `Supported ${type} formats: ${extensions.map(v => v.toUpperCase()).join(', ')}.`,
  validDomain:
    ({ label }) =>
    v =>
      isFQDN(v.trim()) ||
      `${label} is not a valid domain${
        /^http(s?):\/\//.test(v.trim()) ? ' - http(s):// prefix not allowed' : ''
      }`,
  validDomains:
    ({ label }) =>
    v =>
      !v || v.every(domain => isFQDN(domain.value.trim())) || `${label} contain not a valid domain`,
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
  validTTL:
    ({ label }) =>
    v =>
      !['0s', '0h0m0s'].includes(v) || `Non-zero ${label} is required`,
  inRangeDuration:
    ({ label, min, max }) =>
    v => {
      const seconds = parseDuration(v);
      const minSeconds = parseDuration(min);
      const maxSeconds = parseDuration(max);

      if (seconds < minSeconds) {
        return `${label} must be greater than ${min}`;
      } else if (seconds > maxSeconds) {
        return `${label} must be less than ${max}`;
      }
      return true;
    },
  inRange:
    ({ label, min, max }) =>
    v =>
      (v >= min && v <= max) || `${label} must be a value between ${min} and ${max}`,
  validNumeric:
    ({ label, min = undefined, max = undefined }) =>
    v => {
      if (!v) {
        return true;
      } else if (isNumeric(v.trim())) {
        const num = parseInt(v);
        if (min !== undefined && num < min) {
          return `${label} min value is ${min}`;
        }
        if (max !== undefined && num > max) {
          return `${label} max value is ${max}`;
        }
        return true;
      } else {
        return `${label} is not a valid number`;
      }
    },
};
