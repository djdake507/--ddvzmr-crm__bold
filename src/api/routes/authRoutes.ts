import { Router, Request, Response, NextFunction } from 'express';
import User from '@database/models/User';
import AuthService from '@utils/authService';
import logger from '@utils/logger';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = AuthService.hashPassword(password);
    const user = await User.create({
      tenantId,
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'agent',
    });

    const accessToken = AuthService.generateAccessToken(user.id, tenantId, user.role);
    const refreshToken = AuthService.generateRefreshToken(user.id, tenantId);

    logger.info(`User registered: ${user.id}`);
    res.status(201).json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !AuthService.comparePassword(password, user.passwordHash)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'User account is inactive' });
    }

    const accessToken = AuthService.generateAccessToken(user.id, user.tenantId, user.role);
    const refreshToken = AuthService.generateRefreshToken(user.id, user.tenantId);

    await user.update({ lastLoginAt: new Date() });

    logger.info(`User logged in: ${user.id}`);
    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const decoded = AuthService.verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ success: false, message: 'Invalid token type' });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid user' });
    }

    const newAccessToken = AuthService.generateAccessToken(user.id, user.tenantId, user.role);
    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
