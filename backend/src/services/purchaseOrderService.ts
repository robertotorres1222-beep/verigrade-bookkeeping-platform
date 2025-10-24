import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  organizationId: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'received' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy: string;
  approvedBy?: string;
  totalAmount: number;
  currency: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  terms?: string;
  paymentTerms?: string;
  shippingAddress?: string;
  billingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  items: PurchaseOrderItem[];
  approvals: PurchaseOrderApproval[];
  receipts: PurchaseOrderReceipt[];
}

export interface PurchaseOrderItem {
  id: string;
  poId: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  pendingQuantity: number;
  unitOfMeasure: string;
  sku?: string;
  category?: string;
  notes?: string;
}

export interface PurchaseOrderApproval {
  id: string;
  poId: string;
  approverId: string;
  approverName: string;
  level: number;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approvedAt?: Date;
  createdAt: Date;
}

export interface PurchaseOrderReceipt {
  id: string;
  poId: string;
  receivedBy: string;
  receivedAt: Date;
  items: PurchaseOrderReceiptItem[];
  notes?: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  invoiceAmount?: number;
}

export interface PurchaseOrderReceiptItem {
  id: string;
  receiptId: string;
  poItemId: string;
  quantityReceived: number;
  condition: 'good' | 'damaged' | 'defective';
  notes?: string;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  organizationId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy: string;
  expectedDeliveryDate?: Date;
  notes?: string;
  terms?: string;
  paymentTerms?: string;
  shippingAddress?: string;
  billingAddress?: string;
  items: Omit<PurchaseOrderItem, 'id' | 'poId' | 'receivedQuantity' | 'pendingQuantity'>[];
  approvers: string[];
}

export interface UpdatePurchaseOrderRequest {
  status?: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'received' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expectedDeliveryDate?: Date;
  notes?: string;
  terms?: string;
  paymentTerms?: string;
  shippingAddress?: string;
  billingAddress?: string;
  items?: Omit<PurchaseOrderItem, 'id' | 'poId' | 'receivedQuantity' | 'pendingQuantity'>[];
}

