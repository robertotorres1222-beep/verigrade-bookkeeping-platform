import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { ResponseHandler } from '../utils/response';
import { validateReportBuilder } from '../middleware/validation';

const prisma = new PrismaClient();

interface ReportField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  source: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  value2?: any; // For 'between' operator
}

interface ReportGroupBy {
  field: string;
  order: 'asc' | 'desc';
}

interface ReportBuilder {
  id: string;
  name: string;
  description?: string;
  fields: ReportField[];
  filters: ReportFilter[];
  groupBy: ReportGroupBy[];
  orderBy: ReportGroupBy[];
  isTemplate: boolean;
  isPublic: boolean;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all report builders for organization
 */
export const getReportBuilders = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user;
  const { isTemplate = false, isPublic = false } = req.query;

  const where: any = {
    organizationId
  };

  if (isTemplate === 'true') {
    where.isTemplate = true;
  }

  if (isPublic === 'true') {
    where.isPublic = true;
  }

  const reportBuilders = await prisma.reportBuilder.findMany({
    where,
    include: {
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  ResponseHandler.success(res, reportBuilders, 'Report builders retrieved successfully');
});

/**
 * Get single report builder
 */
export const getReportBuilder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user;

  const reportBuilder = await prisma.reportBuilder.findFirst({
    where: {
      id,
      organizationId
    },
    include: {
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  if (!reportBuilder) {
    throw new AppError('Report builder not found', 404);
  }

  ResponseHandler.success(res, reportBuilder, 'Report builder retrieved successfully');
});

/**
 * Create new report builder
 */
export const createReportBuilder = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, userId } = req.user;
  const { name, description, fields, filters, groupBy, orderBy, isTemplate = false, isPublic = false } = req.body;

  // Validate required fields
  if (!name || !fields || fields.length === 0) {
    throw new AppError('Name and fields are required', 400);
  }

  // Validate field structure
  for (const field of fields) {
    if (!field.name || !field.type || !field.source) {
      throw new AppError('Each field must have name, type, and source', 400);
    }
  }

  const reportBuilder = await prisma.reportBuilder.create({
    data: {
      name,
      description,
      fields: JSON.stringify(fields),
      filters: JSON.stringify(filters || []),
      groupBy: JSON.stringify(groupBy || []),
      orderBy: JSON.stringify(orderBy || []),
      isTemplate,
      isPublic,
      organizationId,
      createdBy: userId
    },
    include: {
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  ResponseHandler.success(res, reportBuilder, 'Report builder created successfully', 201);
});

/**
 * Update report builder
 */
export const updateReportBuilder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user;
  const { name, description, fields, filters, groupBy, orderBy, isTemplate, isPublic } = req.body;

  const reportBuilder = await prisma.reportBuilder.findFirst({
    where: {
      id,
      organizationId
    }
  });

  if (!reportBuilder) {
    throw new AppError('Report builder not found', 404);
  }

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (fields !== undefined) updateData.fields = JSON.stringify(fields);
  if (filters !== undefined) updateData.filters = JSON.stringify(filters);
  if (groupBy !== undefined) updateData.groupBy = JSON.stringify(groupBy);
  if (orderBy !== undefined) updateData.orderBy = JSON.stringify(orderBy);
  if (isTemplate !== undefined) updateData.isTemplate = isTemplate;
  if (isPublic !== undefined) updateData.isPublic = isPublic;

  const updatedReportBuilder = await prisma.reportBuilder.update({
    where: { id },
    data: updateData,
    include: {
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  ResponseHandler.success(res, updatedReportBuilder, 'Report builder updated successfully');
});

/**
 * Delete report builder
 */
export const deleteReportBuilder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user;

  const reportBuilder = await prisma.reportBuilder.findFirst({
    where: {
      id,
      organizationId
    }
  });

  if (!reportBuilder) {
    throw new AppError('Report builder not found', 404);
  }

  await prisma.reportBuilder.delete({
    where: { id }
  });

  ResponseHandler.success(res, null, 'Report builder deleted successfully');
});

/**
 * Execute report builder
 */
export const executeReportBuilder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user;
  const { format = 'json', limit = 1000, offset = 0 } = req.query;

  const reportBuilder = await prisma.reportBuilder.findFirst({
    where: {
      id,
      organizationId
    }
  });

  if (!reportBuilder) {
    throw new AppError('Report builder not found', 404);
  }

  const fields = JSON.parse(reportBuilder.fields);
  const filters = JSON.parse(reportBuilder.filters);
  const groupBy = JSON.parse(reportBuilder.groupBy);
  const orderBy = JSON.parse(reportBuilder.orderBy);

  // Build query based on report configuration
  const query = await buildReportQuery(fields, filters, groupBy, orderBy, organizationId, limit, offset);

  // Execute query and get results
  const results = await executeReportQuery(query);

  // Format results based on requested format
  let formattedResults;
  switch (format) {
    case 'csv':
      formattedResults = formatAsCSV(results, fields);
      break;
    case 'excel':
      formattedResults = formatAsExcel(results, fields);
      break;
    case 'pdf':
      formattedResults = formatAsPDF(results, fields, reportBuilder.name);
      break;
    default:
      formattedResults = results;
  }

  ResponseHandler.success(res, {
    reportBuilder: {
      id: reportBuilder.id,
      name: reportBuilder.name,
      description: reportBuilder.description
    },
    results: formattedResults,
    totalCount: results.length,
    executedAt: new Date()
  }, 'Report executed successfully');
});

