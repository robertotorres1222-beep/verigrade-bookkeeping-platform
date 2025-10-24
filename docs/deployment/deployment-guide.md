# VeriGrade Deployment Guide

This comprehensive guide covers deploying the VeriGrade bookkeeping platform across different environments, from local development to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Staging Environment](#staging-environment)
4. [Production Deployment](#production-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring Setup](#monitoring-setup)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

**Minimum Requirements:**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+

**Recommended Requirements:**
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS

### Software Dependencies

**Required Software:**
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **Docker**: 20.x or higher
- **Docker Compose**: 2.x or higher
- **PostgreSQL**: 14.x or higher
- **Redis**: 6.x or higher

**Optional Software:**
- **Kubernetes**: 1.24+ (for production)
- **Helm**: 3.x (for Kubernetes deployments)
- **Terraform**: 1.x (for infrastructure as code)

## Local Development Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/verigrade/bookkeeping-platform.git
cd bookkeeping-platform

# Install dependencies
npm install
```

### 2. Environment Configuration

Create environment files for different stages:

```bash
# Copy environment templates
cp .env.example .env.local
cp .env.example .env.development
cp .env.example .env.staging
cp .env.example .env.production
```

**Environment Variables (.env.local):**
```bash
# Application
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/verigrade_dev
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# File Storage
STORAGE_TYPE=local
STORAGE_PATH=./uploads
MAX_FILE_SIZE=10485760

# Email
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@verigrade.com

# External Services
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENVIRONMENT=sandbox

# Monitoring
LOG_LEVEL=debug
ENABLE_METRICS=true
```

### 3. Database Setup

**PostgreSQL Setup:**
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE verigrade_dev;
CREATE USER verigrade_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE verigrade_dev TO verigrade_user;
\q
```

**Redis Setup:**
```bash
# Install Redis (Ubuntu/Debian)
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 4. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with initial data
npm run seed
```

### 5. Start Development Servers

```bash
# Start backend server
npm run dev:backend

# Start frontend server (in new terminal)
npm run dev:frontend

# Start mobile app (in new terminal)
npm run dev:mobile
```

**Docker Compose Alternative:**
```bash
# Start all services with Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

## Staging Environment

### 1. Infrastructure Setup

**Using Docker Compose:**
```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=postgresql://user:pass@db:5432/verigrade_staging
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=verigrade_staging
      - POSTGRES_USER=verigrade_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:6-alpine
    command: redis-server --requirepass redis_password
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

### 2. Deployment Script

```bash
#!/bin/bash
# deploy-staging.sh

set -e

echo "Deploying to staging environment..."

# Build Docker images
docker build -t verigrade/staging:latest .

# Stop existing containers
docker-compose -f docker-compose.staging.yml down

# Start new containers
docker-compose -f docker-compose.staging.yml up -d

# Run database migrations
docker-compose -f docker-compose.staging.yml exec app npx prisma migrate deploy

# Health check
sleep 10
curl -f http://localhost:3000/health || exit 1

echo "Staging deployment completed successfully!"
```

### 3. SSL Configuration

**Nginx SSL Setup:**
```nginx
# nginx.conf
server {
    listen 80;
    server_name staging.verigrade.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging.verigrade.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Production Deployment

### 1. Kubernetes Deployment

**Namespace Configuration:**
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: verigrade
  labels:
    name: verigrade
```

**ConfigMap for Application Configuration:**
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: verigrade-config
  namespace: verigrade
data:
  NODE_ENV: "production"
  PORT: "3000"
  LOG_LEVEL: "info"
  ENABLE_METRICS: "true"
```

**Secret for Sensitive Data:**
```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: verigrade-secrets
  namespace: verigrade
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  JWT_SECRET: <base64-encoded-jwt-secret>
  REDIS_PASSWORD: <base64-encoded-redis-password>
```

**Deployment Configuration:**
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: verigrade-api
  namespace: verigrade
spec:
  replicas: 3
  selector:
    matchLabels:
      app: verigrade-api
  template:
    metadata:
      labels:
        app: verigrade-api
    spec:
      containers:
      - name: api
        image: verigrade/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: verigrade-secrets
              key: DATABASE_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: verigrade-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Service Configuration:**
```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: verigrade-api-service
  namespace: verigrade
spec:
  selector:
    app: verigrade-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

**Ingress Configuration:**
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: verigrade-ingress
  namespace: verigrade
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.verigrade.com
    secretName: verigrade-tls
  rules:
  - host: api.verigrade.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: verigrade-api-service
            port:
              number: 80
```

### 2. Database Setup

**PostgreSQL Configuration:**
```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: verigrade
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:14
        env:
        - name: POSTGRES_DB
          value: verigrade
        - name: POSTGRES_USER
          value: verigrade_user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "1Gi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "500m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
```

**Redis Configuration:**
```yaml
# k8s/redis.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: verigrade
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:6-alpine
        command: redis-server --requirepass $(REDIS_PASSWORD)
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: password
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
```

### 3. CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint
      - name: Run security audit
        run: npm audit --audit-level moderate

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t verigrade/api:${{ github.sha }} .
      - name: Run security scan
        run: trivy image verigrade/api:${{ github.sha }}
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push verigrade/api:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: 'latest'
      - name: Deploy to Kubernetes
        run: |
          echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
          kubectl set image deployment/verigrade-api api=verigrade/api:${{ github.sha }} -n verigrade
          kubectl rollout status deployment/verigrade-api -n verigrade
```

## Database Setup

### 1. Production Database

**AWS RDS Configuration:**
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier verigrade-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.7 \
  --master-username verigrade_admin \
  --master-user-password secure_password \
  --allocated-storage 100 \
  --storage-type gp2 \
  --vpc-security-group-ids sg-12345678 \
  --db-subnet-group-name verigrade-subnet-group \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted
```

**Database Migration:**
```bash
# Run production migrations
NODE_ENV=production npx prisma migrate deploy

# Seed production data
NODE_ENV=production npm run seed:production
```

### 2. Database Backup

**Automated Backup Script:**
```bash
#!/bin/bash
# backup-database.sh

set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="verigrade_backup_${DATE}.sql"

# Create backup
pg_dump $DATABASE_URL > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compress backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}.gz" s3://verigrade-backups/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "verigrade_backup_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: ${BACKUP_FILE}.gz"
```

## Environment Configuration

### 1. Production Environment Variables

```bash
# Production Environment
NODE_ENV=production
PORT=3000
API_URL=https://api.verigrade.com
FRONTEND_URL=https://app.verigrade.com

# Database
DATABASE_URL=postgresql://user:pass@prod-db.verigrade.com:5432/verigrade
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT=30000

# Redis
REDIS_URL=redis://prod-redis.verigrade.com:6379
REDIS_PASSWORD=secure_redis_password

# Authentication
JWT_SECRET=production_jwt_secret_key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=production_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# File Storage
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=verigrade-production

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@verigrade.com

# External Services
PLAID_CLIENT_ID=production_plaid_client_id
PLAID_SECRET=production_plaid_secret
PLAID_ENVIRONMENT=production

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
SENTRY_DSN=your_sentry_dsn
```

### 2. Security Configuration

**SSL/TLS Configuration:**
```nginx
# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

**Security Headers:**
```nginx
# Security Headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

## Monitoring Setup

### 1. Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'verigrade-api'
    static_configs:
      - targets: ['verigrade-api:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### 2. Grafana Dashboard

**Application Metrics Dashboard:**
```json
{
  "dashboard": {
    "title": "VeriGrade Application Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

## Troubleshooting

### Common Issues

**1. Database Connection Issues:**
```bash
# Check database connectivity
kubectl exec -it deployment/verigrade-api -- npx prisma db pull

# Check database logs
kubectl logs deployment/postgres
```

**2. Redis Connection Issues:**
```bash
# Test Redis connection
kubectl exec -it deployment/verigrade-api -- redis-cli -h redis ping

# Check Redis logs
kubectl logs deployment/redis
```

**3. Application Startup Issues:**
```bash
# Check application logs
kubectl logs deployment/verigrade-api

# Check pod status
kubectl get pods -n verigrade

# Describe pod for detailed information
kubectl describe pod <pod-name> -n verigrade
```

**4. Performance Issues:**
```bash
# Check resource usage
kubectl top pods -n verigrade

# Check node resources
kubectl top nodes

# Check application metrics
curl http://verigrade-api:3000/metrics
```

### Debugging Commands

**Application Debugging:**
```bash
# Access application shell
kubectl exec -it deployment/verigrade-api -- /bin/bash

# Check environment variables
kubectl exec deployment/verigrade-api -- env

# Test database connection
kubectl exec deployment/verigrade-api -- npx prisma db push
```

**Database Debugging:**
```bash
# Connect to database
kubectl exec -it deployment/postgres -- psql -U verigrade_user -d verigrade

# Check database size
kubectl exec deployment/postgres -- psql -U verigrade_user -d verigrade -c "SELECT pg_size_pretty(pg_database_size('verigrade'));"

# Check active connections
kubectl exec deployment/postgres -- psql -U verigrade_user -d verigrade -c "SELECT count(*) FROM pg_stat_activity;"
```

---

This deployment guide provides comprehensive instructions for deploying VeriGrade across different environments. Follow the steps carefully and refer to the troubleshooting section if you encounter any issues.






