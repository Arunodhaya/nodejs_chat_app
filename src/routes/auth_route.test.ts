import { beforeAll, describe, expect, test } from '@jest/globals';
import { request_helper } from '../tests/request_helper';

describe('Login Route', () => {
    test('Invalid email or password', async () => {
        const invalidUser = {
            email: 'test@example.com',
            password: '1'
        };
        try {
            const loginResponse = await request_helper.request('POST', '/auth/login', invalidUser, {});
            // if the login response is successful, then below line will fail the testcase
            expect(false).toBe(true)
        } catch (err) {
            let loginResponse = err.response
            expect(loginResponse.status).toBe(401);
            expect(loginResponse.data.error).toBe('Invalid email or password.');
        }
    });
    let admin_token = "";

    beforeAll(async () => {
        // Log in as admin to get the authentication token
        const validUser = {
            email: 'admin@riktam.com',
            password: 'admin@123',
        };
        const loginResponse = await request_helper.request('POST', '/auth/login', validUser, {});
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.data.token).toBeDefined();
        admin_token = loginResponse.data.token;
    });

    let createdUserId;


    test('Create Admin User', async () => {
        const { v4: uuidv4 } = require('uuid');

        const uniqueEmail = `john.doe.${uuidv4()}@example.com`; // Generating a unique email using UUID

        const newAdminUser = {
            firstName: 'John',
            lastName: 'Doe',
            email: uniqueEmail,
            password: 'securepassword',
            isAdmin: false,
        };

        try {
            const createResponse = await request_helper.request('POST', '/users/create', newAdminUser, {
                Authorization: `Bearer ${admin_token}`,
            });

            expect(createResponse.status).toBe(201);
            expect(createResponse.data.message).toBe('User created successfully');
            expect(createResponse.data.user).toBeDefined();
            createdUserId = createResponse.data.user.id;
        } catch (err) {
            console.log(err.response.data);
        }
    });

    test('Edit Admin User', async () => {
        const { v4: uuidv4 } = require('uuid');

        const uniqueEmail = `john.doe.${uuidv4()}@example.com`; // Generating a unique email using UUID

        const updatedAdminUser = {
            firstName: 'UpdatedJohn',
            lastName: 'UpdatedDoe',
            email: uniqueEmail,
            isAdmin: false,
            password: 'newsecurepassword',
        };

        const editResponse = await await request_helper.request('PUT', `/users/edit/${createdUserId}`, updatedAdminUser, {
            Authorization: `Bearer ${admin_token}`,
        });

        expect(editResponse.status).toBe(200);
        expect(editResponse.data.message).toBe('User updated successfully');
        expect(editResponse.data.user).toBeDefined();
        expect(editResponse.data.user.firstName).toBe('UpdatedJohn');
        expect(editResponse.data.user.lastName).toBe('UpdatedDoe');
        expect(editResponse.data.user.email).toBe(uniqueEmail);
        expect(editResponse.data.user.isAdmin).toBe(false);
    });

});