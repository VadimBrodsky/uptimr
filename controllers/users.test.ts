import * as data from '../lib/data';
import * as tokens from './tokens';
import usersController from './users';

jest.mock('../lib/logger');

describe('post', () => {
  it('should create a new user record', async () => {
    const readSpy = jest.spyOn(data, 'read').mockRejectedValue(new Error());
    const createSpy = jest.spyOn(data, 'create').mockResolvedValueOnce(true);

    const res = await usersController.post({
      payload: {
        firstName: 'John',
        lastName: 'Snow',
        password: 'knownothing',
        phone: '2261234567',
        tosAgreement: true,
      },
    });

    expect(createSpy).toHaveBeenCalled();
    expect(res.status).toEqual(200);
  });

  it('should return 400 if missing any of the required fields', () => {
    const res = usersController.post({
      payload: {
        firstName: 'John',
        lastName: 'Snow',
        password: 'knownothing',
      },
    });

    expect(res).rejects.toHaveProperty('status', 400);
  });

  it('should return 400 if the user already exists', () => {
    const readSpy = jest.spyOn(data, 'read').mockResolvedValueOnce(true);

    const res = usersController.post({
      payload: {
        firstName: 'John',
        lastName: 'Snow',
        password: 'knownothing',
        phone: '2261234567',
        tosAgreement: true,
      },
    });

    expect(res).rejects.toHaveProperty('status', 400);
  });

  it('shuld try return 500 if user creation failed', () => {
    const readSpy = jest.spyOn(data, 'read').mockRejectedValue(new Error());
    const createSpy = jest.spyOn(data, 'create').mockRejectedValue(new Error());

    const res = usersController.post({
      payload: {
        firstName: 'John',
        lastName: 'Snow',
        password: 'knownothing',
        phone: '2261234567',
        tosAgreement: true,
      },
    });
    expect(res).rejects.toHaveProperty('status', 500);
  });
});

describe('get', () => {
  const validRecord = {
    firstName: 'John',
    lastName: 'Snow',
    phone: '2261234567',
    tosAgreement: true,
  };

  it('should return the user record', async () => {
    const tokenSpy = jest.spyOn(tokens, 'verifyToken').mockResolvedValueOnce(true);
    const readSpy = jest.spyOn(data, 'read').mockResolvedValueOnce(validRecord);

    const res = await usersController.get({
      headers: { token: 'secret' },
      query: { phone: '2261234567' },
    });

    expect(readSpy).toHaveBeenCalled();
    expect(res.status).toEqual(200);
    expect(res.payload).toEqual(validRecord);
  });

  it('should return 400 if missing any of the required fields', () => {
    const res = usersController.get({
      headers: { token: 'secret' },
      query: {},
    });

    expect(res).rejects.toHaveProperty('status', 400);
  });

  it('should return 403 if token is missing', () => {
    const res = usersController.get({
      headers: {},
      query: { phone: '2261234567' },
    });

    expect(res).rejects.toHaveProperty('status', 403);
  });

  it('should return 403 if token is not valid', () => {
    const tokenSpy = jest.spyOn(tokens, 'verifyToken').mockRejectedValueOnce(new Error());

    const res = usersController.get({
      headers: { token: 'secret' },
      query: { phone: '2261234567' },
    });

    expect(res).rejects.toHaveProperty('status', 403);
  });

  it('should return 404 if the user does not exist', () => {
    const tokenSpy = jest.spyOn(tokens, 'verifyToken').mockResolvedValueOnce(true);
    const readSpy = jest.spyOn(data, 'read').mockRejectedValueOnce(new Error());

    const res = usersController.get({
      headers: { token: 'secret' },
      query: { phone: '2261234567' },
    });

    expect(res).rejects.toHaveProperty('status', 404);
  });
});
