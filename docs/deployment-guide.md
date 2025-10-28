# VeriGrade Bookkeeping Platform - Deployment Guide

## Prerequisites

### System Requirements
- **Kubernetes**: v1.24+ with 3+ nodes
- **Docker**: v20.10+ for containerization
- **Helm**: v3.8+ for package management
- **kubectl**: v1.24+ for cluster management

### Cloud Infrastructure
- **AWS/GCP/Azure**: Multi-region deployment
- **Load Balancer**: Application Load Balancer
- **Database**: PostgreSQL 14+ with read replicas
- **Storage**: S3/CloudFlare R2 for file storage
- **Redis**: Redis Cluster for caching

## Environment Setup

### 1. Development Environment
```bash
# Clone repository
git clone https://github.com/your-org/verigrade-bookkeeping-platform.git
cd verigrade-bookkeeping-platform

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Configure database, Redis, S3 credentials

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### 2. Staging Environment
```bash
# Build Docker images
docker build -t verigrade-backend:staging ./backend
docker build -t verigrade-frontend:staging ./frontend
docker build -t verigrade-mobile:staging ./mobile-app

# Deploy to staging cluster
helm install verigrade-staging ./helm/verigrade \
  --set environment=staging \
  --set image.tag=staging
```

### 3. Production Environment
```bash
# Build production images
docker build -t verigrade-backend:latest ./backend
docker build -t verigrade-frontend:latest ./frontend
docker build -t verigrade-mobile:latest ./mobile-app

# Deploy to production cluster
helm install verigrade-prod ./helm/verigrade \
  --set environment=production \
  --set image.tag=latest \
  --set replicas.backend=3 \
  --set replicas.frontend=2
```

## Kubernetes Deployment

### 1. Namespace Setup
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: verigrade
  labels:
    name: verigrade
    environment: production
```

### 2. ConfigMaps and Secrets
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: verigrade-config
  namespace: verigrade
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  REDIS_URL: "redis://redis-cluster:6379"
  DATABASE_URL: "postgresql://user:pass@postgres:5432/verigrade"

---
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: verigrade-secrets
  namespace: verigrade
type: Opaque
data:
  JWT_SECRET: <base64-encoded>
  STRIPE_SECRET_KEY: <base64-encoded>
  OPENAI_API_KEY: <base64-encoded>
  AWS_ACCESS_KEY_ID: <base64-encoded>
  AWS_SECRET_ACCESS_KEY: <base64-encoded>
```

### 3. Database Deployment
```yaml
# postgres.yaml
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
          value: verigrade
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secrets
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
```

### 4. Backend Service Deployment
```yaml
# backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: verigrade-backend
  namespace: verigrade
spec:
  replicas: 3
  selector:
    matchLabels:
      app: verigrade-backend
  template:
    metadata:
      labels:
        app: verigrade-backend
    spec:
      containers:
      - name: backend
        image: verigrade-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: verigrade-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: verigrade-config
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

---
apiVersion: v1
kind: Service
metadata:
  name: verigrade-backend-service
  namespace: verigrade
spec:
  selector:
    app: verigrade-backend
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

### 5. Frontend Deployment
```yaml
# frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: verigrade-frontend
  namespace: verigrade
spec:
  replicas: 2
  selector:
    matchLabels:
      app: verigrade-frontend
  template:
    metadata:
      labels:
        app: verigrade-frontend
    spec:
      containers:
      - name: frontend
        image: verigrade-frontend:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"

---
apiVersion: v1
kind: Service
metadata:
  name: verigrade-frontend-service
  namespace: verigrade
spec:
  selector:
    app: verigrade-frontend
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

## Helm Charts

### 1. Chart Structure
```
helm/verigrade/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-staging.yaml
├── values-prod.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    ├── configmap.yaml
    ├── secrets.yaml
    └── hpa.yaml
```

### 2. Chart.yaml
```yaml
apiVersion: v2
name: verigrade
description: VeriGrade Bookkeeping Platform
type: application
version: 1.0.0
appVersion: "1.0.0"
dependencies:
- name: postgresql
  version: 12.1.2
  repository: https://charts.bitnami.com/bitnami
- name: redis
  version: 17.3.7
  repository: https://charts.bitnami.com/bitnami
```

### 3. values.yaml
```yaml
# Global configuration
global:
  environment: production
  domain: verigrade.com

# Backend configuration
backend:
  image:
    repository: verigrade-backend
    tag: latest
    pullPolicy: IfNotPresent
  replicas: 3
  resources:
    requests:
      memory: "512Mi"
      cpu: "250m"
    limits:
      memory: "1Gi"
      cpu: "500m"
  service:
    type: ClusterIP
    port: 3000

# Frontend configuration
frontend:
  image:
    repository: verigrade-frontend
    tag: latest
    pullPolicy: IfNotPresent
  replicas: 2
  resources:
    requests:
      memory: "256Mi"
      cpu: "100m"
    limits:
      memory: "512Mi"
      cpu: "200m"

# Database configuration
postgresql:
  enabled: true
  auth:
    postgresPassword: "verigrade123"
    database: "verigrade"
  primary:
    persistence:
      enabled: true
      size: 100Gi
    resources:
      requests:
        memory: "1Gi"
        cpu: "500m"
      limits:
        memory: "2Gi"
        cpu: "1000m"

