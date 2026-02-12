const cron = require('node-cron');
const { prisma } = require('../dbConnector');
const { sendPushToTokens } = require('../push/fcm');
const ejs = require('ejs');

class BroadcastScheduler {
  constructor(emailService) {
    this.emailService = emailService;
  }

  start() {
    // Run every minute to check for scheduled broadcasts
    cron.schedule('*/1 * * * *', async () => {
      try {
        await this.processScheduledBroadcasts();
      } catch (error) {
        console.error('Broadcast scheduler error:', error.message);
      }
    });

    // Run every hour to clean up old notifications
    cron.schedule('0 * * * *', async () => {
      try {
        await this.cleanupExpiredNotifications();
      } catch (error) {
        console.error('Cleanup scheduler error:', error.message);
      }
    });

    console.log('Broadcast scheduler started');
  }

  async processScheduledBroadcasts() {
    const now = new Date();
    
    const scheduledBroadcasts = await prisma.notification.findMany({
      where: {
        sendMode: 'LATER',
        status: 'SCHEDULED',
        scheduledAt: { lte: now },
      },
      take: 10, // Process 10 at a time to avoid overload
    });

    for (const notification of scheduledBroadcasts) {
      try {
        console.log(`Processing scheduled broadcast: ${notification.id} - ${notification.title}`);
        
        // Update status to sending
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'SENDING' },
        });

        // Get recipients based on target
        let users = [];
        if (notification.target === 'ALL_USERS') {
          users = await prisma.user.findMany({
            where: { isActive: true },
            select: { 
              id: true, 
              email: true, 
              emailSubscribed: true,
              name: true 
            },
          });
        } else if (notification.target === 'SINGLE_USER' && notification.userId) {
          users = await prisma.user.findMany({
            where: { id: notification.userId, isActive: true },
            select: { 
              id: true, 
              email: true, 
              emailSubscribed: true,
              name: true 
            },
          });
        } else if (notification.target === 'SELECTED_USERS') {
          // Get users from UserNotification table
          const userNotifications = await prisma.userNotification.findMany({
            where: { notificationId: notification.id },
            include: {
              user: {
                select: { 
                  id: true, 
                  email: true, 
                  emailSubscribed: true,
                  name: true 
                },
              },
            },
          });
          users = userNotifications.map(un => un.user);
        }

        if (users.length === 0) {
          console.log(`No recipients found for notification: ${notification.id}`);
          continue;
        }

        // Deliver notifications
        let inAppCreated = 0;
        let pushSent = 0;
        let emailSent = 0;

        // In-App notifications
        if (notification.sendInApp) {
          const existingUserNotifications = await prisma.userNotification.findMany({
            where: { notificationId: notification.id },
            select: { userId: true },
          });

          const existingUserIds = new Set(existingUserNotifications.map(un => un.userId));
          const newUsers = users.filter(u => !existingUserIds.has(u.id));

          if (newUsers.length > 0) {
            await prisma.userNotification.createMany({
              data: newUsers.map(u => ({
                userId: u.id,
                notificationId: notification.id,
                isRead: false,
              })),
            });
            inAppCreated = newUsers.length;
          }

          // Update delivery tracking
          await prisma.deliveryTracking.updateMany({
            where: {
              notificationId: notification.id,
              userId: { in: users.map(u => u.id) },
              channel: 'in_app',
            },
            data: {
              status: 'sent',
              sentAt: new Date(),
            },
          });
        }

        // Push notifications
        if (notification.sendPush) {
          const pushTokens = await prisma.pushToken.findMany({
            where: { userId: { in: users.map(u => u.id) } },
            select: { token: true, userId: true },
          });

          const tokens = pushTokens.map(p => p.token).filter(Boolean);

          if (tokens.length > 0) {
            const pushResult = await sendPushToTokens(tokens, {
              title: notification.title,
              body: notification.message,
              data: {
                type: notification.type,
                notificationId: notification.id,
                ctaUrl: notification.ctaUrl || '',
                priority: notification.priority,
              },
            });

            pushSent = pushResult.successCount || 0;

            // Update delivery tracking for successful pushes
            for (const token of pushResult.successfulTokens || []) {
              const tokenRecord = pushTokens.find(t => t.token === token);
              if (tokenRecord) {
                await prisma.deliveryTracking.updateMany({
                  where: {
                    notificationId: notification.id,
                    userId: tokenRecord.userId,
                    channel: 'push',
                  },
                  data: {
                    status: 'sent',
                    sentAt: new Date(),
                    deviceToken: token,
                  },
                });
              }
            }
          }
        }

        // Email notifications
        if (notification.sendEmail) {
          const emailTargets = users.filter(u => u.email && u.emailSubscribed);

          for (const user of emailTargets) {
            try {
              let htmlContent = notification.message;
              
              if (notification.emailTemplate) {
                // Render EJS template
                htmlContent = await ejs.render(notification.emailTemplate, {
                  name: user.name || 'User',
                  email: user.email,
                  message: notification.message,
                  unsubscribeUrl: `${process.env.APP_URL}/unsubscribe/${user.id}`,
                  notificationId: notification.id,
                });
              }

              await this.emailService.sendHtmlEmail(
                user.email,
                notification.emailSubject || notification.title,
                htmlContent
              );

              // Update delivery tracking
              await prisma.deliveryTracking.updateMany({
                where: {
                  notificationId: notification.id,
                  userId: user.id,
                  channel: 'email',
                },
                data: {
                  status: 'sent',
                  sentAt: new Date(),
                },
              });

              emailSent++;
            } catch (error) {
              console.error(`Failed to send email to ${user.email}:`, error.message);
              
              await prisma.deliveryTracking.updateMany({
                where: {
                  notificationId: notification.id,
                  userId: user.id,
                  channel: 'email',
                },
                data: {
                  status: 'failed',
                  errorMessage: error.message,
                },
              });
            }
          }
        }

        // Update notification with final stats
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            sendMode: 'NOW',
            status: 'COMPLETED',
            scheduledAt: null,
            inAppCreated,
            pushSent,
            emailSent,
            updatedAt: new Date(),
          },
        });

        console.log(`Completed scheduled broadcast: ${notification.id}, sent to ${users.length} users`);
      } catch (error) {
        console.error(`Failed to process scheduled broadcast ${notification.id}:`, error.message);
        
        // Mark as failed
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'FAILED',
            updatedAt: new Date(),
          },
        });
      }
    }
  }

  async cleanupExpiredNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete delivery tracking records older than 30 days
    await prisma.deliveryTracking.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        status: { in: ['sent', 'failed'] },
      },
    });

    // Clean up expired notifications
    await prisma.notification.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        status: { in: ['COMPLETED', 'FAILED'] },
      },
    });

    console.log('Cleanup completed');
  }
}

module.exports = BroadcastScheduler;