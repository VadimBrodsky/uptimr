import * as handlers from './handlers';

const router = {
  ping: handlers.ping,
  users: handlers.users,
};

export const matchRoute = (trimmedPath: string) =>
  Object.keys(router).includes(trimmedPath) ? router[trimmedPath] : handlers.notFound;
