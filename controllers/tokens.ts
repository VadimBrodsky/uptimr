import { create, destroy, read, update } from '../lib/data';
import { createToken, hash, validateTrimmedFn } from '../lib/helpers';
import HTTPError from '../lib/http-error';

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

export async function post({
  payload,
}: {
  payload: { phone: string; password: string };
}) {
  const user = validatePhone(payload.phone);
  const password = validatePassword(payload.password);

  if (!user || !password) {
    throw new HTTPError(400, 'Missing required fields');
  }

  let userData;
  try {
    userData = await read('users', user);
  } catch (e) {
    throw new HTTPError(404, 'Could not fild the specified user');
  }

  if (hash(password) !== userData.password) {
    throw new HTTPError(400, "Password did not match the specified user's password");
  }

  try {
    const tokenId = createToken(20);
    const writtenData = await create('tokens', tokenId, {
      expires: Date.now() + 1000 * 60 * 60,
      phone: user,
      tokenId,
    });
    return { status: 200, writtenData };
  } catch (e) {
    throw new HTTPError(500, 'Could not create the new token');
  }

}

export async function get({ query }: { query: { id: string } }) {
  const id = validateId(query.id);

  if (!id) {
    throw new HTTPError(400, 'Missing required fields');
  }

  try {
    const tokenData = await read('tokens', id);
    return { status: 200, tokenData };
  } catch (e) {
    throw new HTTPError(404, 'Token could not be found');
  }
}

export default {
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
