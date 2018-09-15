import { create, destroy, read, update } from '../lib/data';
import { hash, validateTrimmedFn } from '../lib/helpers';
import HTTPError from '../lib/http-error';
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
  post({
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

    return read('users', phone).then(
      () => {
        throw new HTTPError(400, 'A user with that phone number already exists');
      },
      () =>
        create('users', phone, {
          firstName,
          lastName,
          password: hash(password),
          phone,
          tosAgreement,
        }).then(
          () => ({ status: 200 }),
          (createError) => {
            console.log(createError);
            throw new HTTPError(500, 'Could not create the new user');
          },
        ),
    );
  },

  get({ query, headers }: { query: { phone: string }; headers: { token: string } }, cb) {
    const user = validateTen(query.phone);

    if (!user) {
      throw new HTTPError(400, 'Missing required fields');
    }

    if (!headers.token) {
      throw new HTTPError(403, 'Missing required token in header, or token is invalid');
    }

    return verifyToken(headers.token, user).then(
      () => {
        read('users', user)
          .then(({ firstName, lastName, phone, tosAgreement }: Iuser) => ({
            payload: { firstName, lastName, phone, tosAgreement },
            statusCode: 200,
          }))
          .catch(() => {
            throw new HTTPError(404);
          });
      },
      () => {
        throw new HTTPError(403, 'Token is invalid');
      },
    );
  },

  async put(
    {
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
    },
    cb,
  ) {
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

    return verifyToken(headers.token, user)
      .then(() => {
        if (firstName || lastName || password) {
          read('users', user)
            .then((storedData: Iuser) => {
              update('users', user, {
                ...storedData,
                firstName: firstName ? firstName : storedData.firstName,
                lastName: lastName ? lastName : storedData.lastName,
                password: password ? hash(password) : storedData.password,
              })
                .then(() => cb(200))
                .catch(() => {
                  cb(500, { Error: 'Could not update the user' });
                });
            })
            .catch(() => cb(400, { Error: 'The specified user does not exist' }));
        } else {
          cb(400, { Error: 'Missing fields to update' });
        }
      })
      .catch(() => cb(403, { Error: 'Token is invalid' }));
  },

  delete(
    { payload, headers }: { payload: { phone: string }; headers: { token: string } },
    cb,
  ) {
    const user = validateTen(payload.phone);
    if (user) {
      if (headers.token) {
        verifyToken(headers.token, user)
          .then(() => {
            read('users', user)
              .then(() => {
                destroy('users', user)
                  .then(() => cb(200))
                  .catch(() => cb(500, { Error: 'Could not delete the specified user' }));
              })
              .catch(() => cb(400, { Error: 'Could not find the specified user' }));
          })
          .catch(() => cb(403, { Error: 'Token is invalid' }));
      } else {
        cb(403, { Error: 'Missing required token in header, or token is invalid' });
      }
    } else {
      cb(400, { Error: 'Missing required fields' });
    }
  },
};
