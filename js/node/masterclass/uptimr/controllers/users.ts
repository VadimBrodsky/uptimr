import { create, destroy, read, update } from '../lib/data';
import { hash, validateTrimmedFn } from '../lib/helpers';
import { verifyToken } from './tokens';

const validateBlank = validateTrimmedFn((len) => len > 0);
const validateTen = validateTrimmedFn((len) => len === 10);

interface Iuser {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  tosAgreement: boolean;
}

interface Idata {
  payload: Iuser;
}

export default {
  post({ payload }: { payload: {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  tosAgreement: boolean;
  } }, cb) {
    const firstName = validateBlank(payload.firstName);
    const lastName = validateBlank(payload.lastName);
    const phone = validateTen(payload.phone);
    const password = validateBlank(payload.password);
    const tosAgreement = !!payload.tosAgreement;

    if (firstName && lastName && phone && password && tosAgreement) {
      read('users', phone)
        .then(() => cb(400, { Error: 'A user with that phone number already exists' }))
        .catch(() => {
          create('users', phone, {
            firstName,
            lastName,
            password: hash(password),
            phone,
            tosAgreement,
          })
            .then(() => cb(200))
            .catch((createError) => {
              console.log(createError);
              cb(500, 'Could not create the new user');
            });
        });
    } else {
      cb(400, { Error: 'Missing required fields' });
    }
  },

  get({ query, headers }: { query: { phone: string }; headers: { token: string } }, cb) {
    const user = validateTen(query.phone);

    if (user) {
      if (headers.token) {
        verifyToken(headers.token, user)
          .then(() => {
            read('users', user)
              .then(({ firstName, lastName, phone, tosAgreement }: Iuser) => {
                cb(200, { firstName, lastName, phone, tosAgreement });
              })
              .catch(() => cb(404));
          })
          .catch(() => cb(403, { Error: 'Token is invalid' }));
      } else {
        cb(403, { Error: 'Missing required token in header, or token is invalid' });
      }
    } else {
      cb(400, { Error: 'Missing required fields' });
    }
  },

  put(
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

    if (user) {
      if (headers.token) {
        verifyToken(headers.token, user)
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
      } else {
        cb(403, { Error: 'Missing required token in header, or token is invalid' });
      }
    } else {
      cb(400, { Error: 'Missing required fields' });
    }
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
