# Multi-stage build for CNT application

# Stage 1: Build frontend
FROM node:20 AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN chmod +x node_modules/.bin/vite
RUN npm run build

# Stage 2: Build Go backend
FROM golang:1.24-alpine AS backend-builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev sqlite-dev

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy backend source
COPY backend/ ./backend/
COPY main.go ./

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o cnt-server .

# Stage 3: Final runtime image
FROM alpine:3.19

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache ca-certificates sqlite-libs

# Copy built binary from backend-builder
COPY --from=backend-builder /app/cnt-server .

# Copy frontend build from frontend-builder
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create directory for database
RUN mkdir -p /data

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Change ownership of the application and data directories
RUN chown -R appuser:appgroup /app /data

# Switch to non-root user
USER appuser

# Set environment variables
ENV DB_PATH=/data/cnt.db
ENV PORT=8080
ENV GIN_MODE=release

# Expose port
EXPOSE 8080

# Run the application
CMD ["./cnt-server"]