/**
 * Get report templates
 */
export const getReportTemplates = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.query;

  const where: any = {
    isTemplate: true,
    isPublic: true
  };

  if (category) {
    where.category = category;
  }

  const templates = await prisma.reportBuilder.findMany({
    where,
    include: {
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  ResponseHandler.success(res, templates, 'Report templates retrieved successfully');
});

/**
 * Create report from template
 */
export const createFromTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { templateId } = req.params;
  const { organizationId, userId } = req.user;
  const { name, description } = req.body;

  const template = await prisma.reportBuilder.findFirst({
    where: {
      id: templateId,
      isTemplate: true,
      isPublic: true
    }
  });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  const reportBuilder = await prisma.reportBuilder.create({
    data: {
      name: name || `${template.name} (Copy)`,
      description: description || template.description,
      fields: template.fields,
      filters: template.filters,
      groupBy: template.groupBy,
      orderBy: template.orderBy,
      isTemplate: false,
      isPublic: false,
      organizationId,
      createdBy: userId
    },
    include: {
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  ResponseHandler.success(res, reportBuilder, 'Report created from template successfully', 201);
});

/**
 * Schedule report
 */
export const scheduleReport = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { organizationId, userId } = req.user;
  const { schedule, recipients, format = 'pdf' } = req.body;

  const reportBuilder = await prisma.reportBuilder.findFirst({
    where: {
      id,
      organizationId
    }
  });

  if (!reportBuilder) {
    throw new AppError('Report builder not found', 404);
  }

  const scheduledReport = await prisma.scheduledReport.create({
    data: {
      reportBuilderId: id,
      schedule: JSON.stringify(schedule),
      recipients: JSON.stringify(recipients),
      format,
      isActive: true,
      organizationId,
      createdBy: userId
    }
  });

  ResponseHandler.success(res, scheduledReport, 'Report scheduled successfully', 201);
});

/**
 * Get scheduled reports
 */
export const getScheduledReports = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user;

  const scheduledReports = await prisma.scheduledReport.findMany({
    where: {
      organizationId
    },
    include: {
      reportBuilder: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  ResponseHandler.success(res, scheduledReports, 'Scheduled reports retrieved successfully');
});

// Helper functions
async function buildReportQuery(fields: ReportField[], filters: ReportFilter[], groupBy: ReportGroupBy[], orderBy: ReportGroupBy[], organizationId: string, limit: number, offset: number) {
  // This is a simplified query builder
  // In a real implementation, you would build complex SQL queries based on the report configuration
  
  let query = `
    SELECT 
      ${fields.map(field => `${field.source} as ${field.name}`).join(', ')}
    FROM transactions t
    WHERE t.organizationId = '${organizationId}'
  `;

  // Add filters
  if (filters && filters.length > 0) {
    const filterConditions = filters.map(filter => {
      switch (filter.operator) {
        case 'equals':
          return `${filter.field} = '${filter.value}'`;
        case 'not_equals':
          return `${filter.field} != '${filter.value}'`;
        case 'contains':
          return `${filter.field} LIKE '%${filter.value}%'`;
        case 'not_contains':
          return `${filter.field} NOT LIKE '%${filter.value}%'`;
        case 'greater_than':
          return `${filter.field} > ${filter.value}`;
        case 'less_than':
          return `${filter.field} < ${filter.value}`;
        case 'between':
          return `${filter.field} BETWEEN ${filter.value} AND ${filter.value2}`;
        case 'in':
          return `${filter.field} IN (${filter.value.map((v: any) => `'${v}'`).join(', ')})`;
        case 'not_in':
          return `${filter.field} NOT IN (${filter.value.map((v: any) => `'${v}'`).join(', ')})`;
        default:
          return '';
      }
    }).filter(condition => condition);

    if (filterConditions.length > 0) {
      query += ` AND ${filterConditions.join(' AND ')}`;
    }
  }

  // Add group by
  if (groupBy && groupBy.length > 0) {
    query += ` GROUP BY ${groupBy.map(gb => gb.field).join(', ')}`;
  }

  // Add order by
  if (orderBy && orderBy.length > 0) {
    query += ` ORDER BY ${orderBy.map(ob => `${ob.field} ${ob.order}`).join(', ')}`;
  }

  // Add limit and offset
  query += ` LIMIT ${limit} OFFSET ${offset}`;

  return query;
}

async function executeReportQuery(query: string) {
  // This would execute the actual query against the database
  // For now, return mock data
  return [
    { id: 1, amount: 1000, description: 'Sample Transaction 1', date: '2024-01-01' },
    { id: 2, amount: 2000, description: 'Sample Transaction 2', date: '2024-01-02' },
    { id: 3, amount: 1500, description: 'Sample Transaction 3', date: '2024-01-03' }
  ];
}

function formatAsCSV(results: any[], fields: ReportField[]): string {
  const headers = fields.map(field => field.name).join(',');
  const rows = results.map(result => 
    fields.map(field => result[field.name] || '').join(',')
  );
  return [headers, ...rows].join('\n');
}

function formatAsExcel(results: any[], fields: ReportField[]): any {
  // This would generate Excel format
  return {
    format: 'excel',
    data: results,
    fields: fields.map(field => field.name)
  };
}

function formatAsPDF(results: any[], fields: ReportField[], reportName: string): any {
  // This would generate PDF format
  return {
    format: 'pdf',
    reportName,
    data: results,
    fields: fields.map(field => field.name),
    generatedAt: new Date()
  };
}
