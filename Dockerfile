FROM node:20.18.3-slim AS build
WORKDIR /app
# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci
# Copy and build the app
COPY . .
RUN npm run build

# Final stage
FROM node:20.18.3-slim
WORKDIR /app
# Copy built app and package files
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev && \
 apt-get update && \
 apt-get install -y --no-install-recommends curl && \
 apt-get clean && \
 rm -rf /var/lib/apt/lists/*

# Set environment variables explicitly
ENV HOST="0.0.0.0"
ENV PORT=4321
# Add MySQL environment variables
ENV MYSQL_HOST="mysql-container"
ENV MYSQL_USER="ufpv_manager"
ENV MYSQL_PASSWORD="{DB_PASS}"
ENV MYSQL_DATABASE="ingv"
ENV MYSQL_PORT="3306"
ENV MYSQL_CONNECTION_LIMIT="10"

# Expose the port
EXPOSE 4321

# Use a healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
CMD curl -f http://localhost:4321/ || exit 1

# Start the server
CMD ["node", "./dist/server/entry.mjs"]