class PurchaseOrderService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create a new purchase order
   */
  async createPurchaseOrder(data: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    try {
      const poNumber = await this.generatePONumber(data.organizationId);
      
      const result = await this.prisma.$transaction(async (tx) => {
        // Create the purchase order
        const purchaseOrder = await tx.purchaseOrder.create({
          data: {
            id: uuidv4(),
            poNumber,
            supplierId: data.supplierId,
            organizationId: data.organizationId,
            status: 'draft',
            priority: data.priority,
            requestedBy: data.requestedBy,
            totalAmount: data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
            currency: 'USD',
            expectedDeliveryDate: data.expectedDeliveryDate,
            notes: data.notes,
            terms: data.terms,
            paymentTerms: data.paymentTerms,
            shippingAddress: data.shippingAddress,
            billingAddress: data.billingAddress,
          },
        });

        // Create purchase order items
        const poItems = await Promise.all(
          data.items.map(item =>
            tx.purchaseOrderItem.create({
              data: {
                id: uuidv4(),
                poId: purchaseOrder.id,
                productId: item.productId,
                productName: item.productName,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
                receivedQuantity: 0,
                pendingQuantity: item.quantity,
                unitOfMeasure: item.unitOfMeasure,
                sku: item.sku,
                category: item.category,
                notes: item.notes,
              },
            })
          )
        );

        // Create approval workflow
        const approvals = await Promise.all(
          data.approvers.map((approverId, index) =>
            tx.purchaseOrderApproval.create({
              data: {
                id: uuidv4(),
                poId: purchaseOrder.id,
                approverId,
                approverName: await this.getUserName(approverId),
                level: index + 1,
                status: 'pending',
              },
            })
          )
        );

        return {
          ...purchaseOrder,
          items: poItems,
          approvals,
          receipts: [],
        };
      });

      logger.info(`[PurchaseOrderService] Created purchase order: ${result.poNumber}`);
      return result;
    } catch (error) {
      logger.error('[PurchaseOrderService] Failed to create purchase order:', error);
      throw new Error(`Failed to create purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrder(id: string, organizationId: string): Promise<PurchaseOrder | null> {
    try {
      const purchaseOrder = await this.prisma.purchaseOrder.findFirst({
        where: {
          id,
          organizationId,
        },
        include: {
          items: true,
          approvals: {
            orderBy: { level: 'asc' },
          },
          receipts: {
            include: {
              items: true,
            },
          },
        },
      });

      return purchaseOrder;
    } catch (error) {
      logger.error('[PurchaseOrderService] Failed to get purchase order:', error);
      throw new Error(`Failed to get purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get purchase orders with filters
   */
  async getPurchaseOrders(
    organizationId: string,
    filters: {
      status?: string;
      priority?: string;
      supplierId?: string;
      requestedBy?: string;
      dateFrom?: Date;
      dateTo?: Date;
      search?: string;
    } = {},
    pagination: {
      page: number;
      limit: number;
    } = { page: 1, limit: 20 }
  ): Promise<{ data: PurchaseOrder[]; total: number; page: number; limit: number }> {
    try {
      const where: any = {
        organizationId,
      };

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      if (filters.supplierId) {
        where.supplierId = filters.supplierId;
      }

      if (filters.requestedBy) {
        where.requestedBy = filters.requestedBy;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
          where.createdAt.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.createdAt.lte = filters.dateTo;
        }
      }

      if (filters.search) {
        where.OR = [
          { poNumber: { contains: filters.search, mode: 'insensitive' } },
          { notes: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [data, total] = await Promise.all([
        this.prisma.purchaseOrder.findMany({
          where,
          include: {
            items: true,
            approvals: {
              orderBy: { level: 'asc' },
            },
            receipts: {
              include: {
                items: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        this.prisma.purchaseOrder.count({ where }),
      ]);

      return {
        data,
        total,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      logger.error('[PurchaseOrderService] Failed to get purchase orders:', error);
      throw new Error(`Failed to get purchase orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update purchase order
   */
  async updatePurchaseOrder(
    id: string,
    organizationId: string,
    data: UpdatePurchaseOrderRequest
  ): Promise<PurchaseOrder> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Update the purchase order
        const purchaseOrder = await tx.purchaseOrder.update({
          where: {
            id,
            organizationId,
          },
          data: {
            status: data.status,
            priority: data.priority,
            expectedDeliveryDate: data.expectedDeliveryDate,
            notes: data.notes,
            terms: data.terms,
            paymentTerms: data.paymentTerms,
            shippingAddress: data.shippingAddress,
            billingAddress: data.billingAddress,
            updatedAt: new Date(),
          },
        });

        // Update items if provided
        if (data.items) {
          // Delete existing items
          await tx.purchaseOrderItem.deleteMany({
            where: { poId: id },
          });

          // Create new items
          await Promise.all(
            data.items.map(item =>
              tx.purchaseOrderItem.create({
                data: {
                  id: uuidv4(),
                  poId: id,
                  productId: item.productId,
                  productName: item.productName,
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  totalPrice: item.quantity * item.unitPrice,
                  receivedQuantity: 0,
                  pendingQuantity: item.quantity,
                  unitOfMeasure: item.unitOfMeasure,
                  sku: item.sku,
                  category: item.category,
                  notes: item.notes,
                },
              })
            )
          );

          // Update total amount
          const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
          await tx.purchaseOrder.update({
            where: { id },
            data: { totalAmount },
          });
        }

        return purchaseOrder;
      });

      logger.info(`[PurchaseOrderService] Updated purchase order: ${result.poNumber}`);
      return result;
    } catch (error) {
      logger.error('[PurchaseOrderService] Failed to update purchase order:', error);
      throw new Error(`Failed to update purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Submit purchase order for approval
   */
  async submitForApproval(id: string, organizationId: string): Promise<PurchaseOrder> {
    try {
      const result = await this.prisma.purchaseOrder.update({
        where: {
          id,
          organizationId,
        },
        data: {
          status: 'pending_approval',
          updatedAt: new Date(),
        },
      });

      // Send notifications to approvers
      await this.notifyApprovers(id);

      logger.info(`[PurchaseOrderService] Submitted purchase order for approval: ${result.poNumber}`);
      return result;
    } catch (error) {
      logger.error('[PurchaseOrderService] Failed to submit purchase order for approval:', error);
      throw new Error(`Failed to submit purchase order for approval: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Approve purchase order
   */
  async approvePurchaseOrder(
    id: string,
    organizationId: string,
    approverId: string,
    comments?: string
  ): Promise<PurchaseOrder> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Update approval status
        await tx.purchaseOrderApproval.updateMany({
          where: {
            poId: id,
            approverId,
            status: 'pending',
          },
          data: {
            status: 'approved',
            comments,
            approvedAt: new Date(),
          },
        });

        // Check if all approvals are complete
        const pendingApprovals = await tx.purchaseOrderApproval.count({
          where: {
            poId: id,
            status: 'pending',
          },
        });

        let newStatus = 'pending_approval';
        if (pendingApprovals === 0) {
          newStatus = 'approved';
        }

        // Update purchase order status
        const purchaseOrder = await tx.purchaseOrder.update({
          where: {
            id,
            organizationId,
          },
          data: {
            status: newStatus as any,
            approvedBy: approverId,
            updatedAt: new Date(),
          },
        });

        return purchaseOrder;
      });

      logger.info(`[PurchaseOrderService] Approved purchase order: ${result.poNumber}`);
      return result;
    } catch (error) {
      logger.error('[PurchaseOrderService] Failed to approve purchase order:', error);
      throw new Error(`Failed to approve purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reject purchase order
   */
  async rejectPurchaseOrder(
    id: string,
    organizationId: string,
    approverId: string,
    comments: string
  ): Promise<PurchaseOrder> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Update approval status
        await tx.purchaseOrderApproval.updateMany({
          where: {
            poId: id,
            approverId,
            status: 'pending',
          },
          data: {
            status: 'rejected',
            comments,
            approvedAt: new Date(),
          },
        });

        // Update purchase order status
        const purchaseOrder = await tx.purchaseOrder.update({
          where: {
            id,
            organizationId,
          },
          data: {
            status: 'cancelled',
            updatedAt: new Date(),
          },
        });

        return purchaseOrder;
      });

      logger.info(`[PurchaseOrderService] Rejected purchase order: ${result.poNumber}`);
      return result;
    } catch (error) {
      logger.error('[PurchaseOrderService] Failed to reject purchase order:', error);
      throw new Error(`Failed to reject purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Record purchase order receipt
   */
  async recordReceipt(
    id: string,
    organizationId: string,
    receivedBy: string,
    items: Omit<PurchaseOrderReceiptItem, 'id' | 'receiptId'>[],
    notes?: string,
    invoiceNumber?: string,
    invoiceDate?: Date,
    invoiceAmount?: number
  ): Promise<PurchaseOrderReceipt> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Create receipt
        const receipt = await tx.purchaseOrderReceipt.create({
          data: {
            id: uuidv4(),
            poId: id,
            receivedBy,
            receivedAt: new Date(),
            notes,
            invoiceNumber,
            invoiceDate,
            invoiceAmount,
          },
        });

        // Create receipt items
        const receiptItems = await Promise.all(
          items.map(item =>
            tx.purchaseOrderReceiptItem.create({
              data: {
                id: uuidv4(),
                receiptId: receipt.id,
                poItemId: item.poItemId,
                quantityReceived: item.quantityReceived,
                condition: item.condition,
                notes: item.notes,
              },
            })
          )
        );

        // Update purchase order items
        for (const item of items) {
          await tx.purchaseOrderItem.update({
            where: { id: item.poItemId },
            data: {
              receivedQuantity: {
                increment: item.quantityReceived,
              },
              pendingQuantity: {
                decrement: item.quantityReceived,
              },
            },
          });
        }

        // Check if all items are received
        const pendingItems = await tx.purchaseOrderItem.count({
          where: {
            poId: id,
            pendingQuantity: { gt: 0 },
          },
        });

        if (pendingItems === 0) {
          await tx.purchaseOrder.update({
            where: { id },
            data: {
              status: 'received',
              actualDeliveryDate: new Date(),
              updatedAt: new Date(),
            },
          });
        }

        return {
          ...receipt,
          items: receiptItems,
        };
      });

      logger.info(`[PurchaseOrderService] Recorded receipt for purchase order: ${id}`);
      return result;
    } catch (error) {
      logger.error('[PurchaseOrderService] Failed to record receipt:', error);
      throw new Error(`Failed to record receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete purchase order
   */
  async deletePurchaseOrder(id: string, organizationId: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Delete related records
        await tx.purchaseOrderReceiptItem.deleteMany({
          where: {
            receipt: {
              poId: id,
            },
          },
        });

        await tx.purchaseOrderReceipt.deleteMany({
          where: { poId: id },
        });

        await tx.purchaseOrderApproval.deleteMany({
          where: { poId: id },
        });

        await tx.purchaseOrderItem.deleteMany({
          where: { poId: id },
        });

        // Delete purchase order
        await tx.purchaseOrder.delete({
          where: {
            id,
            organizationId,
          },
        });
      });

      logger.info(`[PurchaseOrderService] Deleted purchase order: ${id}`);
    } catch (error) {
      logger.error('[PurchaseOrderService] Failed to delete purchase order:', error);
      throw new Error(`Failed to delete purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get purchase order analytics
   */
  async getPurchaseOrderAnalytics(organizationId: string, dateFrom: Date, dateTo: Date) {
    try {
      const [
        totalPOs,
        totalValue,
        averageValue,
        statusBreakdown,
        priorityBreakdown,
        topSuppliers,
        monthlyTrends,
      ] = await Promise.all([
        // Total POs
        this.prisma.purchaseOrder.count({
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        }),

        // Total value
        this.prisma.purchaseOrder.aggregate({
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          _sum: {
            totalAmount: true,
          },
        }),

        // Average value
        this.prisma.purchaseOrder.aggregate({
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          _avg: {
            totalAmount: true,
          },
        }),

        // Status breakdown
        this.prisma.purchaseOrder.groupBy({
          by: ['status'],
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          _count: {
            id: true,
          },
        }),

        // Priority breakdown
        this.prisma.purchaseOrder.groupBy({
          by: ['priority'],
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          _count: {
            id: true,
          },
        }),

        // Top suppliers
        this.prisma.purchaseOrder.groupBy({
          by: ['supplierId'],
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          _sum: {
            totalAmount: true,
          },
          _count: {
            id: true,
          },
          orderBy: {
            _sum: {
              totalAmount: 'desc',
            },
          },
          take: 10,
        }),

        // Monthly trends
        this.prisma.purchaseOrder.groupBy({
          by: ['createdAt'],
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          _sum: {
            totalAmount: true,
          },
          _count: {
            id: true,
          },
        }),
      ]);

      return {
        totalPOs,
        totalValue: totalValue._sum.totalAmount || 0,
        averageValue: averageValue._avg.totalAmount || 0,
        statusBreakdown: statusBreakdown.map(item => ({
          status: item.status,
          count: item._count.id,
        })),
        priorityBreakdown: priorityBreakdown.map(item => ({
          priority: item.priority,
          count: item._count.id,
        })),
        topSuppliers: topSuppliers.map(item => ({
          supplierId: item.supplierId,
          totalAmount: item._sum.totalAmount || 0,
          count: item._count.id,
        })),
        monthlyTrends: monthlyTrends.map(item => ({
          month: item.createdAt,
          totalAmount: item._sum.totalAmount || 0,
          count: item._count.id,
        })),
      };
    } catch (error) {
      logger.error('[PurchaseOrderService] Failed to get analytics:', error);
      throw new Error(`Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods
  private async generatePONumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    const count = await this.prisma.purchaseOrder.count({
      where: {
        organizationId,
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });

    const poNumber = `PO-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    return poNumber;
  }

  private async getUserName(userId: string): Promise<string> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
    } catch (error) {
      return 'Unknown User';
    }
  }

  private async notifyApprovers(poId: string): Promise<void> {
    // Implementation for sending notifications to approvers
    // This could integrate with email, Slack, or other notification systems
    logger.info(`[PurchaseOrderService] Notifying approvers for PO: ${poId}`);
  }
}

export default new PurchaseOrderService();