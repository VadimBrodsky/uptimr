import config from '../lib/config';
import { create, destroy, read, update } from '../lib/data';
import { createToken, validateTrimmedFn } from '../lib/helpers';
import { loggedInUser } from './users';

type Tprotocol = 'http' | 'https';
type Tmethod = 'post' | 'get' | 'put' | 'delete';

interface IpostPayload {
  protocol: Tprotocol;
  url: string;
  method: Tmethod;
  successCodes: [number];
  timeoutSeconds: number;
}

interface Iheaders {
  token: string;
}

const validateProtocol = (protocol: Tprotocol) =>
  ['http', 'https'].includes(protocol) ? protocol : false;

const validateUrl = (url: string) => validateTrimmedFn((len) => len > 0)(url);

const validateMethod = (method: Tmethod) =>
  ['post', 'get', 'put', 'delete'].includes(method) ? method : false;

const validateSuccessCodes = (codes: [number]) => (codes.length > 0 ? codes : false);

const validateTimeoutSeconds = (seconds: number) =>
  seconds % 1 === 0 && seconds > 0 ? seconds : false;

export default {
  post({ payload, headers }: { payload: IpostPayload; headers: Iheaders }, cb) {
    const protocol = validateProtocol(payload.protocol);
    const url = validateUrl(payload.url);
    const method = validateMethod(payload.method);
    const successCodes = validateSuccessCodes(payload.successCodes);
    const timeoutSeconds = validateTimeoutSeconds(payload.timeoutSeconds);

    if (protocol && url && method && successCodes && timeoutSeconds) {
      if (headers.token) {
        loggedInUser(headers.token)
          .then((userData) => userData, () => cb(403))
          .then((userData) => {
            const { userChecks = [], phone } = userData;

            if (userChecks.length < config.maxChecks) {
              return { ...userData, userChecks };
            } else {
              throw new Error();
            }
          })
          .then(
            (userData) => {
              const id = createToken(20);
              const checkData = {
                id,
                method,
                phone: userData.phone,
                protocol,
                successCodes,
                timeoutSeconds,
                url,
              };
              create('checks', id, checkData).catch(() => {
                throw new Error();
              });
              return { checkData, userData };
            },
            () =>
              cb(400, {
                Error: `The user already has the maximum number of checks ${
                  config.maxChecks
                }`,
              }),
          )
          .then(({ userData, checkData }) => {
            update('users', userData.phone, {
              ...userData,
              userChecks: [...userData.userChecks, checkData.id],
            });
            return checkData;
          },
            () => cb(500, { Error: 'could save the check' }),
          )
          .then(
            (checkObject) => cb(200, checkObject),
            () => cb(500, { Error: 'could not update user with the new check' }),
          );
      } else {
        cb(403, { Error: 'Missing required token in header, or token is invalid' });
      }
    } else {
      cb(400, { Error: 'Missing required fields' });
    }
  },

  get() {},
  put() {},
  delete() {},
};
