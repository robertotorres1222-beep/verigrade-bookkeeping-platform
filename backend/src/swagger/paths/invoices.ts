/**
 * @swagger
 * /invoices:
 *   get:
 *     tags: [Invoices]
 *     summary: Get all invoices
 *     description: Retrieve a paginated list of invoices with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, sent, paid, overdue, cancelled]
 *         description: Filter by invoice status
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter invoices from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter invoices until this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in invoice number or client name
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Invoice'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 *   post:
 *     tags: [Invoices]
 *     summary: Create a new invoice
 *     description: Create a new invoice with line items
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - lineItems
 *             properties:
 *               clientId:
 *                 type: string
 *                 example: client-123
 *               invoiceNumber:
 *                 type: string
 *                 example: INV-001
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-02-15
 *               notes:
 *                 type: string
 *                 example: Thank you for your business!
 *               lineItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - description
 *                     - quantity
 *                     - unitPrice
 *                   properties:
 *                     description:
 *                       type: string
 *                       example: Web Development Services
 *                     quantity:
 *                       type: number
 *                       format: decimal
 *                       example: 10
 *                     unitPrice:
 *                       type: number
 *                       format: decimal
 *                       example: 100.00
 *                     taxRate:
 *                       type: number
 *                       format: decimal
 *                       example: 0.08
 *               status:
 *                 type: string
 *                 enum: [draft, sent]
 *                 default: draft
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Invoice'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /invoices/{id}:
 *   get:
 *     tags: [Invoices]
 *     summary: Get invoice by ID
 *     description: Retrieve a specific invoice by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Invoice'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 *   put:
 *     tags: [Invoices]
 *     summary: Update invoice
 *     description: Update an existing invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *                 example: client-123
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-02-15
 *               notes:
 *                 type: string
 *                 example: Updated notes
 *               lineItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: line-item-123
 *                     description:
 *                       type: string
 *                       example: Updated service description
 *                     quantity:
 *                       type: number
 *                       format: decimal
 *                       example: 15
 *                     unitPrice:
 *                       type: number
 *                       format: decimal
 *                       example: 120.00
 *                     taxRate:
 *                       type: number
 *                       format: decimal
 *                       example: 0.08
 *               status:
 *                 type: string
 *                 enum: [draft, sent, paid, overdue, cancelled]
 *                 example: sent
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Invoice'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 *   delete:
 *     tags: [Invoices]
 *     summary: Delete invoice
 *     description: Delete an invoice (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: Invoice deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /invoices/{id}/send:
 *   post:
 *     tags: [Invoices]
 *     summary: Send invoice
 *     description: Send invoice to client via email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: client@example.com
 *               subject:
 *                 type: string
 *                 example: Invoice #{invoiceNumber} from {companyName}
 *               message:
 *                 type: string
 *                 example: Please find attached your invoice.
 *     responses:
 *       200:
 *         description: Invoice sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: Invoice sent successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /invoices/{id}/payments:
 *   get:
 *     tags: [Invoices]
 *     summary: Get invoice payments
 *     description: Retrieve all payments for an invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: payment-123
 *                           amount:
 *                             type: number
 *                             format: decimal
 *                             example: 500.00
 *                           paymentDate:
 *                             type: string
 *                             format: date
 *                             example: 2024-01-15
 *                           paymentMethod:
 *                             type: string
 *                             example: credit_card
 *                           status:
 *                             type: string
 *                             enum: [pending, completed, failed, refunded]
 *                             example: completed
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 *   post:
 *     tags: [Invoices]
 *     summary: Record invoice payment
 *     description: Record a payment for an invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentDate
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 example: 500.00
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, check, credit_card, bank_transfer, other]
 *                 example: credit_card
 *               reference:
 *                 type: string
 *                 example: CHK-123456
 *               notes:
 *                 type: string
 *                 example: Payment received via Stripe
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: payment-123
 *                         amount:
 *                           type: number
 *                           format: decimal
 *                           example: 500.00
 *                         paymentDate:
 *                           type: string
 *                           format: date
 *                           example: 2024-01-15
 *                         paymentMethod:
 *                           type: string
 *                           example: credit_card
 *                         status:
 *                           type: string
 *                           example: completed
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */










