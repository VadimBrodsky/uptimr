import * as data from '../lib/data';
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
