import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { CustomError } from '../middleware/errorHandler';

export const practiceController = {
  // Create new practice
  async createPractice(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, description, logo, brandColor, customDomain, emailSignature } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Practice name is required' });
      }

      const practice = await prisma.practice.create({
        data: {
          name,
          description,
          logo,
          brandColor: brandColor || '#3B82F6',
          customDomain,
          emailSignature,
          ownerId: req.user!.id,
        },
        include: {
          owner: {
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
        message: 'Practice created successfully',
        practice,
      });
    } catch (error: any) {
      console.error('Create practice error:', error);
      return res.status(500).json({ error: 'Failed to create practice' });
    }
  },

  // Get practice dashboard
  async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const practiceId = req.params.practiceId;

      // Get practice with all related data
      const practice = await prisma.practice.findFirst({
        where: {
          id: practiceId,
          OR: [
            { ownerId: req.user!.id },
            { staffMembers: { some: { userId: req.user!.id, isActive: true } } },
          ],
        },
        include: {
          clientOrganizations: {
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  industry: true,
                  isActive: true,
                },
              },
              engagements: {
                where: { status: 'ACTIVE' },
              },
              portalAccess: {
                where: { isActive: true },
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          staffMembers: {
            where: { isActive: true },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              assignedClients: {
                include: {
                  organization: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!practice) {
        return res.status(404).json({ error: 'Practice not found' });
      }

      // Calculate metrics
      const totalClients = practice.clientOrganizations.length;
      const activeClients = practice.clientOrganizations.filter(
        (client) => client.status === 'ACTIVE'
      ).length;
      const totalStaff = practice.staffMembers.length;
      const totalRevenue = practice.clientOrganizations.reduce(
        (sum, client) => sum + (Number(client.monthlyFee) || 0),
        0
      );

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentActivity = await prisma.auditLog.findMany({
        where: {
          organizationId: {
            in: practice.clientOrganizations.map((client) => client.organizationId),
          },
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return res.json({
        practice: {
          id: practice.id,
          name: practice.name,
          description: practice.description,
          logo: practice.logo,
          brandColor: practice.brandColor,
          customDomain: practice.customDomain,
          emailSignature: practice.emailSignature,
        },
        metrics: {
          totalClients,
          activeClients,
          totalStaff,
          totalRevenue,
        },
        clients: practice.clientOrganizations,
        staff: practice.staffMembers,
        recentActivity,
      });
    } catch (error: any) {
      console.error('Get practice dashboard error:', error);
      return res.status(500).json({ error: 'Failed to get practice dashboard' });
    }
  },

  // List all client organizations
  async getClients(req: AuthenticatedRequest, res: Response) {
    try {
      const practiceId = req.params.practiceId;
      const { status, search, page = 1, limit = 20 } = req.query;

      const where: any = {
        practiceId,
      };

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { industry: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const clients = await prisma.clientOrganization.findMany({
        where,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              industry: true,
              isActive: true,
              createdAt: true,
            },
          },
          engagements: {
            where: { status: 'ACTIVE' },
          },
          assignedStaff: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      });

      const total = await prisma.clientOrganization.count({ where });

      return res.json({
        clients,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('Get clients error:', error);
      return res.status(500).json({ error: 'Failed to get clients' });
    }
  },

  // Add new client
  async addClient(req: AuthenticatedRequest, res: Response) {
    try {
      const practiceId = req.params.practiceId;
      const {
        organizationId,
        name,
        industry,
        size,
        engagementType,
        monthlyFee,
        startDate,
        notes,
        assignedStaffIds,
      } = req.body;

      if (!organizationId || !name) {
        return res.status(400).json({ error: 'Organization ID and name are required' });
      }

      // Check if organization is already a client
      const existingClient = await prisma.clientOrganization.findUnique({
        where: { organizationId },
      });

      if (existingClient) {
        return res.status(400).json({ error: 'Organization is already a client' });
      }

      const client = await prisma.clientOrganization.create({
        data: {
          practiceId,
          organizationId,
          name,
          industry,
          size,
          engagementType,
          monthlyFee: monthlyFee ? Number(monthlyFee) : null,
          startDate: new Date(startDate),
          notes,
          assignedStaff: {
            connect: assignedStaffIds?.map((id: string) => ({ id })) || [],
          },
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
          assignedStaff: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      return res.status(201).json({
        message: 'Client added successfully',
        client,
      });
    } catch (error: any) {
      console.error('Add client error:', error);
      return res.status(500).json({ error: 'Failed to add client' });
    }
  },

  // Get client details
  async getClient(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, clientId } = req.params;

      const client = await prisma.clientOrganization.findFirst({
        where: {
          id: clientId,
          practiceId,
        },
        include: {
          organization: {
            include: {
              transactions: {
                orderBy: { date: 'desc' },
                take: 10,
              },
              invoices: {
                orderBy: { createdAt: 'desc' },
                take: 5,
              },
              expenses: {
                orderBy: { date: 'desc' },
                take: 10,
              },
            },
          },
          engagements: {
            where: { status: 'ACTIVE' },
          },
          assignedStaff: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          portalAccess: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      return res.json({ client });
    } catch (error: any) {
      console.error('Get client error:', error);
      return res.status(500).json({ error: 'Failed to get client' });
    }
  },

  // Update client
  async updateClient(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, clientId } = req.params;
      const updateData = req.body;

      const client = await prisma.clientOrganization.updateMany({
        where: {
          id: clientId,
          practiceId,
        },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      if (client.count === 0) {
        return res.status(404).json({ error: 'Client not found' });
      }

      return res.json({ message: 'Client updated successfully' });
    } catch (error: any) {
      console.error('Update client error:', error);
      return res.status(500).json({ error: 'Failed to update client' });
    }
  },

  // Get practice team
  async getTeam(req: AuthenticatedRequest, res: Response) {
    try {
      const practiceId = req.params.practiceId;

      const staff = await prisma.practiceStaffMember.findMany({
        where: {
          practiceId,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              lastLoginAt: true,
            },
          },
          assignedClients: {
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      });

      return res.json({ staff });
    } catch (error: any) {
      console.error('Get team error:', error);
      return res.status(500).json({ error: 'Failed to get team' });
    }
  },

  // Assign staff to clients
  async assignStaff(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId } = req.params;
      const { staffId, clientIds } = req.body;

      if (!staffId || !clientIds || !Array.isArray(clientIds)) {
        return res.status(400).json({ error: 'Staff ID and client IDs are required' });
      }

      // Verify staff member belongs to practice
      const staffMember = await prisma.practiceStaffMember.findFirst({
        where: {
          id: staffId,
          practiceId,
          isActive: true,
        },
      });

      if (!staffMember) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Update assigned clients
      await prisma.practiceStaffMember.update({
        where: { id: staffId },
        data: {
          assignedClients: {
            set: clientIds.map((id: string) => ({ id })),
          },
        },
      });

      return res.json({ message: 'Staff assigned successfully' });
    } catch (error: any) {
      console.error('Assign staff error:', error);
      return res.status(500).json({ error: 'Failed to assign staff' });
    }
  },

  // Add staff member to practice
  async addStaffMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId } = req.params;
      const { userId, role, permissions, hourlyRate, notes } = req.body;

      if (!userId || !role) {
        return res.status(400).json({ error: 'User ID and role are required' });
      }

      // Check if user is already a staff member
      const existingStaff = await prisma.practiceStaffMember.findFirst({
        where: {
          practiceId,
          userId,
        },
      });

      if (existingStaff) {
        return res.status(400).json({ error: 'User is already a staff member' });
      }

      const staffMember = await prisma.practiceStaffMember.create({
        data: {
          practiceId,
          userId,
          role,
          permissions,
          hourlyRate: hourlyRate ? Number(hourlyRate) : null,
          notes,
        },
        include: {
          user: {
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
        message: 'Staff member added successfully',
        staffMember,
      });
    } catch (error: any) {
      console.error('Add staff member error:', error);
      return res.status(500).json({ error: 'Failed to add staff member' });
    }
  },
};