# Redis configuration
redis:
  enabled: true
  auth:
    enabled: false
  master:
    persistence:
      enabled: true
      size: 10Gi
    resources:
      requests:
        memory: "256Mi"
        cpu: "100m"
      limits:
        memory: "512Mi"
        cpu: "200m"

# Ingress configuration
ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: verigrade.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: verigrade-tls
      hosts:
        - verigrade.com

# Monitoring configuration
monitoring:
  enabled: true
  prometheus:
    enabled: true
  grafana:
    enabled: true
```

## CI/CD Pipeline

### 1. GitHub Actions Workflow
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
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Run linting
      run: npm run lint
    - name: Run security audit
      run: npm audit

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Build Docker images
      run: |
        docker build -t verigrade-backend:${{ github.sha }} ./backend
        docker build -t verigrade-frontend:${{ github.sha }} ./frontend
    - name: Push to registry
      run: |
        docker push verigrade-backend:${{ github.sha }}
        docker push verigrade-frontend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to Kubernetes
      run: |
        helm upgrade --install verigrade ./helm/verigrade \
          --set backend.image.tag=${{ github.sha }} \
          --set frontend.image.tag=${{ github.sha }} \
          --set environment=production
```

### 2. Blue-Green Deployment
```yaml
# blue-green-deployment.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: verigrade-backend
spec:
  replicas: 3
  strategy:
    blueGreen:
      activeService: verigrade-backend-active
      previewService: verigrade-backend-preview
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 30
      prePromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: verigrade-backend-preview
      postPromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: verigrade-backend-active
  selector:
    matchLabels:
      app: verigrade-backend
  template:
    metadata:
      labels:
        app: verigrade-backend
    spec:
      containers:
      - name: backend
        image: verigrade-backend:latest
        ports:
        - containerPort: 3000
```

## Monitoring and Observability

### 1. Prometheus Configuration
```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'verigrade-backend'
      static_configs:
      - targets: ['verigrade-backend-service:3000']
    - job_name: 'verigrade-frontend'
      static_configs:
      - targets: ['verigrade-frontend-service:3000']
    - job_name: 'postgres'
      static_configs:
      - targets: ['postgres:5432']
    - job_name: 'redis'
      static_configs:
      - targets: ['redis:6379']
```

### 2. Grafana Dashboards
```yaml
# grafana-dashboard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboard
data:
  dashboard.json: |
    {
      "dashboard": {
        "title": "VeriGrade Platform",
        "panels": [
          {
            "title": "Request Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "rate(http_requests_total[5m])"
              }
            ]
          },
          {
            "title": "Response Time",
            "type": "graph",
            "targets": [
              {
                "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
              }
            ]
          }
        ]
      }
    }
```

## Security Configuration

### 1. Network Policies
```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: verigrade-network-policy
spec:
  podSelector:
    matchLabels:
      app: verigrade-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: verigrade
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: verigrade
    ports:
    - protocol: TCP
      port: 5432
    - protocol: TCP
      port: 6379
```

### 2. Pod Security Policy
```yaml
# pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: verigrade-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

## Backup and Disaster Recovery

### 1. Database Backup
```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="verigrade_backup_$DATE.sql"

# Create backup
kubectl exec -n verigrade postgres-0 -- pg_dump -U verigrade verigrade > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_DIR/$BACKUP_FILE.gz s3://verigrade-backups/postgres/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

### 2. Disaster Recovery Plan
```yaml
# disaster-recovery.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: disaster-recovery-plan
data:
  plan.md: |
    # Disaster Recovery Plan
    
    ## RTO: 1 hour
    ## RPO: 15 minutes
    
    ## Recovery Steps:
    1. Assess the scope of the disaster
    2. Activate disaster recovery site
    3. Restore database from latest backup
    4. Deploy application services
    5. Verify system functionality
    6. Notify stakeholders
    7. Conduct post-incident review
```

## Troubleshooting

### Common Issues

1. **Pod CrashLoopBackOff**
   ```bash
   kubectl logs -n verigrade verigrade-backend-xxx
   kubectl describe pod -n verigrade verigrade-backend-xxx
   ```

2. **Database Connection Issues**
   ```bash
   kubectl exec -n verigrade postgres-0 -- psql -U verigrade -d verigrade -c "SELECT 1;"
   ```

3. **Memory Issues**
   ```bash
   kubectl top pods -n verigrade
   kubectl top nodes
   ```

### Health Checks
```bash
# Application health
curl https://verigrade.com/health

# Database health
kubectl exec -n verigrade postgres-0 -- pg_isready

# Redis health
kubectl exec -n verigrade redis-0 -- redis-cli ping
```

## Performance Optimization

### 1. Horizontal Pod Autoscaler
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: verigrade-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: verigrade-backend
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

### 2. Vertical Pod Autoscaler
```yaml
# vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: verigrade-backend-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: verigrade-backend
  updatePolicy:
    updateMode: "Auto"
```

This deployment guide provides comprehensive instructions for deploying the VeriGrade Bookkeeping Platform in production environments with proper monitoring, security, and disaster recovery capabilities.







