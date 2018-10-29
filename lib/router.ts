import checksController from '../controllers/checks';
import * as pingController from '../controllers/ping';
import * as tokensController from '../controllers/tokens';
import * as usersController from '../controllers/users';
import log from '../lib/logger';

const matchMethod = (controller) => (data) => {
  if (Object.keys(controller).includes(data.method)) {
    return controller[data.method](data);
  } else {
    return Promise.reject({ status: 405 });
  }
};

const router = {
  checks: matchMethod({
    // WIP
    post: checksController.get,
  }),
  ping: matchMethod({
    get: pingController.get,
  }),
  tokens: matchMethod({
    delete: tokensController.destroy,
    get: tokensController.get,
    post: tokensController.post,
    put: tokensController.put,
  }),
  users: matchMethod({
    delete: usersController.destroy,
    get: usersController.get,
    post: usersController.post,
    put: usersController.put,
  }),
};

export const matchRoute = (trimmedPath: string) =>
  Object.keys(router).includes(trimmedPath)
    ? router[trimmedPath]
    : Promise.reject({ status: 404 });
