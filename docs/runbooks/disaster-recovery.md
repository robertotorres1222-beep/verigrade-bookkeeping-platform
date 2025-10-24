# VeriGrade Disaster Recovery Runbook

## Overview

This document provides comprehensive disaster recovery procedures for the VeriGrade bookkeeping platform. It covers recovery time objectives (RTO), recovery point objectives (RPO), and step-by-step procedures for various disaster scenarios.

## Recovery Objectives

- **RTO (Recovery Time Objective)**: < 1 hour
- **RPO (Recovery Point Objective)**: < 15 minutes
- **Availability Target**: 99.9% (8.76 hours downtime/year)

## Disaster Scenarios

### 1. Database Failure
- **Impact**: Complete data loss, service unavailable
- **RTO**: 30 minutes
- **RPO**: 5 minutes

### 2. Application Server Failure
- **Impact**: Service unavailable, data intact
- **RTO**: 15 minutes
- **RPO**: 0 minutes

### 3. Regional Outage
- **Impact**: Complete service unavailability
- **RTO**: 45 minutes
- **RPO**: 10 minutes

### 4. Data Corruption
- **Impact**: Data integrity issues
- **RTO**: 1 hour
- **RPO**: 15 minutes

## Recovery Procedures

### Database Recovery

#### 1.1 Automated Failover (Primary → Secondary)

```bash
# 1. Check database health
kubectl exec -n verigrade postgres-0 -- pg_isready -U postgres -d verigrade

# 2. If primary is down, promote secondary
kubectl exec -n verigrade postgres-0 -- pg_ctl promote

# 3. Update connection strings
kubectl patch secret verigrade-secrets -n verigrade --type='json' \
  -p='[{"op": "replace", "path": "/data/database-url", "value": "NEW_DATABASE_URL"}]'

# 4. Restart applications
kubectl rollout restart deployment verigrade-backend -n verigrade
kubectl rollout restart deployment verigrade-frontend -n verigrade
```

#### 1.2 Point-in-Time Recovery

```bash
# 1. Stop applications
kubectl scale deployment verigrade-backend --replicas=0 -n verigrade

# 2. Restore from backup
kubectl exec -n verigrade postgres-0 -- pg_restore \
  --clean --if-exists --no-owner --no-privileges \
  --dbname=verigrade /backup/database-backup-$(date +%Y%m%d).sql

# 3. Verify data integrity
kubectl exec -n verigrade postgres-0 -- psql -U postgres -d verigrade \
  -c "SELECT COUNT(*) FROM users;"

# 4. Restart applications
kubectl scale deployment verigrade-backend --replicas=3 -n verigrade
```

#### 1.3 Cross-Region Recovery

```bash
# 1. Deploy to secondary region
kubectl apply -f k8s/production/ -n verigrade-dr

# 2. Restore database from S3 backup
aws s3 cp s3://verigrade-backups/database/latest/database-backup.sql.gz /tmp/
gunzip /tmp/database-backup.sql.gz

# 3. Import database
kubectl exec -n verigrade-dr postgres-0 -- psql -U postgres -d verigrade < /tmp/database-backup.sql

# 4. Update DNS to point to DR region
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch file://dns-change.json
```

### Application Recovery

#### 2.1 Service Restart

```bash
# 1. Check service status
kubectl get pods -n verigrade

# 2. Restart failed services
kubectl rollout restart deployment verigrade-backend -n verigrade
kubectl rollout restart deployment verigrade-frontend -n verigrade

# 3. Wait for rollout to complete
kubectl rollout status deployment verigrade-backend -n verigrade
kubectl rollout status deployment verigrade-frontend -n verigrade

# 4. Verify health
kubectl get pods -n verigrade
curl -f https://api.verigrade.com/health
```

#### 2.2 Blue-Green Deployment

```bash
# 1. Deploy new version to green environment
kubectl apply -f k8s/green/ -n verigrade-green

# 2. Run smoke tests
kubectl exec -n verigrade-green verigrade-backend-0 -- npm run test:smoke

# 3. Switch traffic to green
kubectl patch service verigrade-backend -n verigrade \
  -p '{"spec":{"selector":{"version":"green"}}}'

# 4. Monitor for 5 minutes
kubectl logs -f deployment/verigrade-backend -n verigrade-green

# 5. If stable, decommission blue
kubectl delete namespace verigrade-blue
```

### File Storage Recovery

#### 3.1 S3 Cross-Region Replication

```bash
# 1. Check replication status
aws s3api get-bucket-replication --bucket verigrade-documents

# 2. If replication failed, manually sync
aws s3 sync s3://verigrade-documents s3://verigrade-documents-dr \
  --source-region us-east-1 --region us-west-2

# 3. Verify file integrity
aws s3api list-objects-v2 --bucket verigrade-documents-dr \
  --query 'Contents[].{Key:Key,Size:Size}' --output table
```

#### 3.2 File Restoration

```bash
# 1. Download from backup
aws s3 cp s3://verigrade-backups/files/latest/files-backup.tar.gz /tmp/

# 2. Decrypt and extract
openssl enc -d -aes-256-gcm -in /tmp/files-backup.tar.gz.enc \
  -out /tmp/files-backup.tar.gz -k $BACKUP_ENCRYPTION_KEY

# 3. Extract to uploads directory
tar -xzf /tmp/files-backup.tar.gz -C /app/uploads

# 4. Set proper permissions
chown -R 1000:1000 /app/uploads
chmod -R 755 /app/uploads
```

