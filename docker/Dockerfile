# Dockerfile for Pano Publisher (SvelteKit Node Adapter)
FROM node:24-alpine

# curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the build output
COPY build/ ./build/

# Expose the port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOST=0.0.0.0
ENV ORIGIN=http://localhost:3000

# Start the app
CMD ["node", "build/index.js"]
