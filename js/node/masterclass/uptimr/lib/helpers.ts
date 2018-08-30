import * as crypto from 'crypto';
import config from '../config';

export const hash = (pass: string) =>
  pass.length > 0
    ? crypto
        .createHmac('sha256', config.hashingSecret)
        .update(pass)
        .digest('hex')
    : new Error('Failed creating a password hash');

export const validateTrimmedFn = (conditionFn) => (str) =>
  str && conditionFn(str.trim().length) ? str.trim() : false;

export const parseJSON=  (str: string) => {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
};
