#!/bin/bash
echo "Step 1: Deployment URL set"
echo "var deployment_url = '/netrex/'" > ./frontend/assets/js/global.js
echo "Step 2: Changing Docker Context to Bioinf"
docker context use bioinf
echo "Step 3: Building Docker Image"
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose build
echo "Step 4: Deploying!"
docker-compose up -d
echo "Step 5: URL reset to Localhost"
echo "var deployment_url = '/'" > ./frontend/assets/js/global.js