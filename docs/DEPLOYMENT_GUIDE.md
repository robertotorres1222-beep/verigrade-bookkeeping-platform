# Verigrade Bookkeeping Platform - Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the Verigrade bookkeeping platform in various environments.

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **Redis**: 6.x or higher
- **Docker**: 20.x or higher (for containerized deployment)
- **Kubernetes**: 1.24+ (for K8s deployment)

### Cloud Providers
- **AWS**: EC2, RDS, ElastiCache, S3, CloudFront
- **Google Cloud**: Compute Engine, Cloud SQL, Memorystore, Cloud Storage
- **Azure**: Virtual Machines, Azure Database, Redis Cache, Blob Storage
- **DigitalOcean**: Droplets, Managed Databases, Spaces

## Environment Setup

### 1. Development Environment

#### Local Development
```bash
# Clone repository
git clone https://github.com/verigrade/bookkeeping-platform.git
cd bookkeeping-platform

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run db:setup

# Start development servers
npm run dev
```

#### Docker Development
```bash
# Build development image
docker build -f Dockerfile.dev -t verigrade-dev .

# Run development container
docker run -p 3000:3000 -p 3001:3001 verigrade-dev
```

### 2. Staging Environment

#### Docker Compose
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

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=verigrade_staging
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### Deploy to Staging
```bash
# Deploy with Docker Compose
docker-compose -f docker-compose.staging.yml up -d

# Run migrations
docker-compose -f docker-compose.staging.yml exec app npm run db:migrate

# Seed database
docker-compose -f docker-compose.staging.yml exec app npm run db:seed
```

### 3. Production Environment

#### AWS Deployment

##### EC2 + RDS Setup
```bash
# Create EC2 instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.medium \
  --key-name your-key \
  --security-groups verigrade-sg

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier verigrade-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password your-password \
  --allocated-storage 20
```

##### ECS Deployment
```yaml
# task-definition.json
{
  "family": "verigrade-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "verigrade-app",
      "image": "your-account.dkr.ecr.region.amazonaws.com/verigrade:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:verigrade/database"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/verigrade",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

##### EKS Deployment
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: verigrade-app
spec:
  replicas: 3
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
        image: your-account.dkr.ecr.region.amazonaws.com/verigrade:latest
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
---
apiVersion: v1
kind: Service
metadata:
  name: verigrade-service
spec:
  selector:
    app: verigrade-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

#### Google Cloud Deployment

##### Cloud Run
```yaml
# cloudbuild.yaml
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'gcr.io/$PROJECT_ID/verigrade', '.']
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'gcr.io/$PROJECT_ID/verigrade']
- name: 'gcr.io/cloud-builders/gcloud'
  args: ['run', 'deploy', 'verigrade', '--image', 'gcr.io/$PROJECT_ID/verigrade', '--region', 'us-central1']
```

##### GKE Deployment
```yaml
# gke-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: verigrade-app
spec:
  replicas: 3
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
        image: gcr.io/PROJECT_ID/verigrade:latest
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
```

#### Azure Deployment

##### Container Instances
```bash
# Create resource group
az group create --name verigrade-rg --location eastus

# Create container instance
az container create \
  --resource-group verigrade-rg \
  --name verigrade-app \
  --image your-registry.azurecr.io/verigrade:latest \
  --cpu 1 \
  --memory 2 \
  --ports 3000 \
  --environment-variables NODE_ENV=production
```

##### AKS Deployment
```yaml
# aks-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: verigrade-app
spec:
  replicas: 3
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
        image: your-registry.azurecr.io/verigrade:latest
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
```

## Database Setup

### PostgreSQL Configuration
```sql
-- Create database
CREATE DATABASE verigrade_production;

-- Create user
CREATE USER verigrade_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE verigrade_production TO verigrade_user;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
```

### Redis Configuration
```conf
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Environment Variables

### Required Variables
```bash
# Application
NODE_ENV=production
PORT=3000
API_PORT=3001

# Database
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# File Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=verigrade-files

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Payment Processing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# Third-party Integrations
QUICKBOOKS_CLIENT_ID=your-quickbooks-client-id
QUICKBOOKS_CLIENT_SECRET=your-quickbooks-secret
XERO_CLIENT_ID=your-xero-client-id
XERO_CLIENT_SECRET=your-xero-secret
```

### Optional Variables
```bash
# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-newrelic-key

# Analytics
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
MIXPANEL_TOKEN=your-mixpanel-token

# CDN
CLOUDFLARE_API_TOKEN=your-cloudflare-token
CLOUDFLARE_ZONE_ID=your-zone-id
```

## SSL/TLS Configuration

### Let's Encrypt (Certbot)
```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/verigrade
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run test
    - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run build
    - uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist/
    - name: Deploy to AWS
      run: |
        aws s3 sync dist/ s3://your-bucket/
        aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### GitLab CI
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm ci
    - npm run test
    - npm run test:e2e

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  script:
    - aws s3 sync dist/ s3://your-bucket/
    - aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
  only:
    - main
```

