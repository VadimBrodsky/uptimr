import * as data from '../lib/data';
import { hash } from '../lib/helpers';
import * as tokensController from './tokens';

describe('verifyToken', () => {
  it('should resove to true if the token is valid', async () => {
    jest.spyOn(data, 'read').mockResolvedValueOnce({
      expires: Date.now() * 2,
      phone: '2261234567',
    });

    const validToken = await tokensController.verifyToken('123', '2261234567');

    expect(validToken).toBe(true);
  });

  it('should reject if the phone numbers do not match', () => {
    jest.spyOn(data, 'read').mockResolvedValueOnce({
      expires: Date.now() * 2,
      phone: '2261234567',
    });

    const tokenPromise = tokensController.verifyToken('123', '1111111111');

    expect(tokenPromise).rejects.toHaveProperty('message', 'Invalid token');
  });

  it('should reject if the token is expired', () => {
    jest.spyOn(data, 'read').mockResolvedValueOnce({
      expires: Date.now() - 1000,
      phone: '2261234567',
    });

    const tokenPromise = tokensController.verifyToken('123', '2261234567');

    expect(tokenPromise).rejects.toHaveProperty('message', 'Invalid token');
  });
});

describe('post', () => {
  it('should return 400 if missing any of the required fields', () => {
    const res = tokensController.post({
      payload: {
        password: undefined,
        phone: undefined,
      },
    });

    expect(res).rejects.toHaveProperty('status', 400);
  });

  it('should return 404 if the user does not exist', () => {
    jest.spyOn(data, 'read').mockRejectedValueOnce(new Error());

    const res = tokensController.post({
      payload: {
        password: 'secret',
        phone: '2261234567',
      },
    });

    expect(res).rejects.toHaveProperty('status', 404);
  });

  it('should return 400 if the password is not valid', () => {
    jest.spyOn(data, 'read').mockResolvedValueOnce({ password: hash('secret') });

    const res = tokensController.post({
      payload: {
        password: 'mellon',
        phone: '2261234567',
      },
    });

    expect(res).rejects.toHaveProperty('status', 400);
  });

  it('should return 500 if token creation fails', () => {
    jest.spyOn(data, 'read').mockResolvedValueOnce({ password: hash('secret') });
    jest.spyOn(data, 'create').mockRejectedValueOnce(new Error());

    const res = tokensController.post({
      payload: {
        password: 'secret',
        phone: '2261234567',
      },
    });

    expect(res).rejects.toHaveProperty('status', 500);
  });

  it('should create a new token', async () => {
    jest.spyOn(data, 'read').mockResolvedValueOnce({ password: hash('secret') });
    jest.spyOn(data, 'create').mockResolvedValueOnce({});

    const res = await tokensController.post({
      payload: {
        password: 'secret',
        phone: '2261234567',
      },
    });

    expect(res.status).toBe(200);
    expect(res.writtenData).toBeDefined();
  });
});

describe('get', () => {
  it('should return 400 if missing the required id field', () => {
    const res = tokensController.get({ query: { id: undefined } });

    expect(res).rejects.toHaveProperty('status', 400);
  });

  it('should return 404 if the token data is not found', () => {
    jest.spyOn(data, 'read').mockRejectedValueOnce(new Error());

    const res = tokensController.get({ query: { id: '12345678901234567890' } });

    expect(res).rejects.toHaveProperty('status', 404);
  });

  it('should get the token data', async () => {
    jest.spyOn(data, 'read').mockResolvedValueOnce({});

    const res = await tokensController.get({ query: { id: '12345678901234567890' } });

    expect(res.status).toBe(200);
    expect(res.tokenData).toBeDefined();
  });
});
