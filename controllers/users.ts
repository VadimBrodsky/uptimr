import { create, destroy, read, update } from '../lib/data';
import { hash, validateTrimmedFn } from '../lib/helpers';
import HTTPError from '../lib/http-error';
import logger from '../lib/logger';
import { verifyToken } from './tokens';

export const loggedInUser = async (tokenId: string) => {
  try {
    const { phone } = await read('tokens', tokenId);
    const user: Iuser = await read('users', phone);
    return user;
  } catch (e) {
    return Promise.reject(e);
  }
};

const validateBlank = validateTrimmedFn((len) => len > 0);
const validateTen = validateTrimmedFn((len) => len === 10);

interface Iuser {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  tosAgreement: boolean;
  userChecks?: [string];
}

interface Idata {
  payload: Iuser;
}

export default {
  async post({
    payload,
  }: {
    payload: {
      firstName: string;
      lastName: string;
      phone: string;
      password: string;
      tosAgreement: boolean;
    };
  }) {
    const firstName = validateBlank(payload.firstName);
    const lastName = validateBlank(payload.lastName);
    const phone = validateTen(payload.phone);
    const password = validateBlank(payload.password);
    const tosAgreement = !!payload.tosAgreement;

    if (!firstName || !lastName || !phone || !password || !tosAgreement) {
      return Promise.reject(new HTTPError(400, 'Missing required fields'));
    }

    try {
      await read('users', phone);
      return Promise.reject(
        new HTTPError(400, 'A user with that phone number already exists'),
      );
    } catch (e) {
      return create('users', phone, {
        firstName,
        lastName,
        password: hash(password),
        phone,
        tosAgreement,
      }).then(
        () => ({ status: 200 }),
        (createError) => {
          logger(createError);
          throw new HTTPError(500, 'Could not create the new user');
        },
      );
    }
  },

  async get({
    query,
    headers,
  }: {
    query: { phone: string };
    headers: { token: string };
  }) {
    const user = validateTen(query.phone);

    if (!user) {
      return Promise.reject(new HTTPError(400, 'Missing required fields'));
    }

    if (!headers.token) {
      throw new HTTPError(403, 'Missing required token in header, or token is invalid');
    }

    try {
      await verifyToken(headers.token, user);
    } catch (e) {
      return Promise.reject(new HTTPError(403, 'Token is invalid'));
    }

    return read('users', user).then(
      ({ firstName, lastName, phone, tosAgreement }: Iuser) => ({
        payload: { firstName, lastName, phone, tosAgreement },
        status: 200,
      }),
      () => {
        throw new HTTPError(404);
      },
    );
  },

  async put({
    payload,
    headers,
  }: {
    payload: {
      phone: string;
      firstName?: string;
      lastName?: string;
      password?: string;
    };
    headers: { token: string };
  }) {
    // required
    const user = validateTen(payload.phone);

    // optional
    const firstName = validateBlank(payload.firstName);
    const lastName = validateBlank(payload.lastName);
    const password = validateBlank(payload.password);

    if (!user) {
      throw new HTTPError(400, 'Missing required fields');
    }

    if (!headers.token) {
      throw new HTTPError(403, 'Missing required token in header, or token is invalid');
    }

    try {
      await verifyToken(headers.token, user);
    } catch (e) {
      return Promise.reject(new HTTPError(403, 'Token is invalid'));
    }

    if (!firstName && !lastName && !password) {
      return Promise.reject(new HTTPError(400, 'Missing fields to update'));
    }

    try {
      const userRecord: Iuser = await read('users', user);

      return update('users', user, {
        ...userRecord,
        firstName: firstName ? firstName : userRecord.firstName,
        lastName: lastName ? lastName : userRecord.lastName,
        password: password ? hash(password) : userRecord.password,
      }).then(
        () => ({ status: 200 }),
        () => Promise.reject(new HTTPError(500, 'Could not update the user')),
      );
    } catch (e) {
      return Promise.reject(new HTTPError(404, 'The specified user does not exist'));
    }
  },

  async delete({
    payload,
    headers,
  }: {
    payload: { phone: string };
    headers: { token: string };
  }) {
    const user = validateTen(payload.phone);
    if (!user) {
      throw new HTTPError(400, 'Missing required fields');
    }

    if (!headers.token) {
      throw new HTTPError(403, 'Missing required token in header, or token is invalid');
    }

    try {
      await verifyToken(headers.token, user);
    } catch (e) {
      return Promise.reject(new HTTPError(403, 'Token is invalid'));
    }

    try {
      await read('users', user);
    } catch (e) {
      return Promise.reject(new HTTPError(404, 'The specified user does not exist'));
    }

    try {
      await destroy('users', user);
      return { status: 200 };
    } catch (e) {
      return Promise.reject(new HTTPError(500, 'Could not delete the specified user'));
    }
  },
};
