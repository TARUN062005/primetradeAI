const { prisma } = require('../../../utils/dbConnector');

class ActivityService {
  /**
   * Log a user action (e.g., "Logged in via Google", "Password Changed")
   */
  async log(userId, action, details = null, ip = null) {
    try {
      return await prisma.activityLog.create({
        data: {
          userId,
          action,
          details,
          ip
        }
      });
    } catch (error) {
      console.error('Failed to create activity log:', error);
    }
  }

  /**
   * Fetch recent activity for the Dashboard UI
   */
  async getRecentActivity(userId, limit = 10) {
    return await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}

module.exports = new ActivityService();