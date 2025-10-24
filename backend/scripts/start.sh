#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
npx prisma db push --accept-data-loss

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
npm start


