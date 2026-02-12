const { prisma } = require('../utils/dbConnector');

class PushController {
  constructor() {
    this.registerToken = this.registerToken.bind(this);
    this.removeToken = this.removeToken.bind(this);
  }

  /**
   * POST /api/user/push/register
   * Body: { token, platform, deviceId }
   */
  async registerToken(req, res) {
    try {
      const userId = req.user.id;
      const { token, platform, deviceId } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'token is required',
        });
      }

      // Avoid duplicates
      const existing = await prisma.pushToken.findUnique({
        where: { token },
      });

      if (existing) {
        // If token exists but belongs to different user, reassign it
        if (existing.userId !== userId) {
          await prisma.pushToken.update({
            where: { token },
            data: {
              userId,
              platform: platform || 'WEB',
              deviceId: deviceId || null,
              userAgent: req.headers['user-agent'] || null,
              lastUsed: new Date(),
            },
          });
        } else {
          await prisma.pushToken.update({
            where: { token },
            data: {
              platform: platform || 'WEB',
              deviceId: deviceId || null,
              userAgent: req.headers['user-agent'] || null,
              lastUsed: new Date(),
            },
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Push token updated',
        });
      }

      await prisma.pushToken.create({
        data: {
          userId,
          token,
          platform: platform || 'WEB',
          deviceId: deviceId || null,
          userAgent: req.headers['user-agent'] || null,
          lastUsed: new Date(),
        },
      });

      res.status(201).json({
        success: true,
        message: 'Push token registered',
      });
    } catch (err) {
      console.error('Push registerToken error:', err.message);
      res.status(500).json({
        success: false,
        message: 'Failed to register push token',
      });
    }
  }

  /**
   * DELETE /api/user/push/remove
   * Body: { token }
   */
  async removeToken(req, res) {
    try {
      const userId = req.user.id;
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'token is required',
        });
      }

      await prisma.pushToken.deleteMany({
        where: {
          userId,
          token,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Push token removed',
      });
    } catch (err) {
      console.error('Push removeToken error:', err.message);
      res.status(500).json({
        success: false,
        message: 'Failed to remove push token',
      });
    }
  }
}

module.exports = new PushController();
