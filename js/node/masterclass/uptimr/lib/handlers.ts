import { create, destroy, read, update } from './data';
import { hash, validateTrimmedFn } from './helpers';

export const ping = (data, callback) => {
  callback(200);
};

export const notFound = (data, callback) => {
  callback(404);
};

export const users = (data, callback) => {
  const VALID_METHODS = ['post', 'get', 'put', 'delete'];
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

  const userMethods = {
    post({ payload }: Idata, cb) {
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

    get({ query }, cb) {
      const user = validateTen(query.phone);
      if (user) {
        read('users', user)
          .then(({ firstName, lastName, phone, tosAgreement }: Iuser) => {
            cb(200, { firstName, lastName, phone, tosAgreement });
          })
          .catch(() => cb(404));
      } else {
        cb(400, { Error: 'Missing required fields' });
      }
    },

    put({ payload }, cb) {
      // required
      const user = validateTen(payload.phone);

      // optional
      const firstName = validateBlank(payload.firstName);
      const lastName = validateBlank(payload.lastName);
      const password = validateBlank(payload.password);

      if (user) {
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
                .catch((e) => {
                  console.log(e);
                  cb(500, { Error: 'Could not update the user' });
                });
            })
            .catch(() => cb(400, { Error: 'The specified user does not exist' }));
        } else {
          cb(400, { Error: 'Missing fields to update' });
        }
      } else {
        cb(400, { Error: 'Missing required fields' });
      }
    },

    delete({ payload }, cb) {
      const user = validateTen(payload.phone);
      if (user) {
        read('users', user)
          .then(() => {
            destroy('users', user)
              .then(() => cb(200))
              .catch(() => cb(500, { Error: 'Could not delete the specified user' }));
          })
          .catch(() => cb(400, { Error: 'Could not find the specified user' }));
      } else {
        cb(400, { Error: 'Missing required fields' });
      }
    },
  };

  if (VALID_METHODS.includes(data.method)) {
    userMethods[data.method](data, callback);
  } else {
    callback(405);
  }
};
