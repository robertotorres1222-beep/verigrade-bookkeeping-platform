import { Request, Response } from 'express';
import { completeInventoryService } from '../services/completeInventoryService';
import logger from '../utils/logger';

export class CompleteInventoryController {
  // Product Management
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await completeInventoryService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      logger.error('Error creating product', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        category: req.query.category as string,
        status: req.query.status as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await completeInventoryService.getProducts(filters);
      res.json({
        success: true,
        data: result,
        message: 'Products retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching products', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await completeInventoryService.getProducts({ search: id || '' });
      
      if (product.products.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        data: product.products[0],
        message: 'Product retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching product', { error, productId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await completeInventoryService.updateProduct(id || '', req.body);
      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      logger.error('Error updating product', { error, productId: id, body: req.body });
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
      await completeInventoryService.deleteProduct(id || '');
      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting product', { error, productId: id });
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Warehouse Management
  async createWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const warehouse = await completeInventoryService.createWarehouse(req.body);
      res.status(201).json({
        success: true,
        data: warehouse,
        message: 'Warehouse created successfully',
      });
    } catch (error) {
      logger.error('Error creating warehouse', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create warehouse',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getWarehouses(req: Request, res: Response): Promise<void> {
    try {
      const warehouses = await completeInventoryService.getWarehouses();
      res.json({
        success: true,
        data: warehouses,
        message: 'Warehouses retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching warehouses', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch warehouses',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const warehouse = await completeInventoryService.updateWarehouse(id || '', req.body);
      res.json({
        success: true,
        data: warehouse,
        message: 'Warehouse updated successfully',
      });
    } catch (error) {
      logger.error('Error updating warehouse', { error, warehouseId: id, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to update warehouse',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Bin Location Management
  async createBinLocation(req: Request, res: Response): Promise<void> {
    try {
      const binLocation = await completeInventoryService.createBinLocation(req.body);
      res.status(201).json({
        success: true,
        data: binLocation,
        message: 'Bin location created successfully',
      });
    } catch (error) {
      logger.error('Error creating bin location', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create bin location',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getBinLocations(req: Request, res: Response): Promise<void> {
    try {
      const { warehouseId } = req.params;
      const binLocations = await completeInventoryService.getBinLocations(warehouseId || '');
      res.json({
        success: true,
        data: binLocations,
        message: 'Bin locations retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching bin locations', { error, warehouseId: req.params.warehouseId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bin locations',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Inventory Management
  async getInventory(req: Request, res: Response): Promise<void> {
    try {
      const { productId, warehouseId } = req.query;
      const inventory = await completeInventoryService.getInventory(
        productId as string || undefined,
        warehouseId as string || undefined
      );
      res.json({
        success: true,
        data: inventory,
        message: 'Inventory retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching inventory', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch inventory',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateInventoryQuantity(req: Request, res: Response): Promise<void> {
    try {
      const { productId, warehouseId } = req.params;
      const { quantity, transactionType } = req.body;
      
      const inventory = await completeInventoryService.updateInventoryQuantity(
        productId || '',
        warehouseId || '',
        quantity,
        transactionType
      );
      
      res.json({
        success: true,
        data: inventory,
        message: 'Inventory quantity updated successfully',
      });
    } catch (error) {
      logger.error('Error updating inventory quantity', { error, params: req.params, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to update inventory quantity',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Purchase Order Management
  async createPurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const purchaseOrder = await completeInventoryService.createPurchaseOrder(req.body);
      res.status(201).json({
        success: true,
        data: purchaseOrder,
        message: 'Purchase order created successfully',
      });
    } catch (error) {
      logger.error('Error creating purchase order', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create purchase order',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getPurchaseOrders(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        vendorId: req.query.vendorId as string || undefined,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await completeInventoryService.getPurchaseOrders(filters);
      res.json({
        success: true,
        data: result,
        message: 'Purchase orders retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching purchase orders', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch purchase orders',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async receivePurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { receivedItems } = req.body;
      
      await completeInventoryService.receivePurchaseOrder(id || '', receivedItems);
      res.json({
        success: true,
        message: 'Purchase order received successfully',
      });
    } catch (error) {
      logger.error('Error receiving purchase order', { error, poId: req.params.id, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to receive purchase order',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Cost Layer Management
  async getCostLayers(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const costLayers = await completeInventoryService.getCostLayers(productId || '');
      res.json({
        success: true,
        data: costLayers,
        message: 'Cost layers retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching cost layers', { error, productId: req.params.productId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cost layers',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Inventory Forecasting
  async generateInventoryForecast(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { method } = req.body;
      
      const forecasts = await completeInventoryService.generateInventoryForecast(productId || '', method);
      res.json({
        success: true,
        data: forecasts,
        message: 'Inventory forecast generated successfully',
      });
    } catch (error) {
      logger.error('Error generating inventory forecast', { error, productId: req.params.productId, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to generate inventory forecast',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Inventory Adjustments
  async createInventoryAdjustment(req: Request, res: Response): Promise<void> {
    try {
      const adjustment = await completeInventoryService.createInventoryAdjustment(req.body);
      res.status(201).json({
        success: true,
        data: adjustment,
        message: 'Inventory adjustment created successfully',
      });
    } catch (error) {
      logger.error('Error creating inventory adjustment', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create inventory adjustment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async approveInventoryAdjustment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await completeInventoryService.approveInventoryAdjustment(id || '');
      res.json({
        success: true,
        message: 'Inventory adjustment approved successfully',
      });
    } catch (error) {
      logger.error('Error approving inventory adjustment', { error, adjustmentId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to approve inventory adjustment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Inventory Transfers
  async createInventoryTransfer(req: Request, res: Response): Promise<void> {
    try {
      const transfer = await completeInventoryService.createInventoryTransfer(req.body);
      res.status(201).json({
        success: true,
        data: transfer,
        message: 'Inventory transfer created successfully',
      });
    } catch (error) {
      logger.error('Error creating inventory transfer', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create inventory transfer',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async completeInventoryTransfer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await completeInventoryService.completeInventoryTransfer(id || '');
      res.json({
        success: true,
        message: 'Inventory transfer completed successfully',
      });
    } catch (error) {
      logger.error('Error completing inventory transfer', { error, transferId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to complete inventory transfer',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Analytics and Reporting
  async getInventoryAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await completeInventoryService.getInventoryAnalytics();
      res.json({
        success: true,
        data: analytics,
        message: 'Inventory analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching inventory analytics', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch inventory analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const completeInventoryController = new CompleteInventoryController();
