import IntegrationFramework, { IntegrationConnection } from '../framework/IntegrationFramework';
import logger from '../../utils/logger';

export interface ShopifyOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  totalPrice: number;
  subtotalPrice: number;
  totalTax: number;
  currency: string;
  status: 'open' | 'closed' | 'cancelled' | 'any';
  financialStatus: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';
  fulfillmentStatus: 'fulfilled' | 'null' | 'partial' | 'restocked';
  createdAt: string;
  updatedAt: string;
  lineItems: Array<{
    id: string;
    productId: string;
    variantId: string;
    title: string;
    quantity: number;
    price: number;
    totalDiscount: number;
  }>;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  vendor?: string;
  productType?: string;
  tags: string[];
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
  updatedAt: string;
  variants: Array<{
    id: string;
    title: string;
    price: string;
    sku?: string;
    inventoryQuantity: number;
    weight: number;
    weightUnit: string;
  }>;
  images: Array<{
    id: string;
    src: string;
    alt?: string;
  }>;
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  totalSpent: number;
  ordersCount: number;
  state: 'disabled' | 'invited' | 'enabled' | 'declined';
  createdAt: string;
  updatedAt: string;
  defaultAddress?: {
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
}

class ShopifyService {
  private framework: IntegrationFramework;

  constructor() {
    this.framework = IntegrationFramework;
    logger.info('[ShopifyService] Initialized');
  }

  /**
   * Gets authorization URL for Shopify OAuth
   */
  public getAuthorizationUrl(userId: string, shop: string): string {
    const state = `${userId}-${Date.now()}`;
    const authUrl = this.framework.getAuthorizationUrl('shopify', userId);
    return authUrl.replace('{shop}', shop);
  }

  /**
   * Exchanges authorization code for access token
   */
  public async connect(userId: string, code: string, shop: string): Promise<IntegrationConnection> {
    // Store shop in metadata for future API calls
    const connection = await this.framework.exchangeCodeForToken('shopify', code, userId);
    connection.metadata = { ...connection.metadata, shop };
    return connection;
  }

  /**
   * Syncs orders from Shopify
   */
  public async syncOrders(connectionId: string, createdAfter?: string): Promise<ShopifyOrder[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    const connection = this.framework.getConnection(connectionId);
    const shop = connection?.metadata?.shop;
    
    if (!shop) {
      throw new Error('Shop not found in connection metadata');
    }

    try {
      const params: any = {
        limit: 250,
        status: 'any'
      };

      if (createdAfter) {
        params.created_at_min = createdAfter;
      }

      const response = await client.get(`/admin/api/2023-10/orders.json`, { params });

      const orders: ShopifyOrder[] = response.data.orders?.map((shopify: any) => ({
        id: shopify.id.toString(),
        orderNumber: shopify.order_number?.toString() || shopify.name,
        customerId: shopify.customer?.id?.toString(),
        customerEmail: shopify.customer?.email,
        totalPrice: parseFloat(shopify.total_price),
        subtotalPrice: parseFloat(shopify.subtotal_price),
        totalTax: parseFloat(shopify.total_tax),
        currency: shopify.currency,
        status: shopify.status,
        financialStatus: shopify.financial_status,
        fulfillmentStatus: shopify.fulfillment_status,
        createdAt: shopify.created_at,
        updatedAt: shopify.updated_at,
        lineItems: shopify.line_items?.map((item: any) => ({
          id: item.id.toString(),
          productId: item.product_id?.toString(),
          variantId: item.variant_id?.toString(),
          title: item.title,
          quantity: item.quantity,
          price: parseFloat(item.price),
          totalDiscount: parseFloat(item.total_discount || 0)
        })) || []
      })) || [];

      logger.info(`[ShopifyService] Synced ${orders.length} orders from Shopify`);
      return orders;
    } catch (error: any) {
      logger.error('[ShopifyService] Error syncing orders:', error);
      throw new Error(`Failed to sync orders: ${error.message}`);
    }
  }

  /**
   * Syncs products from Shopify
   */
  public async syncProducts(connectionId: string, createdAfter?: string): Promise<ShopifyProduct[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    const connection = this.framework.getConnection(connectionId);
    const shop = connection?.metadata?.shop;
    
    if (!shop) {
      throw new Error('Shop not found in connection metadata');
    }

    try {
      const params: any = {
        limit: 250
      };

      if (createdAfter) {
        params.created_at_min = createdAfter;
      }

      const response = await client.get(`/admin/api/2023-10/products.json`, { params });

      const products: ShopifyProduct[] = response.data.products?.map((shopify: any) => ({
        id: shopify.id.toString(),
        title: shopify.title,
        handle: shopify.handle,
        description: shopify.body_html,
        vendor: shopify.vendor,
        productType: shopify.product_type,
        tags: shopify.tags?.split(',').map((tag: string) => tag.trim()) || [],
        status: shopify.status,
        createdAt: shopify.created_at,
        updatedAt: shopify.updated_at,
        variants: shopify.variants?.map((variant: any) => ({
          id: variant.id.toString(),
          title: variant.title,
          price: variant.price,
          sku: variant.sku,
          inventoryQuantity: variant.inventory_quantity || 0,
          weight: parseFloat(variant.weight || 0),
          weightUnit: variant.weight_unit
        })) || [],
        images: shopify.images?.map((image: any) => ({
          id: image.id.toString(),
          src: image.src,
          alt: image.alt
        })) || []
      })) || [];

      logger.info(`[ShopifyService] Synced ${products.length} products from Shopify`);
      return products;
    } catch (error: any) {
      logger.error('[ShopifyService] Error syncing products:', error);
      throw new Error(`Failed to sync products: ${error.message}`);
    }
  }

