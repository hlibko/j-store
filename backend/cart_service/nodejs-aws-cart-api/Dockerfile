# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose the port
EXPOSE 4000

# Set NODE_ENV
ENV NODE_ENV=production

# Run the application
CMD ["node", "dist/main"]