### Configuration Recovery

#### 4.1 Secrets Recovery

```bash
# 1. Restore from AWS Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id verigrade/production/secrets \
  --query SecretString --output text | jq . > secrets.json

# 2. Apply to Kubernetes
kubectl create secret generic verigrade-secrets \
  --from-env-file=secrets.json -n verigrade

# 3. Restart applications
kubectl rollout restart deployment verigrade-backend -n verigrade
```

#### 4.2 ConfigMap Recovery

```bash
# 1. Restore from Git
git checkout HEAD~1 -- k8s/base/configmap.yaml

# 2. Apply configuration
kubectl apply -f k8s/base/configmap.yaml -n verigrade

# 3. Restart applications
kubectl rollout restart deployment verigrade-backend -n verigrade
```

## Monitoring and Alerting

### Health Checks

```bash
# Application health
curl -f https://api.verigrade.com/health

# Database health
kubectl exec -n verigrade postgres-0 -- pg_isready -U postgres

# Redis health
kubectl exec -n verigrade redis-0 -- redis-cli ping

# Storage health
aws s3api head-bucket --bucket verigrade-documents
```

### Alert Thresholds

- **Database**: > 5 seconds response time
- **Application**: > 2 seconds response time
- **Storage**: > 1 second response time
- **Memory**: > 80% utilization
- **CPU**: > 70% utilization
- **Disk**: > 85% utilization

## Communication Procedures

### 1. Incident Declaration

```bash
# Send alert to on-call team
curl -X POST https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX \
  -H 'Content-type: application/json' \
  --data '{"text":"🚨 DISASTER RECOVERY INITIATED - VeriGrade Platform"}'
```

### 2. Status Updates

- **T+0**: Incident declared, team notified
- **T+5**: Initial assessment complete
- **T+15**: Recovery procedure started
- **T+30**: Progress update
- **T+45**: Recovery complete or escalation
- **T+60**: Full service restoration

### 3. Post-Incident

- **T+24h**: Post-mortem meeting
- **T+48h**: Incident report published
- **T+1w**: Process improvements implemented

## Testing Procedures

### Monthly DR Test

```bash
# 1. Schedule maintenance window
kubectl annotate namespace verigrade maintenance-window="2024-01-15T02:00:00Z"

# 2. Run full backup
kubectl exec -n verigrade verigrade-backend-0 -- npm run backup:full

# 3. Test restore procedure
kubectl exec -n verigrade verigrade-backend-0 -- npm run backup:test-restore

# 4. Verify data integrity
kubectl exec -n verigrade postgres-0 -- psql -U postgres -d verigrade \
  -c "SELECT COUNT(*) FROM users, invoices, expenses;"

# 5. Complete test
kubectl annotate namespace verigrade maintenance-window-
```

### Quarterly Full DR Test

1. **Setup DR Environment**
   - Deploy to secondary region
   - Configure cross-region replication
   - Test failover procedures

2. **Simulate Disaster**
   - Shutdown primary region
   - Activate DR procedures
   - Verify service continuity

3. **Recovery Testing**
   - Restore from backups
   - Validate data integrity
   - Performance testing

4. **Failback Testing**
   - Restore primary region
   - Sync data back
   - Switch traffic back

## Recovery Validation

### Data Integrity Checks

```sql
-- User data
SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '1 hour';

-- Financial data
SELECT SUM(amount) FROM transactions WHERE created_at > NOW() - INTERVAL '1 hour';

-- Invoice data
SELECT COUNT(*) FROM invoices WHERE status = 'paid' AND created_at > NOW() - INTERVAL '1 hour';
```

### Performance Validation

```bash
# Response time test
curl -w "@curl-format.txt" -o /dev/null -s https://api.verigrade.com/health

# Load test
k6 run --vus 10 --duration 30s load-test.js

# Database performance
kubectl exec -n verigrade postgres-0 -- psql -U postgres -d verigrade \
  -c "EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';"
```

## Emergency Contacts

- **Primary On-Call**: +1-555-0001
- **Secondary On-Call**: +1-555-0002
- **Database Admin**: +1-555-0003
- **Infrastructure Lead**: +1-555-0004
- **Security Team**: +1-555-0005

## Escalation Matrix

| Level | Response Time | Escalation |
|-------|---------------|------------|
| P1    | 5 minutes     | CTO, VP Engineering |
| P2    | 15 minutes    | Engineering Manager |
| P3    | 1 hour        | Team Lead |
| P4    | 4 hours       | On-call Engineer |

## Recovery Checklist

- [ ] Incident declared and team notified
- [ ] Impact assessment completed
- [ ] Recovery procedure initiated
- [ ] Data integrity verified
- [ ] Service health confirmed
- [ ] Performance validated
- [ ] Monitoring restored
- [ ] Post-incident review scheduled
- [ ] Documentation updated

---

**Last Updated**: 2024-01-15
**Next Review**: 2024-02-15
**Version**: 1.0.0





