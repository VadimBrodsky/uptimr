import * as crypto from 'crypto';
import config from './config';

export const hash = (pass: string) =>
  pass.length > 0
    ? crypto
        .createHmac('sha256', config.hashingSecret)
        .update(pass)
        .digest('hex')
    : new Error('Failed creating a password hash');

type validateTrimmedFn = (
  confitionFn: (len: number) => boolean,
) => ((str: string) => string | false);

export const validateTrimmedFn: validateTrimmedFn = (conditionFn) => (str) =>
  str && conditionFn(str.trim().length) ? str.trim() : false;

export const parseJSON = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

export const createToken = (length: number) => {
  const characters: string = 'abcdefghijklmnopqrstuvwxyz1234567890';
  // cannot iterate over an empty array
  return Array.apply(null, Array(length))
    .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
    .join('');
};
