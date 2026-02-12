const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class AuthManager {
  constructor(config = {}) {
    this.config = {
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
      jwtExpiresIn: '7d', // Default session
      bcryptRounds: 10,
      maxLoginAttempts: 5,
      lockTime: 15 * 60 * 1000, // 15 minutes
      ...config
    };
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, this.config.bcryptRounds);
  }

  /**
   * Compare password
   */
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate JWT token
   * Includes 'issuedAt' to help frontend track the 3-day auto-logout rule
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        authProvider: user.authProvider,
        iat: Math.floor(Date.now() / 1000) // Explicit Issued At
      },
      this.config.jwtSecret,
      { expiresIn: this.config.jwtExpiresIn }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.config.jwtSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Session expired. Please login again.');
      }
      throw new Error('Invalid token');
    }
  }

  /**
   * Generate magic link token
   */
  generateMagicToken(email, redirectUrl = null) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    const payload = {
      email,
      token,
      type: 'magic_link',
      redirectUrl,
      expiresAt: expiresAt.toISOString()
    };

    const encoded = jwt.sign(payload, this.config.jwtSecret, { expiresIn: '15m' });
    
    return {
      token: encoded,
      expiresAt,
      url: `${process.env.CLIENT_URL}/auth/callback?token=${encoded}` // Corrected to use callback
    };
  }

  /**
   * Verify magic link token
   */
  verifyMagicToken(token) {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret);
      
      if (decoded.type !== 'magic_link') {
        throw new Error('Invalid token type');
      }

      if (new Date(decoded.expiresAt) < new Date()) {
        throw new Error('Token expired');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired magic link');
    }
  }

  /**
   * Generate OTP
   */
  generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  /**
   * Check if user account is locked
   */
  isAccountLocked(user) {
    if (!user.lockUntil) return false;
    return new Date(user.lockUntil) > new Date();
  }

  /**
   * Handle failed login attempt
   * Returns a calculated response to show "Attempts remaining" or "Locked until"
   */
  async handleFailedLogin(user, userService) {
    const loginAttempts = (user.loginAttempts || 0) + 1;
    let lockUntil = null;
    let isLocked = false;

    if (loginAttempts >= this.config.maxLoginAttempts) {
      lockUntil = new Date(Date.now() + this.config.lockTime);
      isLocked = true;
    }

    await userService.update(user.id, {
      loginAttempts,
      lockUntil
    });

    return {
      loginAttempts,
      lockUntil,
      isLocked,
      remainingAttempts: Math.max(0, this.config.maxLoginAttempts - loginAttempts)
    };
  }

  /**
   * Reset login attempts on successful login
   */
  async resetLoginAttempts(userId, userService) {
    await userService.update(userId, {
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date()
    });
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  validatePassword(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('One special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = AuthManager;