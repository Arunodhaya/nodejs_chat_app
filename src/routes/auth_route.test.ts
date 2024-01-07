import { describe, expect, test } from '@jest/globals';
import { request_helper } from '../tests/request_helper';

describe('Login Route', () => {
    test('Valid login credentials', async () => {
        const validUser = {
            email: 'aruna_user1@gmail.com',
            password: 'aruna@123', 
        };

        const loginResponse = await request_helper.request('POST', '/auth/login', validUser);
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.data.token).toBeDefined();
    });

    test('Missing email or password', async () => {
        const invalidUser = { email: 'test@example.com' }; 

        const loginResponse = await request_helper.request('POST', '/auth/login', invalidUser);

        expect(loginResponse.status).toBe(400);
        expect(loginResponse.data.error).toBe('Email and password are required.');
    });

    test('Invalid email or password', async () => {
        const invalidUser = { email: 'nonexistent@example.com', password: 'wrongpassword' };

        const loginResponse = await request_helper.request('POST', '/auth/login', invalidUser);

        expect(loginResponse.status).toBe(401);
        expect(loginResponse.data.error).toBe('Invalid email or password.');
    });
});
