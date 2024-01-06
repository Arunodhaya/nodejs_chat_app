import express from 'express'
import { generateToken } from '../middleware/auth.middleware'
import { UserModel } from '../model/user_model';
import { comparePassword } from '../helper/passwordHelper';

const router = express.Router()

router.post('/login',async(req,res)=>{
    const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find the user by email
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await comparePassword(password, user.password as string);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate a JWT token
    const token = generateToken(user);

    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

export default router