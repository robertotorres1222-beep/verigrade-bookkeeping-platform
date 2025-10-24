import { Router } from 'express';
import ProductionInfrastructureController from '../controllers/productionInfrastructureController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const productionInfrastructureController = new ProductionInfrastructureController();

// Kubernetes Clusters
router.post('/companies/:companyId/clusters', authenticateToken, productionInfrastructureController.createKubernetesCluster);
router.get('/companies/:companyId/clusters', authenticateToken, productionInfrastructureController.getKubernetesClusters);
router.put('/clusters/:clusterId', authenticateToken, productionInfrastructureController.updateCluster);
router.delete('/clusters/:clusterId', authenticateToken, productionInfrastructureController.deleteCluster);
router.post('/clusters/:clusterId/scale', authenticateToken, productionInfrastructureController.scaleCluster);
router.get('/clusters/:clusterId/health', authenticateToken, productionInfrastructureController.getClusterHealth);

// Helm Charts
router.post('/companies/:companyId/helm-charts', authenticateToken, productionInfrastructureController.deployHelmChart);
router.get('/companies/:companyId/helm-charts', authenticateToken, productionInfrastructureController.getHelmCharts);

// Secrets Management
router.post('/companies/:companyId/secrets', authenticateToken, productionInfrastructureController.createSecret);
router.get('/companies/:companyId/secrets', authenticateToken, productionInfrastructureController.getSecrets);
router.post('/secrets/:secretId/rotate', authenticateToken, productionInfrastructureController.rotateSecret);

// Load Balancers
router.post('/companies/:companyId/load-balancers', authenticateToken, productionInfrastructureController.createLoadBalancer);
router.get('/companies/:companyId/load-balancers', authenticateToken, productionInfrastructureController.getLoadBalancers);

// Auto-scaling
router.post('/companies/:companyId/auto-scaling', authenticateToken, productionInfrastructureController.createAutoScalingConfig);
router.get('/companies/:companyId/auto-scaling', authenticateToken, productionInfrastructureController.getAutoScalingConfigs);

// Service Mesh
router.post('/clusters/:clusterId/service-mesh', authenticateToken, productionInfrastructureController.deployServiceMesh);

// Monitoring
router.post('/clusters/:clusterId/monitoring', authenticateToken, productionInfrastructureController.configureMonitoring);

// Backup
router.post('/companies/:companyId/backup-strategy', authenticateToken, productionInfrastructureController.setupBackupStrategy);

// Infrastructure Metrics
router.get('/companies/:companyId/metrics', authenticateToken, productionInfrastructureController.getInfrastructureMetrics);

export default router;





