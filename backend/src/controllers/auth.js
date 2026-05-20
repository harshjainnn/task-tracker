import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { signAuthToken } from '../utils/jwt.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Inputs validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 2. Prevent duplicate emails
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account is already registered with this email address.',
      });
    }

    // 3. Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (role && !['ADMIN', 'MEMBER'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either ADMIN or MEMBER.',
      });
    }

    // 4. Save to Database
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'MEMBER';
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: userRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 5. Generate JWT Token
    const token = signAuthToken(user);

    res.status(201).json({
      success: true,
      message: 'User account created successfully.',
      token,
      user,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'An account is already registered with this email address.',
      });
    }

    next(error);
  }
};

/**
 * @desc    Authenticate user and generate token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Inputs validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // 2. Verify email existence
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Invalid email or password.',
      });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Invalid email or password.',
      });
    }

    // 4. Assemble User profile for response (excluding password)
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    // 5. Issue JWT Token
    const token = signAuthToken(userProfile);

    res.status(200).json({
      success: true,
      message: 'Authenticated successfully.',
      token,
      user: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user has already been hydrated by verifyToken middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
