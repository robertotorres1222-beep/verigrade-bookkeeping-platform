import { Request, Response } from 'express';
import { inventoryService } from '../services/inventoryService';
import logger from '../utils/logger';

export class InventoryController {
  // Product Management
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await inventoryService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      logger.error('Error creating product', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search, category } = req.query;
      const products = await inventoryService.getProducts({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        category: category as string,
      });

      res.json({
        success: true,
        data: products,
        message: 'Products retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving products', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve products',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await inventoryService.getProduct(id);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        data: product,
        message: 'Product retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving product', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await inventoryService.updateProduct(id, req.body);

      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      logger.error('Error updating product', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await inventoryService.deleteProduct(id);

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting product', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Stock Management
  async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { quantity, type, reason } = req.body;
      
      const result = await inventoryService.updateStock(productId, {
        quantity,
        type,
        reason,
      });

      res.json({
        success: true,
        data: result,
        message: 'Stock updated successfully',
      });
    } catch (error) {
      logger.error('Error updating stock', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to update stock',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getStockLevels(req: Request, res: Response): Promise<void> {
    try {
      const { lowStock = false } = req.query;
      const stockLevels = await inventoryService.getStockLevels(lowStock === 'true');

      res.json({
        success: true,
        data: stockLevels,
        message: 'Stock levels retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving stock levels', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve stock levels',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Purchase Orders
  async createPurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const purchaseOrder = await inventoryService.createPurchaseOrder(req.body);

      res.status(201).json({
        success: true,
        data: purchaseOrder,
        message: 'Purchase order created successfully',
      });
    } catch (error) {
      logger.error('Error creating purchase order', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to create purchase order',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getPurchaseOrders(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const purchaseOrders = await inventoryService.getPurchaseOrders({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
      });

      res.json({
        success: true,
        data: purchaseOrders,
        message: 'Purchase orders retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving purchase orders', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve purchase orders',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updatePurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const purchaseOrder = await inventoryService.updatePurchaseOrder(id, req.body);

      res.json({
        success: true,
        data: purchaseOrder,
        message: 'Purchase order updated successfully',
      });
    } catch (error) {
      logger.error('Error updating purchase order', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to update purchase order',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // COGS Calculations
  async calculateCOGS(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { method = 'FIFO' } = req.query;
      
      const cogs = await inventoryService.calculateCOGS(productId, method as string);

      res.json({
        success: true,
        data: { cogs, method },
        message: 'COGS calculated successfully',
      });
    } catch (error) {
      logger.error('Error calculating COGS', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to calculate COGS',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Low Stock Alerts
  async getLowStockAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await inventoryService.getLowStockAlerts();

      res.json({
        success: true,
        data: alerts,
        message: 'Low stock alerts retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving low stock alerts', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve low stock alerts',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Inventory Analytics
  async getInventoryAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30' } = req.query;
      const analytics = await inventoryService.getInventoryAnalytics(parseInt(period as string));

      res.json({
        success: true,
        data: analytics,
        message: 'Inventory analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving inventory analytics', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const inventoryController = new InventoryController();