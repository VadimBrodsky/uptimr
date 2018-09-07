import { create, destroy, read, update } from '../lib/data';
import { createToken, hash, validateTrimmedFn } from '../lib/helpers';

const validatePassword = validateTrimmedFn((len) => len > 0);
const validatePhone = validateTrimmedFn((len) => len === 10);
const validateId = validateTrimmedFn((len) => len === 20);

export const verifyToken = (id: string, phone: string) =>
  read('tokens', id).then((tokenData) => {
    if (tokenData.phone === phone && tokenData.expires > Date.now()) {
      return true;
    } else {
      throw new Error('Invalid token');
    }
  });

export default {
  post({ payload }: { payload: { phone: string; password: string } }, cb) {
    const user = validatePhone(payload.phone);
    const password = validatePassword(payload.password);

    if (user && password) {
      read('users', user)
        .then((userData) => {
          const sentPasswordHash = hash(password);
          if (sentPasswordHash === userData.password) {
            const tokenId = createToken(20);
            console.log(tokenId);

            create('tokens', tokenId, {
              expires: Date.now() + 1000 * 60 * 60,
              phone: user,
              tokenId,
            })
              .then((writtenData) => cb(200, writtenData))
              .catch(() => cb(500, { Error: 'Could not create the new token' }));
          } else {
            cb(400, { Error: "Password did not match the specified user's password" });
          }
        })
        .catch(() => cb(400, 'Could not fild the specified user'));
    } else {
      cb(400, { Error: 'Missing required fields' });
    }
  },

  get({ query }: { query: { id: string } }, cb) {
    const id = validateId(query.id);
    if (id) {
      read('tokens', id)
        .then((tokenData) => {
          cb(200, tokenData);
        })
        .catch(() => cb(404));
    } else {
      cb(400, { Error: 'Missing required fields' });
    }
  },

  put({ payload }: { payload: { id: string; extend: boolean } }, cb) {
    const id = validateId(payload.id);
    const extend = !!payload.extend;

    if (id && payload) {
      read('tokens', id)
        .then((tokenData) => {
          if (tokenData.expires > Date.now()) {
            update('tokens', id, {
              ...tokenData,
              expires: Date.now() + 1000 * 60 * 60,
            })
              .then(() => cb(200))
              .catch(() => cb(500, { Error: "Could not update the token's expiration" }));
          } else {
            cb(400, {
              Error: 'The token has already been expired, and cannot be extended',
            });
          }
        })
        .catch(() => cb(400, { Error: 'Specified token does not exist' }));
    } else {
      cb(400, { Error: 'Missing required fields' });
    }
  },

  delete({ payload }: { payload: { id: string } }, cb) {
    const id = validateId(payload.id);
    if (id) {
      read('tokens', id)
        .then(() => {
          destroy('tokens', id)
            .then(() => cb(200))
            .catch(() => cb(500, { Error: 'Could not delete the specified token' }));
        })
        .catch(() => cb(400, { Error: 'Could not find the specified token' }));
    } else {
      cb(400, { Error: 'Missing required fields' });
    }
  },
};
