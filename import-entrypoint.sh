#!/bin/sh

# Wait for the database to be ready
echo "Waiting for database to be ready..."
npx prisma db push --skip-generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Run the import script
echo "Starting data import..."
npx ts-node scripts/import-data.ts 