import express from "express";
import { validateUser } from "../middleware/auth.middleware";
import { GroupModel } from "../model/GroupModel";
import { UserModel } from "../model/UserModel";
import { Op } from "sequelize";
import { GroupMembersModel } from "../model/GroupMembersModel";
import { GroupMessagesModel } from "../model/GroupMessagesModel";
import { LikedMessagesModel } from "../model/LikedMessagesModel";

const router = express.Router();

router.post("/create", validateUser, async (req: any, res) => {
  const { group_name } = req.body;
  const { id: creator_user_id } = req.user;

  // Input validation
  if (!group_name) {
    return res.status(400).json({ error: "Group name is required." });
  }

  try {
    // Create a new group
    const newGroup = await GroupModel.create({
      name: group_name,
      creator_user_id,
    });

    // Fetch the created group with creator details
    const createdGroup = await GroupModel.findOne({
      where: { id: newGroup.id },
      include: [
        {
          model: UserModel,
          attributes: ["id", "firstName"], // Specify the attributes you want to include
        },
      ],
    });

    await GroupMembersModel.create({
      group_id: newGroup.id,
      user_id: creator_user_id,
    });

    res
      .status(201)
      .json({ message: "Group created successfully", group: createdGroup });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/search", validateUser, async (req, res) => {
  const { group_name } = req.query;

  // Input validation
  if (!group_name) {
    return res.status(400).json({ error: "Please type the group name" });
  }

  try {
    // Search groups based on the query
    const matchingGroups = await GroupModel.findAll({
      where: {
        name: {
          [Op.like]: `%${group_name}%`, // Case-insensitive search
        },
      },
    });

    res.json({ groups: matchingGroups });
  } catch (error) {
    console.error("Error searching groups:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/addMembers/:groupId", validateUser, async (req: any, res) => {
  const { userIds } = req.body;
  const { groupId } = req.params;

  // Input validation
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "Please provide valid users" });
  }

  try {
    // Check if the group exists
    const group = await GroupModel.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    // Check if the authenticated user is the creator of the group
    if (group.creator_user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Forbidden. Only the group admin can add members." });
    }

    // Find users by their IDs
    const usersToAdd = await UserModel.findAll({
      where: {
        id: {
          [Op.in]: userIds,
        },
      },
    });

    // Check if all users were found
    if (usersToAdd.length !== userIds.length) {
      return res.status(404).json({ error: "One or more users not found." });
    }

    // Check if users are already members of the group
    const existingMembers = await GroupMembersModel.findAll({
      where: {
        group_id: groupId,
        user_id: {
          [Op.in]: userIds,
        },
      },
    });

    if (existingMembers.length > 0) {
      return res
        .status(400)
        .json({ error: "One or more users are already members of the group." });
    }

    // Add members to the group
    const addedMembers = await Promise.all(
      usersToAdd.map(async (user) => {
        return await GroupMembersModel.create({
          group_id: Number(groupId),
          user_id: user.id,
        });
      })
    );

    res.json({ message: "Members added successfully", addedMembers });
  } catch (error) {
    console.error("Error adding members to the group:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/removeMember/:groupId/:userId', validateUser, async (req:any, res) => {
  const { groupId,userId } = req.params;

  try {
    const group = await GroupModel.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    if (group.creator_user_id === userId) {
      return res
        .status(403)
        .json({ error: "You cannot remove yourself" });
    }

    // Check if the authenticated user is the creator of the group
    if (group.creator_user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Forbidden. Only the group admin can remove members." });
    }

    const member = await GroupMembersModel.getMember(group.id, userId);
    if(!member) return res.status(404).json({ error: "Selected member is not in the group" });
    // Remove member from the group
    await GroupMembersModel.destroy({
      where: {
        group_id:groupId,
        user_id:userId
      },
    });

    res.json({ message: 'Member removed from the group successfully.' });
  } catch (error) {
    console.error('Error removing members from the group:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/:groupId", validateUser,async (req, res) => {
  const { groupId } = req.params;

  try {
    // Fetch group details including creator information and members
    const groupDetails = await GroupModel.findOne({
      where: { id: groupId },
      include: [
        {
          model: GroupMembersModel,
          as: "members",
          include:[
            {
                model: UserModel,
                attributes: ["id", "firstName", "lastName"],
              },
          ]
        },
      ],
    });

    if (!groupDetails) {
      return res.status(404).json({ error: "Group not found." });
    }

    res.json({ group: groupDetails });
  } catch (error) {
    console.error("Error getting group details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/sendMessage/:groupId', validateUser, async (req:any, res) => {
  const { groupId } = req.params;
  const { message } = req.body;

  // Input validation
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Please type the message to be sent' });
  }

  try {
    // Check if the group exists
    const group = await GroupModel.findByPk(groupId);

    if (!group) {
    return res.status(404).json({ error: 'Group not found.' });
    }

    // Check if the authenticated user is a member of the group
    const member = await GroupMembersModel.getMember(groupId, req.user.id);
    if (!member) {
    return res.status(403).json({ error: 'Forbidden. Only group members can send messages.' });
    }

    // Create a new group message
    const sentMessage = await GroupMessagesModel.create({
      group_id: Number(groupId),
      user_id: req.user.id,
      message,
    });

    res.json({ message: 'Group message sent successfully', sentMessage });
  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getMessages/:groupId', validateUser, async (req:any, res) => {
  const { groupId } = req.params;

  try {
    // Check if the group exists
    const group = await GroupModel.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    // Check if the authenticated user is a member of the group
    const isMember = await GroupMembersModel.getMember(group.id, req.user.id);

    if (!isMember) {
      return res.status(403).json({ error: 'Forbidden. Only group members can access messages.' });
    }

    // Retrieve messages of the group
    const messages = await GroupMessagesModel.findAll({
      where: { group_id: groupId },
      include: [
        {
          model: UserModel,
          attributes: ['id', 'firstName', 'lastName'],
        },{
          model: LikedMessagesModel,
          as: 'likes',
          // attributes: [],
        },
      ],
      order: [['createdAt', 'ASC']], // Order by createdAt in ascending order
    });

    res.json({ messages });
  } catch (error) {
    console.error('Error getting group messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/likeMessage/:groupId/:messageId', validateUser, async (req:any, res) => {
  const { groupId, messageId } = req.params;

  try {
    // Check if the group exists
    const group = await GroupModel.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    // Check if the authenticated user is a member of the group
    const isMember = await GroupMembersModel.getMember(group.id, req.user.id);

    if (!isMember) {
      return res.status(403).json({ error: 'Forbidden. Only group members can like/unlike messages.' });
    }

    // Check if the message exists
    const message = await GroupMessagesModel.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    // Check if the user has already liked the message
    const hasLiked = await LikedMessagesModel.findOne({
      where: { user_id: req.user.id, message_id: messageId },
    });

    if (hasLiked) {
      // If the user has already liked the message, unlike it
      await LikedMessagesModel.destroy({
        where: { user_id: req.user.id, message_id: messageId },
      });

      res.json({ message: 'Message unliked successfully' });
    } else {
      // If the user has not liked the message, like it
      await LikedMessagesModel.create({
        user_id: req.user.id,
        message_id: messageId,
      });

      res.json({ message: 'Message liked successfully' });
    }
  } catch (error) {
    console.error('Error liking/unliking message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:groupId', validateUser, async (req:any, res) => {
  const { groupId } = req.params;

  try {
    // Check if the authenticated user is the creator of the group
    const isUserGroupCreator = await GroupModel.findOne({
      where: {
        id: groupId,
        creator_user_id: req.user.id,
      },
    });

    if (!isUserGroupCreator) {
      return res.status(403).json({ error: 'Forbidden. Only admin can delete group.' });
    }

    await GroupMembersModel.destroy({
      where:{
        group_id: groupId
      }
    })

    const groupMessages = await GroupMessagesModel.findAll({
      where:{
        group_id: groupId
      }
    })
    const messageIds = groupMessages.map((message) => message.id);

    await LikedMessagesModel.destroy({
      where:{
        message_id: {
          [Op.in] : messageIds
        }
      }
    })

    await GroupMessagesModel.destroy({
      where:{
        group_id: groupId
      }
    })

    // Delete the group
    await GroupModel.destroy({
      where: {
        id: groupId,
      },
    });

    res.json({ message: 'Group deleted successfully.' });
  } catch (error) {
    console.error('Error deleting the group:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
