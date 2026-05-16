import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from './logger';

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'your_secret_key';
  private jwtExpiration = process.env.JWT_EXPIRATION || '7d';

  public hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  public comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  public generateToken(payload: any, expiresIn?: string): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: expiresIn || this.jwtExpiration,
    });
  }

  public verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new Error('Invalid token');
    }
  }

  public generateRefreshToken(userId: string, tenantId: string): string {
    return this.generateToken(
      { userId, tenantId, type: 'refresh' },
      '30d'
    );
  }

  public generateAccessToken(userId: string, tenantId: string, role: string): string {
    return this.generateToken(
      { userId, tenantId, role, type: 'access' },
      this.jwtExpiration
    );
  }
}

export default new AuthService();
