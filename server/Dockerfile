# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (only production for lean final image)
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Set secure non-root user
USER node

# Expose backend API port
EXPOSE 5001

# Production environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/health || exit 1

# Start server
CMD ["node", "server.js"]
