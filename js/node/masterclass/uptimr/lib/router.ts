import * as handlers from './handlers';

const router = {
  checks: handlers.checks,
  ping: handlers.ping,
  tokens: handlers.tokens,
  users: handlers.users,
};

export const matchRoute = (trimmedPath: string) =>
  Object.keys(router).includes(trimmedPath) ? router[trimmedPath] : handlers.notFound;
