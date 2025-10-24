import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const messagingController = {
  // Send message
  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        recipientId,
        subject,
        content,
        messageType = 'GENERAL',
        priority = 'NORMAL',
        attachments = [],
        isInternal = false,
      } = req.body;

      if (!recipientId || !content) {
        return res.status(400).json({ error: 'Recipient ID and content are required' });
      }

      const message = await prisma.message.create({
        data: {
          organizationId: req.user!.organizationId,
          practiceId: req.body.practiceId,
          senderId: req.user!.id,
          recipientId,
          subject,
          content,
          messageType,
          priority,
          attachments,
          isInternal,
          sentAt: new Date(),
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return res.status(201).json({
        message: 'Message sent successfully',
        message: message,
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      return res.status(500).json({ error: 'Failed to send message' });
    }
  },

  // Get messages
  async getMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const { 
        conversationId, 
        messageType, 
        isRead, 
        priority, 
        page = 1, 
        limit = 20 
      } = req.query;

      const where: any = {
        OR: [
          { senderId: req.user!.id },
          { recipientId: req.user!.id },
        ],
      };

      if (conversationId) {
        where.conversationId = conversationId;
      }

      if (messageType) {
        where.messageType = messageType;
      }

      if (isRead !== undefined) {
        where.isRead = isRead === 'true';
      }

      if (priority) {
        where.priority = priority;
      }

      // Mock data for demo
      const mockMessages = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          senderId: 'user-1',
          senderName: 'Sarah Johnson',
          recipientId: 'user-2',
          recipientName: 'Mike Chen',
          subject: 'Client document review needed',
          content: 'Hi Mike, can you review the Q1 financial statements for TechStart Inc?',
          messageType: 'DOCUMENT_REQUEST',
          priority: 'HIGH',
          isRead: false,
          sentAt: '2024-01-20T10:30:00Z',
          attachments: [],
        },
        {
          id: 'msg-2',
          conversationId: 'conv-1',
          senderId: 'user-2',
          senderName: 'Mike Chen',
          recipientId: 'user-1',
          recipientName: 'Sarah Johnson',
          subject: 'Re: Client document review needed',
          content: 'Sure, I\'ll review them by end of day. Any specific areas to focus on?',
          messageType: 'GENERAL',
          priority: 'NORMAL',
          isRead: true,
          sentAt: '2024-01-20T11:15:00Z',
          attachments: [],
        },
        {
          id: 'msg-3',
          conversationId: 'conv-2',
          senderId: 'client-1',
          senderName: 'John Doe (TechStart Inc)',
          recipientId: 'user-1',
          recipientName: 'Sarah Johnson',
          subject: 'Question about tax deductions',
          content: 'Hi Sarah, I have a question about business expense deductions for this year.',
          messageType: 'CLIENT_INQUIRY',
          priority: 'NORMAL',
          isRead: false,
          sentAt: '2024-01-21T09:00:00Z',
          attachments: [],
        },
      ];

      const filteredMessages = mockMessages.filter(msg => {
        if (messageType && msg.messageType !== messageType) return false;
        if (isRead !== undefined && msg.isRead !== (isRead === 'true')) return false;
        if (priority && msg.priority !== priority) return false;
        return true;
      });

      return res.json({
        messages: filteredMessages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredMessages.length,
          pages: Math.ceil(filteredMessages.length / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('Get messages error:', error);
      return res.status(500).json({ error: 'Failed to get messages' });
    }
  },

  // Mark message as read
  async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { messageId } = req.params;

      const message = await prisma.message.update({
        where: { id: messageId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return res.json({
        message: 'Message marked as read',
        message: message,
      });
    } catch (error: any) {
      console.error('Mark message as read error:', error);
      return res.status(500).json({ error: 'Failed to mark message as read' });
    }
  },

  // Get conversations
  async getConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const { isActive } = req.query;

      // Mock conversations data
      const mockConversations = [
        {
          id: 'conv-1',
          participants: [
            { id: 'user-1', name: 'Sarah Johnson', role: 'Accountant' },
            { id: 'user-2', name: 'Mike Chen', role: 'Senior Accountant' },
          ],
          lastMessage: {
            content: 'Sure, I\'ll review them by end of day.',
            sentAt: '2024-01-20T11:15:00Z',
            senderName: 'Mike Chen',
          },
          unreadCount: 0,
          isActive: true,
        },
        {
          id: 'conv-2',
          participants: [
            { id: 'client-1', name: 'John Doe (TechStart Inc)', role: 'Client' },
            { id: 'user-1', name: 'Sarah Johnson', role: 'Accountant' },
          ],
          lastMessage: {
            content: 'Hi Sarah, I have a question about tax deductions.',
            sentAt: '2024-01-21T09:00:00Z',
            senderName: 'John Doe',
          },
          unreadCount: 1,
          isActive: true,
        },
        {
          id: 'conv-3',
          participants: [
            { id: 'client-2', name: 'Jane Smith (ABC Consulting)', role: 'Client' },
            { id: 'user-2', name: 'Mike Chen', role: 'Senior Accountant' },
          ],
          lastMessage: {
            content: 'Thanks for the quick turnaround on the financial statements.',
            sentAt: '2024-01-19T16:30:00Z',
            senderName: 'Jane Smith',
          },
          unreadCount: 0,
          isActive: false,
        },
      ];

      const filteredConversations = mockConversations.filter(conv => {
        if (isActive !== undefined && conv.isActive !== (isActive === 'true')) return false;
        return true;
      });

      return res.json({ conversations: filteredConversations });
    } catch (error: any) {
      console.error('Get conversations error:', error);
      return res.status(500).json({ error: 'Failed to get conversations' });
    }
  },

  // Get messaging statistics
  async getMessagingStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, startDate, endDate } = req.query;

      // Mock statistics
      const statistics = {
        totalMessages: 1250,
        unreadMessages: 15,
        messagesByType: {
          'GENERAL': 800,
          'DOCUMENT_REQUEST': 200,
          'CLIENT_INQUIRY': 150,
          'URGENT': 100,
        },
        messagesByPriority: {
          'LOW': 200,
          'NORMAL': 900,
          'HIGH': 120,
          'URGENT': 30,
        },
        responseTime: {
          average: 2.5, // hours
          median: 1.8,
          p95: 6.2,
        },
        topSenders: [
          {
            userId: 'user-1',
            name: 'Sarah Johnson',
            messageCount: 450,
            avgResponseTime: 1.5,
          },
          {
            userId: 'user-2',
            name: 'Mike Chen',
            messageCount: 380,
            avgResponseTime: 2.1,
          },
        ],
      };

      return res.json({ statistics });
    } catch (error: any) {
      console.error('Get messaging statistics error:', error);
      return res.status(500).json({ error: 'Failed to get messaging statistics' });
    }
  },
};

