#!/bin/bash

# Deployment script for VeriGrade platform
set -e

# Configuration
ENVIRONMENT=${1:-staging}
NAMESPACE="verigrade-${ENVIRONMENT}"
REGISTRY="ghcr.io"
IMAGE_TAG=${2:-latest}

echo "🚀 Deploying VeriGrade to ${ENVIRONMENT} environment..."

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo "❌ helm is not installed. Please install helm first."
    exit 1
fi

# Create namespace if it doesn't exist
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Deploy database
echo "📊 Deploying PostgreSQL..."
helm upgrade --install postgresql postgresql \
  --namespace ${NAMESPACE} \
  --set auth.postgresPassword=verigrade123 \
  --set auth.database=verigrade \
  --set primary.persistence.size=20Gi \
  --set primary.resources.requests.memory=512Mi \
  --set primary.resources.requests.cpu=250m \
  --set primary.resources.limits.memory=1Gi \
  --set primary.resources.limits.cpu=500m

# Deploy Redis
echo "🔄 Deploying Redis..."
helm upgrade --install redis redis \
  --namespace ${NAMESPACE} \
  --set auth.enabled=false \
  --set master.persistence.size=5Gi \
  --set master.resources.requests.memory=256Mi \
  --set master.resources.requests.cpu=100m \
  --set master.resources.limits.memory=512Mi \
  --set master.resources.limits.cpu=200m

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=postgresql -n ${NAMESPACE} --timeout=300s

# Deploy backend
echo "🔧 Deploying backend..."
kubectl apply -f kubernetes/backend-deployment.yaml -n ${NAMESPACE}

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l app=verigrade-backend -n ${NAMESPACE} --timeout=300s

# Deploy frontend
echo "🎨 Deploying frontend..."
kubectl apply -f kubernetes/frontend-deployment.yaml -n ${NAMESPACE}

# Deploy ingress
echo "🌐 Deploying ingress..."
kubectl apply -f kubernetes/ingress.yaml -n ${NAMESPACE}

# Deploy monitoring
echo "📊 Deploying monitoring..."
kubectl apply -f kubernetes/monitoring/ -n ${NAMESPACE}

# Run database migrations
echo "🗄️ Running database migrations..."
kubectl run migration-job --image=${REGISTRY}/verigrade-backend:${IMAGE_TAG} \
  --namespace ${NAMESPACE} \
  --rm -i --restart=Never \
  --env="DATABASE_URL=postgresql://postgres:verigrade123@postgresql:5432/verigrade" \
  --command -- npx prisma migrate deploy

# Health check
echo "🏥 Performing health check..."
kubectl get pods -n ${NAMESPACE}
kubectl get services -n ${NAMESPACE}
kubectl get ingress -n ${NAMESPACE}

echo "✅ Deployment completed successfully!"
echo "🌐 Application URL: https://verigrade.${ENVIRONMENT}.yourdomain.com"
echo "📊 Monitoring URL: https://grafana.${ENVIRONMENT}.yourdomain.com"


