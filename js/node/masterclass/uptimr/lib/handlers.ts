import tokensController from '../controllers/tokens';
import usersController from '../controllers/users';

export const ping = (data, callback) => {
  callback(200);
};

export const notFound = (data, callback) => {
  callback(404);
};

export const users = (data, callback) => {
  if (Object.keys(usersController).includes(data.method)) {
    usersController[data.method](data, callback);
  } else {
    callback(405);
  }
};

export const tokens = (data, callback) => {
  if (Object.keys(tokensController).includes(data.method)) {
    tokensController[data.method](data, callback);
  } else {
    callback(405);
  }
}
