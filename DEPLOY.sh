#!/bin/bash

# DÉPLOIEMENT N8N + API NODEJS SUR EC2

echo "=== Setup Node.js API + n8n ==="

# 1. Clone/structure
cd ~
mkdir -p n8n-api && cd n8n-api

# Fichiers déjà prêts:
# - server.js
# - package.json
# - Dockerfile
# - docker-compose.yml
# - public/dashboard.html

# 2. Build images Docker
docker-compose build

# 3. Lance services
docker-compose up -d

# 4. Check logs
docker-compose logs -f

# URLs:
# n8n: http://[EC2-IP]:5678
# API: http://[EC2-IP]:3000
# Dashboard: http://[EC2-IP]:3000/dashboard
# Webhook n8n: http://[EC2-IP]:3000/api/reviews