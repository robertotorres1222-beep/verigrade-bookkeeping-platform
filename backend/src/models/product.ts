import { PrismaClient } from '@prisma/client';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  unit: string;
  cost: number;
  price: number;
  margin: number;
  taxRate: number;
  barcode?: string;
  images: string[];
  tags: string[];
  isActive: boolean;
  trackInventory: boolean;
  lowStockThreshold: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplier?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  attributes: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ProductSearchFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  isActive?: boolean;
  trackInventory?: boolean;
  lowStock?: boolean;
  priceRange?: {
    min: number;
    max: number;
  };
  costRange?: {
    min: number;
    max: number;
  };
  marginRange?: {
    min: number;
    max: number;
  };
  supplier?: string;
  customFields?: Record<string, any>;
}

export interface ProductSortOptions {
  field: 'name' | 'sku' | 'price' | 'cost' | 'margin' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface ProductBulkUpdate {
  ids: string[];
  updates: Partial<Product>;
}

export interface ProductImport {
  products: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'userId'>[];
  updateExisting: boolean;
  skipDuplicates: boolean;
}

export interface ProductExport {
  format: 'csv' | 'excel' | 'json';
  filters?: ProductSearchFilters;
  fields?: (keyof Product)[];
}

export class ProductModel {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new product
   */
  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const product = await this.prisma.product.create({
        data: {
          ...data,
          customFields: data.customFields || {},
        },
      });

      return product as Product;
    } catch (error) {
      throw new Error(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get product by ID
   */
  async findById(id: string): Promise<Product | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      return product as Product | null;
    } catch (error) {
      throw new Error(`Failed to find product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get product by SKU
   */
  async findBySku(sku: string, userId: string): Promise<Product | null> {
    try {
      const product = await this.prisma.product.findFirst({
        where: { 
          sku,
          userId,
        },
      });

      return product as Product | null;
    } catch (error) {
      throw new Error(`Failed to find product by SKU: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get products with filters and pagination
   */
  async findMany(
    userId: string,
    filters: ProductSearchFilters = {},
    sort: ProductSortOptions = { field: 'name', direction: 'asc' },
    page: number = 1,
    limit: number = 20
  ): Promise<{ products: Product[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where: any = { userId };

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { sku: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { barcode: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.subcategory) {
        where.subcategory = filters.subcategory;
      }

      if (filters.brand) {
        where.brand = filters.brand;
      }

      if (filters.tags && filters.tags.length > 0) {
        where.tags = {
          hasSome: filters.tags,
        };
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.trackInventory !== undefined) {
        where.trackInventory = filters.trackInventory;
      }

      if (filters.lowStock) {
        where.AND = [
          { trackInventory: true },
          { lowStockThreshold: { gt: 0 } },
        ];
      }

      if (filters.priceRange) {
        where.price = {
          gte: filters.priceRange.min,
          lte: filters.priceRange.max,
        };
      }

      if (filters.costRange) {
        where.cost = {
          gte: filters.costRange.min,
          lte: filters.costRange.max,
        };
      }

      if (filters.marginRange) {
        where.margin = {
          gte: filters.marginRange.min,
          lte: filters.marginRange.max,
        };
      }

      if (filters.supplier) {
        where.supplier = filters.supplier;
      }

      if (filters.customFields) {
        where.customFields = {
          path: Object.keys(filters.customFields),
          equals: filters.customFields,
        };
      }

      // Build order by clause
      const orderBy: any = {};
      orderBy[sort.field] = sort.direction;

      // Get products and total count
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        products: products as Product[],
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`Failed to find products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update product
   */
  async update(id: string, data: Partial<Product>): Promise<Product> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return product as Product;
    } catch (error) {
      throw new Error(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Bulk update products
   */
  async bulkUpdate(updates: ProductBulkUpdate): Promise<number> {
    try {
      const result = await this.prisma.product.updateMany({
        where: {
          id: { in: updates.ids },
        },
        data: {
          ...updates.updates,
          updatedAt: new Date(),
        },
      });

      return result.count;
    } catch (error) {
      throw new Error(`Failed to bulk update products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Bulk delete products
   */
  async bulkDelete(ids: string[]): Promise<number> {
    try {
      const result = await this.prisma.product.deleteMany({
        where: {
          id: { in: ids },
        },
      });

      return result.count;
    } catch (error) {
      throw new Error(`Failed to bulk delete products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(userId: string): Promise<Product[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          userId,
          trackInventory: true,
          lowStockThreshold: { gt: 0 },
        },
      });

      // Filter products that are actually low on stock
      // This would require checking against inventory levels
      return products as Product[];
    } catch (error) {
      throw new Error(`Failed to get low stock products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, userId: string): Promise<Product[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          userId,
          category,
          isActive: true,
        },
        orderBy: { name: 'asc' },
      });

      return products as Product[];
    } catch (error) {
      throw new Error(`Failed to get products by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get product categories
   */
  async getCategories(userId: string): Promise<ProductCategory[]> {
    try {
      const categories = await this.prisma.productCategory.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
      });

      return categories as ProductCategory[];
    } catch (error) {
      throw new Error(`Failed to get categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create product category
   */
  async createCategory(data: Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductCategory> {
    try {
      const category = await this.prisma.productCategory.create({
        data,
      });

      return category as ProductCategory;
    } catch (error) {
      throw new Error(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search products
   */
  async search(
    query: string,
    userId: string,
    limit: number = 20
  ): Promise<Product[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          userId,
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { barcode: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query] } },
          ],
        },
        take: limit,
        orderBy: { name: 'asc' },
      });

      return products as Product[];
    } catch (error) {
      throw new Error(`Failed to search products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get product statistics
   */
  async getStatistics(userId: string): Promise<{
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    totalValue: number;
    averagePrice: number;
    averageCost: number;
    averageMargin: number;
  }> {
    try {
      const [
        totalProducts,
        activeProducts,
        lowStockProducts,
        priceStats,
        costStats,
        marginStats,
      ] = await Promise.all([
        this.prisma.product.count({ where: { userId } }),
        this.prisma.product.count({ where: { userId, isActive: true } }),
        this.prisma.product.count({ 
          where: { 
            userId, 
            trackInventory: true,
            lowStockThreshold: { gt: 0 },
          } 
        }),
        this.prisma.product.aggregate({
          where: { userId },
          _avg: { price: true },
          _sum: { price: true },
        }),
        this.prisma.product.aggregate({
          where: { userId },
          _avg: { cost: true },
        }),
        this.prisma.product.aggregate({
          where: { userId },
          _avg: { margin: true },
        }),
      ]);

      return {
        totalProducts,
        activeProducts,
        lowStockProducts,
        totalValue: priceStats._sum.price || 0,
        averagePrice: priceStats._avg.price || 0,
        averageCost: costStats._avg.cost || 0,
        averageMargin: marginStats._avg.margin || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get product statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default ProductModel;






