# MockMate Production Deployment Guide

## Overview
This guide covers deploying MockMate to production using Docker Compose (single-host) or Kubernetes (multi-host scalable).

---

## Option 1: Docker Compose Deployment (Simple & Single-Host)

### Prerequisites
- Docker and Docker Compose installed on your server
- A Linux server (Ubuntu 20.04+ recommended)
- Domain name pointing to your server

### Step-by-Step Setup

#### 1. Clone and Navigate
```bash
git clone https://github.com/yourusername/MockMate.git
cd MockMate_Interview-main
```

#### 2. Configure Environment Variables
Edit `.env.production` with your production values:
```bash
cp backend/.env.production backend/.env.prod
nano backend/.env.prod
```

Update:
- `JWT_SECRET` - Generate a secure random key (min 32 chars): `openssl rand -base64 32`
- `MONGODB_URI` - Should point to MongoDB service
- `VITE_API_BASE_URL` - Your production domain (e.g., https://api.yourdomain.com)

```bash
# For frontend
cp frontend/.env.production frontend/.env.prod
nano frontend/.env.prod
```

Update:
- `VITE_API_BASE_URL` - Same as backend URL
- `VITE_WEBSOCKET_URL` - WebSocket URL (wss://api.yourdomain.com for HTTPS)

#### 3. Build Docker Images
```bash
docker compose -f docker-compose.prod.yml build
```

#### 4. Start Services
```bash
docker compose -f docker-compose.prod.yml up -d
```

Verify all services are running:
```bash
docker compose -f docker-compose.prod.yml ps
```

#### 5. Check Logs
```bash
# Backend logs
docker compose -f docker-compose.prod.yml logs backend

# Frontend logs
docker compose -f docker-compose.prod.yml logs frontend

# Database logs
docker compose -f docker-compose.prod.yml logs mongo
```

#### 6. Setup Nginx Reverse Proxy (Optional but Recommended)
Install Nginx and configure SSL:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

Create `/etc/nginx/sites-available/mockmate`:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the config and get SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/mockmate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

#### 7. Persistent Data Backup
MongoDB and Redis data are stored in Docker volumes. Backup regularly:

```bash
# Backup MongoDB
docker compose -f docker-compose.prod.yml exec mongo mongodump --out /backup

# Restore MongoDB
docker compose -f docker-compose.prod.yml exec mongo mongorestore /backup
```

---

## Option 2: Kubernetes Deployment (Scalable & Multi-Host)

### Prerequisites
- Kubernetes cluster (EKS, GKE, AKS, or self-managed)
- kubectl configured and connected to your cluster
- Docker images pushed to Docker Hub

### Step-by-Step Setup

#### 1. Update Kubernetes Manifest
Edit `k8s-manifest.yaml` and replace `YOUR_DOCKER_USERNAME` with your Docker Hub username:
```bash
sed -i 's/YOUR_DOCKER_USERNAME/yourdockeruser/g' k8s-manifest.yaml
```

#### 2. Create Secrets
```bash
kubectl create namespace mockmate
kubectl -n mockmate create secret generic backend-secret \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  --from-literal=MONGODB_URI=mongodb://mongo-service:27017/mockmate
```

#### 3. Deploy
```bash
kubectl apply -f k8s-manifest.yaml
```

#### 4. Verify Deployment
```bash
# Check pods
kubectl -n mockmate get pods

# Check services
kubectl -n mockmate get svc

# Get LoadBalancer IPs
kubectl -n mockmate get svc frontend-service backend-service
```

#### 5. View Logs
```bash
# Backend pod logs
kubectl -n mockmate logs -f deployment/backend

# Frontend pod logs
kubectl -n mockmate logs -f deployment/frontend
```

#### 6. Monitor Auto-Scaling
```bash
# Watch HPA status
kubectl -n mockmate get hpa -w
```

---

## GitHub Actions CI/CD Pipeline

### Setup

#### 1. Add Docker Hub Secrets to GitHub
- Go to your GitHub repo → Settings → Secrets and variables → Actions
- Add:
  - `DOCKER_USERNAME`: Your Docker Hub username
  - `DOCKER_PASSWORD`: Your Docker Hub access token (not password)
  - `DEPLOY_HOST`: Your production server IP/hostname
  - `DEPLOY_USER`: SSH user on production server
  - `DEPLOY_KEY`: Private SSH key (for server access)

#### 2. Workflow Behavior
- On push to `main` branch: Builds images and pushes to Docker Hub
- On push to `production` branch: Builds, pushes, and automatically deploys to your server

#### 3. Monitor Pipeline
Go to GitHub repo → Actions tab to see build/deploy logs

---

## Production Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Update VITE_API_BASE_URL to your production domain
- [ ] Configure SSL/TLS certificates (use Certbot for Let's Encrypt)
- [ ] Set up database backups (daily automated)
- [ ] Enable log rotation (avoid disk space issues)
- [ ] Add TURN servers for WebRTC reliability
- [ ] Configure firewall rules (allow only HTTP/HTTPS/WebSocket ports)
- [ ] Set resource limits on containers
- [ ] Monitor uptime and performance (New Relic, Datadog, CloudWatch)
- [ ] Setup alerting for errors and downtimes
- [ ] Test disaster recovery procedures
- [ ] Document runbooks for common issues

---

## Common Commands

### Docker Compose
```bash
# Start services
docker compose -f docker-compose.prod.yml up -d

# Stop services
docker compose -f docker-compose.prod.yml down

# View logs
docker compose -f docker-compose.prod.yml logs -f <service>

# Rebuild specific service
docker compose -f docker-compose.prod.yml build --no-cache backend

# Scale services
docker compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Kubernetes
```bash
# Deploy
kubectl apply -f k8s-manifest.yaml

# Delete deployment
kubectl delete namespace mockmate

# View events
kubectl -n mockmate get events --sort-by='.lastTimestamp'

# Port forward for local testing
kubectl -n mockmate port-forward svc/backend-service 8080:8080
```

---

## Troubleshooting

### Backend Pod CrashLoopBackOff
```bash
kubectl -n mockmate logs deployment/backend
kubectl -n mockmate describe pod <pod-name>
```

### MongoDB Connection Issues
```bash
# Check if mongo service is running
kubectl -n mockmate get pods -l app=mongo

# Test connection from backend pod
kubectl -n mockmate exec -it <backend-pod> -- bash
# Inside pod: mongosh mongodb://mongo-service:27017/mockmate
```

### High Memory Usage
- Increase resource limits in deployment
- Review application for memory leaks
- Monitor with `kubectl top pod -n mockmate`

### WebSocket Connection Failures
- Ensure VITE_WEBSOCKET_URL is correctly configured
- Check firewall allows WebSocket traffic
- Verify TURN server configuration for production

---

## Support
For issues or questions, open a GitHub issue or contact support@mockmate.com
