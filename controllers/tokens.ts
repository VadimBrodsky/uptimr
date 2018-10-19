import * as db from '../lib/data';
import { createToken, hash, validateTrimmedFn } from '../lib/helpers';
import HTTPError from '../lib/http-error';

const validatePassword = validateTrimmedFn((len) => len > 0);
const validatePhone = validateTrimmedFn((len) => len === 10);
const validateId = validateTrimmedFn((len) => len === 20);

export const verifyToken = (id: string, phone: string) =>
  db.read('tokens', id).then((tokenData) => {
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
    userData = await db.read('users', user);
  } catch (e) {
    throw new HTTPError(404, 'Could not fild the specified user');
  }

  if (hash(password) !== userData.password) {
    throw new HTTPError(400, "Password did not match the specified user's password");
  }

  try {
    const tokenId = createToken(20);
    const writtenData = await db.create('tokens', tokenId, {
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
    const tokenData = await db.read('tokens', id);
    return { status: 200, tokenData };
  } catch (e) {
    throw new HTTPError(404, 'Token could not be found');
  }
}

export async function put({ payload }: { payload: { id: string; extend: boolean } }) {
  const id = validateId(payload.id);
  const extend = !!payload.extend;

  if (!id || !payload) {
    throw new HTTPError(400, 'Missing required fields');
  }

  let tokenData;
  try {
    tokenData = await db.read('tokens', id);
  } catch (e) {
    throw new HTTPError(404, 'Specified token does not exist');
  }

  if (tokenData.expires < Date.now()) {
    throw new HTTPError(
      400,
      'The token has already been expired, and cannot be extended',
    );
  }

  try {
    await db.update('tokens', id, {
      ...tokenData,
      expires: Date.now() + 1000 * 60 * 60,
    });
  } catch (e) {
    throw new HTTPError(500, "Could not update the token/'s expiration");
  }

  return { status: 200 };
}

export async function destroy({ payload }: { payload: { id: string } }) {
  const id = validateId(payload.id);

  if (!id) {
    throw new HTTPError(400, 'Missing required fields');
  }

  try {
    await db.read('tokens', id);
  } catch (e) {
    throw new HTTPError(404, 'Could not find the specified token');
  }

  try {
    await db.destroy('tokens', id);
  } catch (e) {
    throw new HTTPError(500, 'Could not delete the specified token');
  }

  return { status: 200 };
}
