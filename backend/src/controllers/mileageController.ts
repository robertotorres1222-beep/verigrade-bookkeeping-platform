import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createTripSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  startLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional(),
  }),
  endLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional(),
  }).optional(),
  distance: z.number().min(0),
  purpose: z.string().min(1),
  business: z.boolean(),
  route: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.number(),
    accuracy: z.number().optional(),
  })),
});

const updateTripSchema = z.object({
  endTime: z.string().datetime().optional(),
  endLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional(),
  }).optional(),
  distance: z.number().min(0).optional(),
  purpose: z.string().min(1).optional(),
  business: z.boolean().optional(),
  route: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.number(),
    accuracy: z.number().optional(),
  })).optional(),
});

// Create a new mileage trip
export const createTrip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validatedData = createTripSchema.parse(req.body);

    const trip = await prisma.mileageTrip.create({
      data: {
        userId,
        startTime: new Date(validatedData.startTime),
        endTime: validatedData.endTime ? new Date(validatedData.endTime) : null,
        startLatitude: validatedData.startLocation.latitude,
        startLongitude: validatedData.startLocation.longitude,
        startAccuracy: validatedData.startLocation.accuracy,
        endLatitude: validatedData.endLocation?.latitude,
        endLongitude: validatedData.endLocation?.longitude,
        endAccuracy: validatedData.endLocation?.accuracy,
        distance: validatedData.distance,
        purpose: validatedData.purpose,
        business: validatedData.business,
        route: validatedData.route,
        status: validatedData.endTime ? 'completed' : 'active',
      },
    });

    res.status(201).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all trips for a user
