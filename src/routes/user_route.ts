import express from 'express';
import { UserModel } from '../model/UserModel';
import { validateAdmin } from '../middleware/auth.middleware';
import { getHashOfPassword } from '../helper/passwordHelper';

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
        res.status(201).json({ message: 'User created successfully', user: newUser.toJSON() });
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
})


export default router
