# Use the official PostgreSQL image as the base image
FROM postgres:latest

# Set environment variables for database configuration
ENV POSTGRES_USER=root
ENV POSTGRES_PASSWORD=root
ENV POSTGRES_DB=timer

# Copy any custom configuration or initialization scripts into the container
# COPY init.sql /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432

# Start the PostgreSQL server when the container launches
CMD ["postgres"]
# docker run -d --name pgadmin_container -p 8080:80 -e PGADMIN_DEFAULT_EMAIL=admin@example.com -e PGADMIN_DEFAULT_PASSWORD=admin --network="bridge" dpage/pgadmin4

# Build stage
FROM node:20-alpine as build
WORKDIR /app

# Install dependencies needed for node-gyp and Prisma
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install production dependencies only
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

# Generate Prisma Client in production
RUN npx prisma generate

EXPOSE 4000

# Add a startup script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
