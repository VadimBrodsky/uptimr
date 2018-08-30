import * as handlers from './handlers';

const router = {
  ping: handlers.ping,
  users: handlers.users,
};

export const matchRoute = (trimmedPath) =>
  router[trimmedPath] ? router[trimmedPath] : handlers.notFound;
