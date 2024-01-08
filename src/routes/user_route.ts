import express from 'express';
import { UserModel } from '../model/UserModel';
import { validateAdmin, validateUser } from '../middleware/auth.middleware';
import { getHashOfPassword } from '../helper/passwordHelper';
import { Op, Sequelize } from 'sequelize';

const router = express.Router()

router.post("/create", validateAdmin, async (req, res) => {

    const { firstName, lastName, email, password, isAdmin } = req.body;
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'All fields (firstName, lastName, email, password) are required.' });
      }
    try {
        // Check if a user with the provided email already exists
        const existingUser = await UserModel.findOne({ where: { email } });
    
        if (existingUser) {
          return res.status(400).json({ error: 'User with this email already exists' });
        }
    
        // Create a new user record in the database
        const newUser = await UserModel.create({
          firstName,
          lastName,
          email,
          password:getHashOfPassword(password),
          isAdmin,
        });
    
        console.log('User created successfully:', newUser.toJSON());
        res.status(201).json({ message: 'User created successfully', user: newUser });
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
})

router.put('/edit/:userId',validateAdmin, async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, isAdmin, password } = req.body;

  try {
    // Check if the user to be edited exists
    const userToEdit = await UserModel.findByPk(userId);

    if (!userToEdit) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update user information
    userToEdit.firstName = firstName || userToEdit.firstName;
    userToEdit.lastName = lastName || userToEdit.lastName;
    userToEdit.email = email || userToEdit.email;
    userToEdit.isAdmin = isAdmin !== undefined ? isAdmin : userToEdit.isAdmin;
    userToEdit.password = password ? getHashOfPassword(password):userToEdit.password


    // Save the changes
    await userToEdit.save();

    res.json({ message: 'User updated successfully', user: userToEdit });
  } catch (error) {
    console.error('Error editing user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/search', validateUser, async (req, res) => {
  const { query } = req.query;
  try {
    // Perform the search
    const users = await UserModel.findAll({
      where: {
        [Op.or]:[
          {firstName: {
            [Op.like]: `%${query}%`, // Case-insensitive search
          }},
          {lastName: {
            [Op.like]: `%${query}%`, // Case-insensitive search
          }},
        ]
        
      },
    });

    res.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default router
