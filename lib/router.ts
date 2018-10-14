import checksController from '../controllers/checks';
import tokensController from '../controllers/tokens';
import usersController from '../controllers/users';

const ping = (data) => {
  return Promise.reject({ code: 200 });
};

const notFound = (data) => {
  return Promise.reject({ code: 404 });
};

const users = (data) => {
  if (Object.keys(usersController).includes(data.method)) {
    return usersController[data.method](data);
  } else {
    return Promise.reject({ code: 405 });
  }
};

const tokens = (data, callback) => {
  if (Object.keys(tokensController).includes(data.method)) {
    tokensController[data.method](data, callback);
  } else {
    callback(405);
  }
};

const checks = (data, callback) => {
  if (Object.keys(checksController).includes(data.method)) {
    checksController[data.method](data, callback);
  } else {
    callback(405);
  }
};

const router = {
  checks,
  ping,
  tokens,
  users,
};

export const matchRoute = (trimmedPath: string) =>
  Object.keys(router).includes(trimmedPath) ? router[trimmedPath] : notFound;
