import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

//  Register - Create new user account

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please provide username, email, and password' });
    }
    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long"
      });
    }
    //  If email already exists

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        error: 'Email already registered. Please login or use different email'
      });
    }

    // User name exists or not 
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({
        error: 'Username already taken. Please choose a different username'
      });
    }

    //  Hash the password 
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(' Password hashed successfully');

    //  Create new user in Database
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword
    });
    console.log('User created:', user.username);

    // Generate JWT token 
    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    //  Send response 
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Registration error: ', error);
    res.status(500).json({
      error: 'Server error during registration. please try again later'
    });
  }
};

// Login : Authenticate existing user

export const login = async (req, res) => {
  try {
    const {email, password} = req.body;
    if(!email || !password) {
      return res.status(400).json({
        error: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if(!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }
    console.log(' User Found:', user.username);
    //  Compare provided password with stored hashed password

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid) {
      console.log('Invalid password attempt');
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }
    console.log('Password verified successfully');

    // Generate JWT token 
    const token = jwt.sign(
      { userId: user._id},
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Send response
    res.status(200).json({
      message: 'Login successful',
      user: {
        _id:user._id,
        username:user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error during login. Please try again.'
    });
  }
};

// Get current user

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if(!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
       }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Server error. Please try again'
    });
  }
};