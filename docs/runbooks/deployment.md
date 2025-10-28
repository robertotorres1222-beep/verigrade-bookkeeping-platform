# Verigrade Deployment Runbook

This runbook provides step-by-step instructions for deploying the Verigrade bookkeeping platform to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Configuration Management](#configuration-management)
6. [Health Checks](#health-checks)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### 1. System Requirements

#### Minimum Hardware Requirements
- **CPU**: 4 cores, 2.4 GHz
- **RAM**: 8 GB
- **Storage**: 100 GB SSD
- **Network**: 1 Gbps connection

#### Recommended Hardware Requirements
- **CPU**: 8 cores, 3.0 GHz
- **RAM**: 16 GB
- **Storage**: 500 GB SSD
- **Network**: 10 Gbps connection

### 2. Software Requirements

#### Required Software
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Kubernetes**: Version 1.24+
- **Helm**: Version 3.8+
- **kubectl**: Version 1.24+
- **Git**: Version 2.30+

#### Cloud Services
- **AWS Account**: For production deployment
- **Domain Name**: For application access
- **SSL Certificate**: For HTTPS encryption
- **DNS Configuration**: For domain resolution

### 3. Access Requirements

#### Required Access
- **AWS CLI**: Configured with appropriate permissions
- **Kubernetes Cluster**: Access to cluster management
- **Database Access**: PostgreSQL connection
- **Container Registry**: Docker image push/pull access

## Environment Setup

### 1. Development Environment

#### Local Development Setup
```bash
# Clone the repository
git clone https://github.com/verigrade/verigrade-platform.git
cd verigrade-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development servers
npm run dev
```

#### Docker Development Setup
```bash
# Build development images
docker-compose -f docker-compose.dev.yml build

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### 2. Staging Environment

#### Staging Deployment
```bash
# Set staging context
kubectl config use-context staging

# Deploy to staging
helm upgrade --install verigrade-staging ./helm/verigrade \
  --namespace staging \
  --values ./helm/values/staging.yaml

# Verify deployment
kubectl get pods -n staging
kubectl get services -n staging
```

#### Staging Configuration
```yaml
# helm/values/staging.yaml
replicaCount: 2
image:
  repository: verigrade/verigrade
  tag: staging
  pullPolicy: Always

ingress:
  enabled: true
  hosts:
    - host: staging.verigrade.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: verigrade-staging-tls
      hosts:
        - staging.verigrade.com

database:
  host: staging-db.verigrade.com
  port: 5432
  name: verigrade_staging
  username: verigrade_staging
  password: ${DB_PASSWORD}

redis:
  host: staging-redis.verigrade.com
  port: 6379
  password: ${REDIS_PASSWORD}
```

### 3. Production Environment

#### Production Deployment
```bash
# Set production context
kubectl config use-context production

# Deploy to production
helm upgrade --install verigrade-prod ./helm/verigrade \
  --namespace production \
  --values ./helm/values/production.yaml \
  --set image.tag=${VERSION}

# Verify deployment
kubectl get pods -n production
kubectl get services -n production
kubectl get ingress -n production
```

#### Production Configuration
```yaml
# helm/values/production.yaml
replicaCount: 5
image:
  repository: verigrade/verigrade
  tag: latest
  pullPolicy: IfNotPresent

ingress:
  enabled: true
  hosts:
    - host: app.verigrade.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: verigrade-prod-tls
      hosts:
        - app.verigrade.com

database:
  host: prod-db.verigrade.com
  port: 5432
  name: verigrade_production
  username: verigrade_prod
  password: ${DB_PASSWORD}

redis:
  host: prod-redis.verigrade.com
  port: 6379
  password: ${REDIS_PASSWORD}

monitoring:
  enabled: true
  prometheus:
    enabled: true
  grafana:
    enabled: true

backup:
  enabled: true
  schedule: "0 2 * * *"
  retention: "30d"
```

## Database Setup

### 1. PostgreSQL Setup

#### Database Creation
```sql
-- Create database
CREATE DATABASE verigrade_production;
CREATE DATABASE verigrade_staging;
CREATE DATABASE verigrade_development;

-- Create users
CREATE USER verigrade_prod WITH PASSWORD 'secure_password';
CREATE USER verigrade_staging WITH PASSWORD 'secure_password';
CREATE USER verigrade_dev WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE verigrade_production TO verigrade_prod;
GRANT ALL PRIVILEGES ON DATABASE verigrade_staging TO verigrade_staging;
GRANT ALL PRIVILEGES ON DATABASE verigrade_development TO verigrade_dev;
```

#### Database Migration
```bash
# Run database migrations
npm run db:migrate:production
npm run db:migrate:staging
npm run db:migrate:development

# Seed initial data
npm run db:seed:production
npm run db:seed:staging
npm run db:seed:development
```

### 2. Redis Setup

#### Redis Configuration
```bash
# Start Redis with configuration
redis-server /etc/redis/redis.conf

# Test Redis connection
redis-cli ping
```

#### Redis Cluster Setup
```bash
# Create Redis cluster
redis-cli --cluster create \
  10.0.1.10:7000 10.0.1.11:7000 10.0.1.12:7000 \
  10.0.1.10:7001 10.0.1.11:7001 10.0.1.12:7001 \
  --cluster-replicas 1
```

### 3. Elasticsearch Setup

#### Elasticsearch Configuration
```yaml
# elasticsearch.yml
cluster.name: verigrade-cluster
node.name: verigrade-node-1
network.host: 0.0.0.0
discovery.seed_hosts: ["es-node-1", "es-node-2", "es-node-3"]
cluster.initial_master_nodes: ["es-node-1", "es-node-2", "es-node-3"]
```

#### Elasticsearch Deployment
```bash
# Deploy Elasticsearch
kubectl apply -f k8s/elasticsearch/

# Verify deployment
kubectl get pods -l app=elasticsearch
kubectl get services -l app=elasticsearch
```

## Application Deployment

### 1. Container Build

#### Docker Image Build
```bash
# Build application image
docker build -t verigrade/verigrade:latest .

# Build with specific tag
docker build -t verigrade/verigrade:v1.2.3 .

# Push to registry
docker push verigrade/verigrade:latest
docker push verigrade/verigrade:v1.2.3
```

#### Multi-stage Build
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 2. Kubernetes Deployment

#### Deployment Manifest
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: verigrade-app
  namespace: production
spec:
  replicas: 5
  selector:
    matchLabels:
      app: verigrade-app
  template:
    metadata:
      labels:
        app: verigrade-app
    spec:
      containers:
      - name: verigrade-app
        image: verigrade/verigrade:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: verigrade-secrets
              key: database-url
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

#### Service Manifest
```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: verigrade-app-service
  namespace: production
spec:
  selector:
    app: verigrade-app
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

#### Ingress Manifest
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: verigrade-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - app.verigrade.com
    secretName: verigrade-tls
  rules:
  - host: app.verigrade.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: verigrade-app-service
            port:
              number: 80
```

### 3. Blue-Green Deployment

#### Blue-Green Setup
```bash
# Deploy green environment
kubectl apply -f k8s/green/

# Test green environment
curl -H "Host: green.verigrade.com" http://load-balancer/health

# Switch traffic to green
kubectl patch ingress verigrade-ingress -p '{"spec":{"rules":[{"host":"app.verigrade.com","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"verigrade-green-service","port":{"number":80}}}]}]}]}}]}'

# Verify traffic switch
curl -H "Host: app.verigrade.com" http://load-balancer/health

# Clean up blue environment
kubectl delete -f k8s/blue/
```

## Configuration Management

### 1. Environment Variables

#### Production Environment
```bash
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379
JWT_SECRET=your-jwt-secret
API_KEY=your-api-key
STRIPE_SECRET_KEY=sk_live_...
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
```

#### Staging Environment
```bash
# .env.staging
NODE_ENV=staging
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379
JWT_SECRET=your-jwt-secret
API_KEY=your-api-key
STRIPE_SECRET_KEY=sk_test_...
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
```

### 2. Secrets Management

#### Kubernetes Secrets
```bash
# Create secrets
kubectl create secret generic verigrade-secrets \
  --from-literal=database-url=postgresql://user:password@host:5432/database \
  --from-literal=redis-url=redis://host:6379 \
  --from-literal=jwt-secret=your-jwt-secret \
  --from-literal=api-key=your-api-key

# Update secrets
kubectl patch secret verigrade-secrets -p '{"data":{"database-url":"'$(echo -n "new-database-url" | base64)'"}}'
```

#### AWS Secrets Manager
```bash
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name "verigrade/production/database" \
  --description "Verigrade production database credentials" \
  --secret-string '{"username":"verigrade_prod","password":"secure_password","host":"prod-db.verigrade.com","port":"5432","database":"verigrade_production"}'

# Retrieve secrets
aws secretsmanager get-secret-value \
  --secret-id "verigrade/production/database" \
  --query SecretString --output text
```

### 3. Configuration Files

#### Application Configuration
```javascript
// config/production.js
module.exports = {
  app: {
    name: 'Verigrade',
    version: '1.0.0',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    url: process.env.DATABASE_URL,
    ssl: true,
    pool: {
      min: 2,
      max: 10
    }
  },
  redis: {
    url: process.env.REDIS_URL,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },
  integrations: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    plaid: {
      clientId: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      environment: 'production'
    }
  }
};
```

## Health Checks

### 1. Application Health Checks

#### Health Check Endpoint
```javascript
// routes/health.js
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.raw('SELECT 1');
    
    // Check Redis connection
    await redis.ping();
    
    // Check external services
    const stripeStatus = await checkStripeConnection();
    const plaidStatus = await checkPlaidConnection();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        stripe: stripeStatus,
        plaid: plaidStatus
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
```

#### Readiness Check
```javascript
// routes/ready.js
app.get('/ready', async (req, res) => {
  try {
    // Check if application is ready to serve traffic
    const isReady = await checkApplicationReadiness();
    
    if (isReady) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready' });
    }
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});
```

### 2. Infrastructure Health Checks

#### Kubernetes Health Checks
```bash
# Check pod status
kubectl get pods -n production

# Check service status
kubectl get services -n production

# Check ingress status
kubectl get ingress -n production

# Check pod logs
kubectl logs -f deployment/verigrade-app -n production
```

#### Database Health Checks
```sql
-- Check database connections
SELECT count(*) FROM pg_stat_activity;

-- Check database size
SELECT pg_size_pretty(pg_database_size('verigrade_production'));

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### 3. Monitoring and Alerting

#### Prometheus Metrics
```javascript
// metrics.js
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const databaseConnections = new prometheus.Gauge({
  name: 'database_connections',
  help: 'Number of database connections'
});
```

#### Grafana Dashboards
```json
{
  "dashboard": {
    "title": "Verigrade Application Metrics",
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

## Rollback Procedures

### 1. Application Rollback

#### Kubernetes Rollback
```bash
# Rollback deployment
kubectl rollout undo deployment/verigrade-app -n production

# Check rollback status
kubectl rollout status deployment/verigrade-app -n production

# Rollback to specific revision
kubectl rollout undo deployment/verigrade-app --to-revision=2 -n production
```

#### Database Rollback
```bash
# Rollback database migration
npm run db:migrate:rollback:production

# Rollback to specific migration
npm run db:migrate:rollback:production -- --to 20231201000000
```

### 2. Configuration Rollback

#### Environment Variable Rollback
```bash
# Revert environment variables
kubectl patch deployment verigrade-app -n production -p '{"spec":{"template":{"spec":{"containers":[{"name":"verigrade-app","env":[{"name":"NODE_ENV","value":"production"}]}]}}}}'

# Restart pods
kubectl rollout restart deployment/verigrade-app -n production
```

#### Secret Rollback
```bash
# Revert secrets
kubectl patch secret verigrade-secrets -p '{"data":{"database-url":"'$(echo -n "old-database-url" | base64)'"}}'

# Restart pods
kubectl rollout restart deployment/verigrade-app -n production
```

### 3. Blue-Green Rollback

#### Traffic Rollback
```bash
# Switch traffic back to blue
kubectl patch ingress verigrade-ingress -p '{"spec":{"rules":[{"host":"app.verigrade.com","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"verigrade-blue-service","port":{"number":80}}}]}]}}]}'

# Verify traffic switch
curl -H "Host: app.verigrade.com" http://load-balancer/health

# Clean up green environment
kubectl delete -f k8s/green/
```

## Troubleshooting

### 1. Common Issues

#### Application Won't Start
```bash
# Check pod logs
kubectl logs -f deployment/verigrade-app -n production

# Check pod status
kubectl describe pod -l app=verigrade-app -n production

# Check resource usage
kubectl top pods -n production
```

#### Database Connection Issues
```bash
# Test database connection
kubectl exec -it deployment/verigrade-app -n production -- psql $DATABASE_URL

# Check database logs
kubectl logs -f deployment/postgres -n production

# Check database metrics
kubectl exec -it deployment/verigrade-app -n production -- npm run db:status
```

#### Performance Issues
```bash
# Check resource usage
kubectl top pods -n production
kubectl top nodes

# Check slow queries
kubectl exec -it deployment/verigrade-app -n production -- npm run db:slow-queries

# Check application metrics
curl http://app.verigrade.com/metrics
```

### 2. Debugging Commands

#### Application Debugging
```bash
# Get pod shell
kubectl exec -it deployment/verigrade-app -n production -- /bin/sh

# Check environment variables
kubectl exec -it deployment/verigrade-app -n production -- env

# Check application logs
kubectl logs -f deployment/verigrade-app -n production --tail=100
```

#### Database Debugging
```bash
# Connect to database
kubectl exec -it deployment/verigrade-app -n production -- psql $DATABASE_URL

# Check database status
kubectl exec -it deployment/verigrade-app -n production -- npm run db:status

# Check database connections
kubectl exec -it deployment/verigrade-app -n production -- npm run db:connections
```

### 3. Emergency Procedures

#### Emergency Shutdown
```bash
# Scale down application
kubectl scale deployment verigrade-app --replicas=0 -n production

# Scale down database
kubectl scale deployment postgres --replicas=0 -n production

# Scale down Redis
kubectl scale deployment redis --replicas=0 -n production
```

#### Emergency Recovery
```bash
# Restore from backup
kubectl apply -f k8s/backup/

# Restore database
kubectl exec -it deployment/verigrade-app -n production -- npm run db:restore

# Restart services
kubectl rollout restart deployment/verigrade-app -n production
```

## Conclusion

This deployment runbook provides comprehensive instructions for deploying the Verigrade bookkeeping platform. Follow these procedures carefully to ensure successful deployments and maintain system reliability.

For additional support, contact the DevOps team or refer to the troubleshooting section for common issues and solutions.