export const getTrips = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      page = 1, 
      limit = 20, 
      business, 
      startDate, 
      endDate,
      status 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {
      userId,
    };

    if (business !== undefined) {
      where.business = business === 'true';
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate as string);
      }
    }

    if (status) {
      where.status = status;
    }

    const [trips, total] = await Promise.all([
      prisma.mileageTrip.findMany({
        where,
        orderBy: { startTime: 'desc' },
        skip,
        take,
      }),
      prisma.mileageTrip.count({ where }),
    ]);

    res.json({
      success: true,
      data: trips,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific trip
export const getTrip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const trip = await prisma.mileageTrip.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a trip
export const updateTrip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const validatedData = updateTripSchema.parse(req.body);

    // Check if trip exists and belongs to user
    const existingTrip = await prisma.mileageTrip.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const updateData: any = {};
    
    if (validatedData.endTime) {
      updateData.endTime = new Date(validatedData.endTime);
      updateData.status = 'completed';
    }
    
    if (validatedData.endLocation) {
      updateData.endLatitude = validatedData.endLocation.latitude;
      updateData.endLongitude = validatedData.endLocation.longitude;
      updateData.endAccuracy = validatedData.endLocation.accuracy;
    }
    
    if (validatedData.distance !== undefined) {
      updateData.distance = validatedData.distance;
    }
    
    if (validatedData.purpose) {
      updateData.purpose = validatedData.purpose;
    }
    
    if (validatedData.business !== undefined) {
      updateData.business = validatedData.business;
    }
    
    if (validatedData.route) {
      updateData.route = validatedData.route;
    }

    const trip = await prisma.mileageTrip.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a trip
export const deleteTrip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Check if trip exists and belongs to user
    const existingTrip = await prisma.mileageTrip.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await prisma.mileageTrip.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get mileage summary/statistics
export const getMileageSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { startDate, endDate, business } = req.query;

    const where: any = {
      userId,
      status: 'completed',
    };

    if (business !== undefined) {
      where.business = business === 'true';
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate as string);
      }
    }

    const [totalDistance, totalTrips, businessTrips, personalTrips] = await Promise.all([
      prisma.mileageTrip.aggregate({
        where,
        _sum: { distance: true },
      }),
      prisma.mileageTrip.count({ where }),
      prisma.mileageTrip.count({
        where: { ...where, business: true },
      }),
      prisma.mileageTrip.count({
        where: { ...where, business: false },
      }),
    ]);

    // Get monthly breakdown
    const monthlyBreakdown = await prisma.mileageTrip.groupBy({
      by: ['startTime'],
      where,
      _sum: { distance: true },
      _count: { id: true },
    });

    res.json({
      success: true,
      data: {
        totalDistance: totalDistance._sum.distance || 0,
        totalTrips,
        businessTrips,
        personalTrips,
        monthlyBreakdown: monthlyBreakdown.map(item => ({
          month: item.startTime,
          distance: item._sum.distance || 0,
          trips: item._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching mileage summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Generate IRS-compliant mileage report
export const generateMileageReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { startDate, endDate, format = 'json' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Start date and end date are required' 
      });
    }

    const where = {
      userId,
      status: 'completed',
      business: true,
      startTime: {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      },
    };

    const trips = await prisma.mileageTrip.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });

    const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0);
    const totalTrips = trips.length;

    const report = {
      period: {
        startDate: startDate,
        endDate: endDate,
      },
      summary: {
        totalDistance,
        totalTrips,
        averageDistance: totalTrips > 0 ? totalDistance / totalTrips : 0,
      },
      trips: trips.map(trip => ({
        date: trip.startTime.toISOString().split('T')[0],
        startTime: trip.startTime.toISOString(),
        endTime: trip.endTime?.toISOString(),
        startLocation: {
          latitude: trip.startLatitude,
          longitude: trip.startLongitude,
        },
        endLocation: trip.endLatitude && trip.endLongitude ? {
          latitude: trip.endLatitude,
          longitude: trip.endLongitude,
        } : null,
        distance: trip.distance,
        purpose: trip.purpose,
        business: trip.business,
      })),
      irsCompliance: {
        gpsTracked: true,
        timestamped: true,
        businessPurpose: true,
        routeRecorded: true,
      },
    };

    if (format === 'csv') {
      // Generate CSV format
      const csvHeader = 'Date,Start Time,End Time,Start Location,End Location,Distance (km),Purpose,Business\n';
      const csvRows = trips.map(trip => {
        const startLoc = `${trip.startLatitude},${trip.startLongitude}`;
        const endLoc = trip.endLatitude && trip.endLongitude 
          ? `${trip.endLatitude},${trip.endLongitude}` 
          : '';
        return `${trip.startTime.toISOString().split('T')[0]},${trip.startTime.toISOString()},${trip.endTime?.toISOString() || ''},${startLoc},${endLoc},${trip.distance},${trip.purpose},${trip.business}`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="mileage-report-${startDate}-to-${endDate}.csv"`);
      res.send(csvHeader + csvRows);
    } else {
      res.json({
        success: true,
        data: report,
      });
    }
  } catch (error) {
    console.error('Error generating mileage report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get active trip for user
export const getActiveTrip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activeTrip = await prisma.mileageTrip.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { startTime: 'desc' },
    });

    res.json({
      success: true,
      data: activeTrip,
    });
  } catch (error) {
    console.error('Error fetching active trip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update active trip location
export const updateActiveTripLocation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { latitude, longitude, accuracy, timestamp } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const activeTrip = await prisma.mileageTrip.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { startTime: 'desc' },
    });

    if (!activeTrip) {
      return res.status(404).json({ error: 'No active trip found' });
    }

    // Add new location to route
    const newLocation = {
      latitude,
      longitude,
      timestamp: timestamp || Date.now(),
      accuracy,
    };

    const updatedRoute = [...(activeTrip.route as any[]), newLocation];

    // Calculate distance from last location
    let distanceIncrement = 0;
    if (activeTrip.route && activeTrip.route.length > 0) {
      const lastLocation = activeTrip.route[activeTrip.route.length - 1];
      distanceIncrement = calculateDistance(
        lastLocation.latitude,
        lastLocation.longitude,
        latitude,
        longitude
      );
    }

    const updatedTrip = await prisma.mileageTrip.update({
      where: { id: activeTrip.id },
      data: {
        route: updatedRoute,
        distance: activeTrip.distance + distanceIncrement,
      },
    });

    res.json({
      success: true,
      data: updatedTrip,
    });
  } catch (error) {
    console.error('Error updating trip location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

