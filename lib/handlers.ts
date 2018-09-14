import checksController from '../controllers/checks';
import tokensController from '../controllers/tokens';
import usersController from '../controllers/users';

export const ping = (data) => {
  return Promise.reject({ code: 200 });
};

export const notFound = (data) => {
  return Promise.reject({ code: 404 });
};

export const users = (data) => {
  if (Object.keys(usersController).includes(data.method)) {
    return usersController[data.method](data);
  } else {
    return Promise.reject({ code: 405 })
  }
};

export const tokens = (data, callback) => {
  if (Object.keys(tokensController).includes(data.method)) {
    tokensController[data.method](data, callback);
  } else {
    callback(405);
  }
}

export const checks = (data, callback) => {
  if (Object.keys(checksController).includes(data.method)) {
    checksController[data.method](data, callback);
  } else {
    callback(405);
  }
}
