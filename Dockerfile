# Build stage
FROM node:20-alpine as build
WORKDIR /app

# Install dependencies needed for node-gyp, Prisma, and OpenSSL
RUN apk add --no-cache python3 make g++ openssl openssl-dev

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install OpenSSL in production
RUN apk add --no-cache openssl openssl-dev

# Copy necessary files
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/tsconfig*.json ./
COPY --from=build /app/scripts ./scripts

# Generate Prisma Client in production
RUN npx prisma generate

EXPOSE 4000

# Add startup scripts
COPY docker-entrypoint.sh /
COPY import-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