## Monitoring & Logging

### Application Monitoring
```javascript
// monitoring.js
const newrelic = require('newrelic');
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Custom metrics
newrelic.recordMetric('Custom/UserRegistrations', 1);
newrelic.recordMetric('Custom/APIRequests', 1);
```

### Log Aggregation
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch
```

## Backup & Recovery

### Database Backup
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="verigrade_backup_$DATE.sql"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://verigrade-backups/database/

# Cleanup local file
rm $BACKUP_FILE

# Cleanup old backups (keep 30 days)
aws s3 ls s3://verigrade-backups/database/ | while read -r line; do
  createDate=$(echo $line | awk '{print $1" "$2}')
  createDate=$(date -d"$createDate" +%s)
  olderThan=$(date -d"30 days ago" +%s)
  if [[ $createDate -lt $olderThan ]]; then
    fileName=$(echo $line | awk '{print $4}')
    aws s3 rm s3://verigrade-backups/database/$fileName
  fi
done
```

### File Backup
```bash
#!/bin/bash
# file-backup.sh
DATE=$(date +%Y%m%d_%H%M%S)

# Sync files to backup bucket
aws s3 sync s3://verigrade-files/ s3://verigrade-backups/files/$DATE/

# Cleanup old backups
aws s3 ls s3://verigrade-backups/files/ | while read -r line; do
  createDate=$(echo $line | awk '{print $1" "$2}')
  createDate=$(date -d"$createDate" +%s)
  olderThan=$(date -d"30 days ago" +%s)
  if [[ $createDate -lt $olderThan ]]; then
    fileName=$(echo $line | awk '{print $4}')
    aws s3 rm s3://verigrade-backups/files/$fileName
  fi
done
```

## Security Configuration

### Firewall Rules
```bash
# UFW configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Security Headers
```javascript
// security.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Performance Optimization

### CDN Configuration
```javascript
// cdn.js
const cloudflare = require('cloudflare');

const cf = new cloudflare({
  email: process.env.CLOUDFLARE_EMAIL,
  key: process.env.CLOUDFLARE_API_KEY
});

// Purge cache
async function purgeCache() {
  await cf.zones.purgeCache(process.env.CLOUDFLARE_ZONE_ID, {
    purge_everything: true
  });
}
```

### Caching Strategy
```javascript
// cache.js
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache middleware
const cache = (duration) => {
  return (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    client.get(key, (err, result) => {
      if (result) {
        res.json(JSON.parse(result));
      } else {
        res.sendResponse = res.json;
        res.json = (body) => {
          client.setex(key, duration, JSON.stringify(body));
          res.sendResponse(body);
        };
        next();
      }
    });
  };
};
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Check connection pool
netstat -an | grep :5432
```

#### Redis Connection Issues
```bash
# Check Redis connectivity
redis-cli -u $REDIS_URL ping

# Check Redis memory usage
redis-cli -u $REDIS_URL info memory
```

#### Application Issues
```bash
# Check application logs
pm2 logs verigrade-app

# Check application status
pm2 status

# Restart application
pm2 restart verigrade-app
```

### Performance Issues
```bash
# Check CPU usage
top -p $(pgrep node)

# Check memory usage
free -h

# Check disk usage
df -h

# Check network connections
netstat -tulpn
```

## Maintenance

### Regular Maintenance Tasks
```bash
#!/bin/bash
# maintenance.sh

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up old logs
sudo find /var/log -name "*.log" -mtime +30 -delete

# Clean up old backups
find /backups -name "*.sql" -mtime +30 -delete

# Restart services
sudo systemctl restart nginx
pm2 restart all
```

### Health Checks
```bash
#!/bin/bash
# health-check.sh

# Check application health
curl -f http://localhost:3000/health || exit 1

# Check database health
psql $DATABASE_URL -c "SELECT 1;" || exit 1

# Check Redis health
redis-cli -u $REDIS_URL ping || exit 1

echo "All health checks passed"
```

## Scaling

### Horizontal Scaling
```yaml
# k8s-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: verigrade-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: verigrade-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Vertical Scaling
```yaml
# k8s-resources.yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "1000m"
```

## Disaster Recovery

### Backup Strategy
1. **Database**: Daily automated backups to S3
2. **Files**: Real-time replication to backup bucket
3. **Configuration**: Version controlled in Git
4. **Secrets**: Stored in secure secret management

### Recovery Procedures
1. **Database Recovery**: Restore from latest backup
2. **File Recovery**: Sync from backup bucket
3. **Application Recovery**: Deploy from Git repository
4. **Configuration Recovery**: Restore from version control

## Support

For deployment support:
- **Email**: deployment-support@verigrade.com
- **Documentation**: https://docs.verigrade.com/deployment
- **Status Page**: https://status.verigrade.com










