#!/bin/bash

# Deploy script for Pano Publisher
# Usage: ./deploy.sh

set -e

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Check required environment variable
if [ -z "$DEPLOY_SERVER_PATH" ]; then
    echo "Error: DEPLOY_SERVER_PATH is not set"
    echo "Expected format: user@server:/path/to/docker/apps/pano-publisher"
    exit 1
fi

# Parse server and path (Format: user@server:/path)
SERVER_PART=$(echo $DEPLOY_SERVER_PATH | cut -d':' -f1)
PATH_PART=$(echo $DEPLOY_SERVER_PATH | cut -d':' -f2)

echo "=== Pano Publisher Deployment ==="
echo "Target: $DEPLOY_SERVER_PATH"
echo ""

# Step 1: Build locally
echo "[1/4] Building application..."
npm run build

# Step 2: Create directory structure on server
echo "[2/4] Preparing server directories..."
ssh $SERVER_PART "mkdir -p $PATH_PART/build"

# Step 3: Copy build files and Dockerfile
echo "[3/4] Copying files to server..."
scp -r ./build/* $DEPLOY_SERVER_PATH/build/
scp ./docker/Dockerfile $DEPLOY_SERVER_PATH/
scp ./package.json $DEPLOY_SERVER_PATH/
scp ./package-lock.json $DEPLOY_SERVER_PATH/

# Step 4: Rebuild and restart container on server
echo "[4/4] Restarting container..."
ssh $SERVER_PART "cd ~/docker && docker compose down pano-publisher && docker compose up --build pano-publisher -d"

echo ""
echo "=== Deployment complete! ==="
echo "Check status: ssh $SERVER_PART 'docker ps | grep pano-publisher'"
