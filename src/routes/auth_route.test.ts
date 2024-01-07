import { beforeAll, describe, expect, test } from '@jest/globals';
import { request_helper } from '../tests/request_helper';
const { v4: uuidv4 } = require('uuid');

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



describe('Test users flow', () => {
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

    // user 1
    let createdUser1Id = null;
    let createdUser1Email = null;
    let createdUser1Token = null;

    // user 2
    let createdUser2Id = null;

    test('Create User 1 and User 2', async () => {
        const uniqueEmail = `john.doe.${uuidv4()}@example.com`; // Generating a unique email using UUID
        let newUser = {
            firstName: 'John',
            lastName: 'Doe',
            email: uniqueEmail,
            password: 'securepassword',
            isAdmin: false,
        };
        createdUser1Email = uniqueEmail
        try {
            const createResponse = await request_helper.request('POST', '/users/create', newUser, {
                Authorization: `Bearer ${admin_token}`,
            });
            expect(createResponse.status).toBe(201);
            expect(createResponse.data.message).toBe('User created successfully');
            expect(createResponse.data.user).toBeDefined();
            createdUser1Id = createResponse.data.user.id;

            let newUser2 = {
                firstName: 'Bob',
                lastName: 'Doe',
                email: `Bob.doe.${uuidv4()}@example.com`,
                password: 'securepassword',
                isAdmin: false,
            };

            // creating user 2
            const createUser2Response = await request_helper.request('POST', '/users/create', newUser2, {
                Authorization: `Bearer ${admin_token}`,
            });
            createdUser2Id = createUser2Response.data.user.id;

            expect(createUser2Response.data.user).toBeDefined();

        } catch (err) {
            console.log(err.response.data);
        }
    });

    test("Login as newly created user", async () => {
        // Log in as admin to get the authentication token
        const validUser = {
            email: createdUser1Email,
            password: 'securepassword',
        };
        const loginResponse = await request_helper.request('POST', '/auth/login', validUser, {});
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.data.token).toBeDefined();
        createdUser1Token = loginResponse.data.token;
    })

    test('Edit User the created user with Admin Token', async () => {

        const updateUser = {
            firstName: 'UpdatedJohn',
            lastName: 'UpdatedDoe',
            email: createdUser1Email,
            isAdmin: false,
            password: 'newsecurepassword',
        };

        const editResponse = await request_helper.request('PUT', `/users/edit/${createdUser1Id}`, updateUser, {
            Authorization: `Bearer ${admin_token}`,
        });

        expect(editResponse.status).toBe(200);
        expect(editResponse.data.message).toBe('User updated successfully');
        expect(editResponse.data.user).toBeDefined();
        expect(editResponse.data.user.firstName).toBe('UpdatedJohn');
        expect(editResponse.data.user.lastName).toBe('UpdatedDoe');
        expect(editResponse.data.user.email).toBe(createdUser1Email);
        expect(editResponse.data.user.isAdmin).toBe(false);
    });

});