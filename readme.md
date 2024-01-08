# Group Chat Application

##Description

This is a simple Node.js application that provides web services to facilitate group chat and manage user data. The application allows users to create groups, send messages within groups, manage users, and perform various tasks.

## Features

    Authentication:
        Users can log in.
        Admin APIs for user management (create, edit).

    Groups:
        Normal users can create groups.
        Only the user who created group (group admin) can add members to the group
        Only Group admin can delete the group

    Group Messages:
        Users can send messages within groups.
        Like messages within groups.

### Technologies Used

    Node.js
    Express.js
    Sequelize (MySQL)
    JSON Web Tokens (JWT) for authentication

## Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Arunodhaya/nodejs_chat_app

2. **Install dependencies:**

   ```bash
    npm install or yarn install

3. **Set up the database:** Copy .env.sample and create .env files with required values

    ```bash
    npx sequelize-cli db:migrate  //Executes all migration
    npx sequelize-cli migration:generate --name <replace-name-of-your-migration> //Creates migration

4. **Start the server:**
   ```bash
    yarn start
5. **Test**
   ```bash
   yarn test
6. Login using admin credentails (Admin user will be created during migration)
    
    ```bash
      user_email: 'admin@riktam.com'
      password: admin@123

## API Documentation
    Authentication:
        POST /auth/login: Log in with credentials.

    User Management:
        POST /users/create: Create a user (admin-only).
        PUT /users/edit/:userId: Edit a user (admin-only).

    Groups:
        POST /groups/create: Create a group.
        POST /groups/addMembers/:groupId Add members to a group (Group admin-only).
        POST /groups/addMembers/:groupId/:userId Add members to a group (Group admin-only).
        GET /groups/:groupId: Group details and its members 
        DELETE /groups/:groupId: Delete a group (Group admin-only).

    Group Messages: (group_members-only)
        POST /groups/sendMessage/:groupId: Send a message in a group.
        POST /groups/likeMessage/:groupId/:messageId: Like a message in a group.
        GET /groups/getMessages/:groupId: Get group messages

    Search APIs:
        GET /users/search?query={first_name|last_name}: Search users based on first name or last name
        GET /groups/search?group_name={group_name}: Search groups based on group name

Please refer `Chat-API.postman_collection.json` to test api's in postman



