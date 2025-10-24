import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class ResponseHandler {
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200) {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };

    if (message) {
      response.data = { message, ...(data as any) };
    }

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message?: string) {
    return this.success(res, data, message, 201);
  }

  static error(res: Response, message: string, statusCode: number = 500, details?: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        message,
        ...(details && { details }),
      },
    };

    return res.status(statusCode).json(response);
  }

  static notFound(res: Response, message: string = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static badRequest(res: Response, message: string, details?: any) {
    return this.error(res, message, 400, details);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static conflict(res: Response, message: string) {
    return this.error(res, message, 409);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    }
  ) {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      pagination: {
        ...pagination,
        pages: Math.ceil(pagination.total / pagination.limit),
      },
    };

    return res.json(response);
  }
}

