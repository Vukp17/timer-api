#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Generate Prisma Client (just to be sure)
echo "Generating Prisma Client..."
npx prisma generate

# Start the application
echo "Starting the application..."
NODE_ENV=production node dist/main.js 