import { create, read } from './data';
import { hash, validateTrimmedFn } from './helpers';

export const ping = (data, callback) => {
  callback(200);
};

export const notFound = (data, callback) => {
  callback(404);
};

export const users = (data, callback) => {
  const VALID_METHODS = ['post', 'get', 'put', 'delete'];

  interface Ipayload {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    tosAgreement: boolean;
  }

  interface Idata {
    payload: Ipayload;
  }

  const userMethods = {
    post({ payload }: Idata, cb) {
      const validateBlank = validateTrimmedFn((len) => len > 0);
      const validateTen = validateTrimmedFn((len) => len === 10);

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
    get(d, cb) {},
    put(d, cb) {},
    delete(d, cb) {},
  };

  if (VALID_METHODS.includes(data.method)) {
    userMethods[data.method](data, callback);
  } else {
    callback(405);
  }
};