  /**
   * Syncs customers from Shopify
   */
  public async syncCustomers(connectionId: string, createdAfter?: string): Promise<ShopifyCustomer[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    const connection = this.framework.getConnection(connectionId);
    const shop = connection?.metadata?.shop;
    
    if (!shop) {
      throw new Error('Shop not found in connection metadata');
    }

    try {
      const params: any = {
        limit: 250
      };

      if (createdAfter) {
        params.created_at_min = createdAfter;
      }

      const response = await client.get(`/admin/api/2023-10/customers.json`, { params });

      const customers: ShopifyCustomer[] = response.data.customers?.map((shopify: any) => ({
        id: shopify.id.toString(),
        email: shopify.email,
        firstName: shopify.first_name,
        lastName: shopify.last_name,
        phone: shopify.phone,
        totalSpent: parseFloat(shopify.total_spent),
        ordersCount: shopify.orders_count,
        state: shopify.state,
        createdAt: shopify.created_at,
        updatedAt: shopify.updated_at,
        defaultAddress: shopify.default_address ? {
          id: shopify.default_address.id.toString(),
          firstName: shopify.default_address.first_name,
          lastName: shopify.default_address.last_name,
          company: shopify.default_address.company,
          address1: shopify.default_address.address1,
          address2: shopify.default_address.address2,
          city: shopify.default_address.city,
          province: shopify.default_address.province,
          country: shopify.default_address.country,
          zip: shopify.default_address.zip,
          phone: shopify.default_address.phone
        } : undefined
      })) || [];

      logger.info(`[ShopifyService] Synced ${customers.length} customers from Shopify`);
      return customers;
    } catch (error: any) {
      logger.error('[ShopifyService] Error syncing customers:', error);
      throw new Error(`Failed to sync customers: ${error.message}`);
    }
  }

  /**
   * Creates a product in Shopify
   */
  public async createProduct(connectionId: string, productData: Partial<ShopifyProduct>): Promise<ShopifyProduct> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    const connection = this.framework.getConnection(connectionId);
    const shop = connection?.metadata?.shop;
    
    if (!shop) {
      throw new Error('Shop not found in connection metadata');
    }

    try {
      const shopifyProduct = {
        title: productData.title,
        body_html: productData.description,
        vendor: productData.vendor,
        product_type: productData.productType,
        tags: productData.tags?.join(','),
        status: productData.status || 'active',
        variants: productData.variants?.map(variant => ({
          title: variant.title,
          price: variant.price,
          sku: variant.sku,
          inventory_quantity: variant.inventoryQuantity,
          weight: variant.weight,
          weight_unit: variant.weightUnit
        }))
      };

      const response = await client.post(`/admin/api/2023-10/products.json`, {
        product: shopifyProduct
      });

      const createdProduct = response.data.product;
      const product: ShopifyProduct = {
        id: createdProduct.id.toString(),
        title: createdProduct.title,
        handle: createdProduct.handle,
        description: createdProduct.body_html,
        vendor: createdProduct.vendor,
        productType: createdProduct.product_type,
        tags: createdProduct.tags?.split(',').map((tag: string) => tag.trim()) || [],
        status: createdProduct.status,
        createdAt: createdProduct.created_at,
        updatedAt: createdProduct.updated_at,
        variants: createdProduct.variants?.map((variant: any) => ({
          id: variant.id.toString(),
          title: variant.title,
          price: variant.price,
          sku: variant.sku,
          inventoryQuantity: variant.inventory_quantity || 0,
          weight: parseFloat(variant.weight || 0),
          weightUnit: variant.weight_unit
        })) || [],
        images: createdProduct.images?.map((image: any) => ({
          id: image.id.toString(),
          src: image.src,
          alt: image.alt
        })) || []
      };

      logger.info(`[ShopifyService] Created product ${product.id} in Shopify`);
      return product;
    } catch (error: any) {
      logger.error('[ShopifyService] Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  /**
   * Performs full sync of all Shopify data
   */
  public async performFullSync(connectionId: string): Promise<{
    orders: ShopifyOrder[];
    products: ShopifyProduct[];
    customers: ShopifyCustomer[];
  }> {
    logger.info(`[ShopifyService] Starting full sync for connection ${connectionId}`);
    
    try {
      const [orders, products, customers] = await Promise.all([
        this.syncOrders(connectionId),
        this.syncProducts(connectionId),
        this.syncCustomers(connectionId)
      ]);

      logger.info(`[ShopifyService] Full sync completed: ${orders.length} orders, ${products.length} products, ${customers.length} customers`);
      
      return { orders, products, customers };
    } catch (error: any) {
      logger.error('[ShopifyService] Full sync failed:', error);
      throw error;
    }
  }
}

export default new ShopifyService();










