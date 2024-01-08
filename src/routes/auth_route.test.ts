import { beforeAll, describe, expect, test } from "@jest/globals";
import { request_helper } from "../tests/request_helper";
const { v4: uuidv4 } = require("uuid");

let admin_token = "";

beforeAll(async () => {
  // Log in as admin to get the authentication token
  const validUser = {
    email: "admin@riktam.com",
    password: "admin@123",
  };
  const loginResponse = await request_helper.request(
    "POST",
    "/auth/login",
    validUser,
    {}
  );
  expect(loginResponse.status).toBe(200);
  expect(loginResponse.data.token).toBeDefined();
  admin_token = loginResponse.data.token;
});

describe("Test users flow", () => {
  test("Invalid email or password", async () => {
    const invalidUser = {
      email: "test@example.com",
      password: "1",
    };
    try {
      const loginResponse = await request_helper.request(
        "POST",
        "/auth/login",
        invalidUser,
        {}
      );
      // if the login response is successful, then below line will fail the testcase
      expect(false).toBe(true);
    } catch (err) {
      let loginResponse = err.response;
      expect(loginResponse.status).toBe(401);
      expect(loginResponse.data.error).toBe("Invalid email or password.");
    }
  });

  // user 1
  let createdUser1Id = null;
  let createdUser1Email = null;
  let createdUser1Token = null;

  // user 2
  let createdUser2Id = null;

  test("Create User 1 and User 2", async () => {
    const uniqueEmail = `john.doe.${uuidv4()}@example.com`; // Generating a unique email using UUID
    let newUser = {
      firstName: "John",
      lastName: "Doe",
      email: uniqueEmail,
      password: "securepassword",
      isAdmin: false,
    };
    createdUser1Email = uniqueEmail;
    const createResponse = await request_helper.request(
      "POST",
      "/users/create",
      newUser,
      {
        Authorization: `Bearer ${admin_token}`,
      }
    );
    expect(createResponse.status).toBe(201);
    expect(createResponse.data.message).toBe("User created successfully");
    expect(createResponse.data.user).toBeDefined();
    createdUser1Id = createResponse.data.user.id;

    let newUser2 = {
      firstName: "Bob",
      lastName: "Doe",
      email: `Bob.doe.${uuidv4()}@example.com`,
      password: "securepassword",
      isAdmin: false,
    };

    // creating user 2
    const createUser2Response = await request_helper.request(
      "POST",
      "/users/create",
      newUser2,
      {
        Authorization: `Bearer ${admin_token}`,
      }
    );
    createdUser2Id = createUser2Response.data.user.id;

    expect(createUser2Response.data.user).toBeDefined();
  });

  test("Login as newly created user", async () => {
    // Log in as admin to get the authentication token
    const validUser = {
      email: createdUser1Email,
      password: "securepassword",
    };
    const loginResponse = await request_helper.request(
      "POST",
      "/auth/login",
      validUser,
      {}
    );
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data.token).toBeDefined();
    createdUser1Token = loginResponse.data.token;
  });

  test("Edit User the created user with Admin Token", async () => {
    const updateUser = {
      firstName: "UpdatedJohn",
      lastName: "UpdatedDoe",
      email: createdUser1Email,
      isAdmin: false,
      password: "newsecurepassword",
    };

    const editResponse = await request_helper.request(
      "PUT",
      `/users/edit/${createdUser1Id}`,
      updateUser,
      {
        Authorization: `Bearer ${admin_token}`,
      }
    );

    expect(editResponse.status).toBe(200);
    expect(editResponse.data.message).toBe("User updated successfully");
    expect(editResponse.data.user).toBeDefined();
    expect(editResponse.data.user.firstName).toBe("UpdatedJohn");
    expect(editResponse.data.user.lastName).toBe("UpdatedDoe");
    expect(editResponse.data.user.email).toBe(createdUser1Email);
    expect(editResponse.data.user.isAdmin).toBe(false);
  });

  test("Search user", async () => {
    const first_name_search_key = "UpdatedJohn";

    // Make a request to search group
    const searchResponse = await request_helper.request(
      "GET",
      `/users/search?query=${first_name_search_key}`,
      null,
      {
        Authorization: `Bearer ${createdUser1Token}`,
      }
    );

    // Assertions
    expect(searchResponse.status).toBe(200);
    expect(searchResponse.data.users).toBeDefined();

    const matchingUsers = searchResponse.data.users;
    expect(Array.isArray(matchingUsers)).toBe(true);

    // Check if each group name contains the search keyword (case-insensitive)
    matchingUsers.forEach((user) => {
      expect(user.firstName.toLowerCase()).toContain(
        first_name_search_key.toLowerCase()
      );
    });
  });

  // test creating group
  let createdGroupId;

  test("Create Group", async () => {
    const newGroup = {
      group_name: "Test Group",
    };

    // Make a request to create a new group
    const createResponse = await request_helper.request(
      "POST",
      "/groups/create",
      newGroup,
      {
        Authorization: `Bearer ${createdUser1Token}`,
      }
    );

    // Assertions
    expect(createResponse.status).toBe(201);
    expect(createResponse.data.message).toBe("Group created successfully");
    expect(createResponse.data.group).toBeDefined();

    const createdGroup = createResponse.data.group;
    createdGroupId = createdGroup.id;
    expect(createdGroup.id).toBeDefined();
    expect(createdGroup.name).toBe(newGroup.group_name);
    //
    expect(createdGroup.creator_user_id).toBe(createdUser1Id);
  });

  test("Search Group", async () => {
    const search_key = "Test";

    // Make a request to create a new group
    const searchResponse = await request_helper.request(
      "GET",
      `/groups/search?group_name=${search_key}`,
      null,
      {
        Authorization: `Bearer ${createdUser1Token}`,
      }
    );

    // Assertions
    expect(searchResponse.status).toBe(200);
    expect(searchResponse.data.groups).toBeDefined();

    const matchingGroups = searchResponse.data.groups;
    expect(Array.isArray(matchingGroups)).toBe(true);

    // Check if each group name contains the search keyword (case-insensitive)
    matchingGroups.forEach((group) => {
      expect(group.name.toLowerCase()).toContain(search_key.toLowerCase());
    });
  });

  test("Add Members to Group", async () => {
    const userIdsToAdd = [createdUser2Id];
    // Make a request to add members to the group
    const addMembersResponse = await request_helper.request(
      "POST",
      `/groups/addMembers/${createdGroupId}`,
      { userIds: userIdsToAdd },
      {
        Authorization: `Bearer ${createdUser1Token}`,
      }
    );

    // Assertions
    expect(addMembersResponse.status).toBe(200);
    expect(addMembersResponse.data.message).toBe("Members added successfully");
    expect(addMembersResponse.data.addedMembers).toBeDefined();

    const addedMembers = addMembersResponse.data.addedMembers;
    expect(Array.isArray(addedMembers)).toBe(true);

    // Check if the added members have the expected structure
    addedMembers.forEach((member) => {
      expect(member.group_id).toBe(createdGroupId);
      expect(member.user_id).toBeDefined();
    });

    userIdsToAdd.forEach((userId) => {
      expect(addedMembers.some((member) => member.user_id === userId)).toBe(
        true
      );
    });
  });

  test("Remove Member from Group", async () => {
    // Make a request to add members to the group
    const removedMemberResponse = await request_helper.request(
      "POST",
      `/groups/removeMember/${createdGroupId}/${createdUser2Id}`,
      {},
      {
        Authorization: `Bearer ${createdUser1Token}`,
      }
    );

    // Assertions
    expect(removedMemberResponse.status).toBe(200);
    expect(removedMemberResponse.data.message).toBe(
      "Member removed from the group successfully."
    );

    // Make a request to fetch group details
    const fetchGroupResponse = await request_helper.request(
      "GET",
      `/groups/${createdGroupId}`,
      null,
      {
        Authorization: `Bearer ${createdUser1Token}`,
      }
    );

    const groupMembers = fetchGroupResponse.data.group.members;
    expect(Array.isArray(groupMembers)).toBe(true);

    expect(
      groupMembers.some((member) => member.user_id !== createdUser2Id)
    ).toBe(true);
  });

  test("Fetch Group Details", async () => {
    // Make a request to fetch group details
    const fetchGroupResponse = await request_helper.request(
      "GET",
      `/groups/${createdGroupId}`,
      null,
      {
        Authorization: `Bearer ${createdUser1Token}`,
      }
    );

    // Assertions
    expect(fetchGroupResponse.status).toBe(200);
    expect(fetchGroupResponse.data.group).toBeDefined();
    expect(fetchGroupResponse.data.group.id).toBe(createdGroupId);
    expect(fetchGroupResponse.data.group.name).toBe("Test Group");
  });

  test("Send Group Message", async () => {
    const messageText = "Hello, group! This is a test message.";

    // Make a request to send a group message
    const sendMessageResponse = await request_helper.request(
      "POST",
      `/groups/sendMessage/${createdGroupId}`,
      { message: messageText },
      {
        Authorization: `Bearer ${createdUser1Token}`,
      }
    );

    // Assertions
    expect(sendMessageResponse.status).toBe(200);
    expect(sendMessageResponse.data.message).toBe(
      "Group message sent successfully"
    );
    expect(sendMessageResponse.data.sentMessage).toBeDefined();

    const sentMessage = sendMessageResponse.data.sentMessage;
    expect(sentMessage.group_id).toBe(createdGroupId);
    expect(sentMessage.user_id).toBeDefined();
    expect(sentMessage.message).toBe(messageText);
  });

  test("Get Group Messages", async () => {
    // Make a request to get group messages
    const getMessagesResponse = await request_helper.request(
      "GET",
      `/groups/getMessages/${createdGroupId}`,
      null,
      {
        Authorization: `Bearer ${createdUser1Token}`,
      }
    );

    // Assertions
    expect(getMessagesResponse.status).toBe(200);
    expect(getMessagesResponse.data.messages).toBeDefined();

    const messages = getMessagesResponse.data.messages;
    expect(Array.isArray(messages)).toBe(true);

    // Check if the sent message is present in the retrieved messages
    const sentMessageText = "Hello, group! This is a test message.";
    const sentMessageExists = messages.some(
      (message) => message.message === sentMessageText
    );

    expect(sentMessageExists).toBe(true);
  });

  test("Like/Unlike Group Message", async () => {
    const userToken = createdUser1Token;
    const groupId = createdGroupId;

    // Make a request to get group messages
    const getMessagesResponse = await request_helper.request(
      "GET",
      `/groups/getMessages/${groupId}`,
      null,
      {
        Authorization: `Bearer ${userToken}`,
      }
    );

    // Assertions
    expect(getMessagesResponse.status).toBe(200);
    expect(getMessagesResponse.data.messages).toBeDefined();

    const messages = getMessagesResponse.data.messages;
    expect(Array.isArray(messages)).toBe(true);

    // Choose a message to like/unlike
    const messageToLike = messages[0];
    const messageId = messageToLike.id;

    // Make a request to like/unlike the chosen message
    const likeMessageResponse = await request_helper.request(
      "POST",
      `/groups/likeMessage/${groupId}/${messageId}`,
      null,
      {
        Authorization: `Bearer ${userToken}`,
      }
    );

    // Assertions for liking/unliking response
    expect(likeMessageResponse.status).toBe(200);
    expect(likeMessageResponse.data.message).toBeDefined();

    // Make a request to get group messages again
    const getMessagesAfterLikeResponse = await request_helper.request(
      "GET",
      `/groups/getMessages/${groupId}`,
      null,
      {
        Authorization: `Bearer ${userToken}`,
      }
    );

    // Assertions for fetching messages after liking/unliking
    expect(getMessagesAfterLikeResponse.status).toBe(200);
    expect(getMessagesAfterLikeResponse.data.messages).toBeDefined();

    const messagesAfterLike = getMessagesAfterLikeResponse.data.messages;
    expect(Array.isArray(messagesAfterLike)).toBe(true);

    // Check if the message is actually liked by the current user
    const likedMessageExists = messagesAfterLike.some(
      (message) => message.id === messageId && message.likes.length > 0
    );

    expect(likedMessageExists).toBe(true);
  });

  test("Delete Group", async () => {
    try {
      // Make a request to delete group
      console.log("createdGroupId", typeof createdGroupId);
      const deleteGroupResponse = await request_helper.request(
        "DELETE",
        `/groups/${createdGroupId}`,
        null,
        {
          Authorization: `Bearer ${createdUser1Token}`,
        }
      );
      expect(deleteGroupResponse.status).toBe(200);
      expect(deleteGroupResponse.data.message).toBe(
        "Group deleted successfully."
      );

      const fetchGroupResponse = await request_helper.request(
        "GET",
        `/groups/${createdGroupId}`,
        null,
        {
          Authorization: `Bearer ${createdUser1Token}`,
        }
      );
      expect(false).toBe(true);
    } catch (err) {
      let fetchGroupResponse = err.response;
      expect(fetchGroupResponse.status).toBe(404);
      expect(fetchGroupResponse.data.error).toBe("Group not found.");
    }
  });
});
