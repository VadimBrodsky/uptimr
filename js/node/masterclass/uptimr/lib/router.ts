import * as handlers from './handlers';

const router = {
  ping: handlers.ping,
};

export const matchRoute = (trimmedPath) =>
  router[trimmedPath] ? router[trimmedPath] : handlers.notFound;
