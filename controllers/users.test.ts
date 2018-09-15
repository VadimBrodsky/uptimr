import * as data from '../lib/data';
import usersController from './users';

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

  it('should return 400 if missing any of the required fields', async () => {
    let error;
    try {
      await usersController.post({
        payload: {
          firstName: 'John',
          lastName: 'Snow',
          password: 'knownothing',
        },
      });
    } catch (e) {
      error = e;
    }

    expect(error.status).toBe(400);
  });
});
