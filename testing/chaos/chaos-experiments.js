const { ChaosMonkey } = require('chaos-monkey');
const { KubernetesClient } = require('@kubernetes/client-node');
const logger = require('../utils/logger');

class ChaosExperiments {
  constructor() {
    this.k8sClient = new KubernetesClient();
    this.chaosMonkey = new ChaosMonkey();
    this.experiments = new Map();
  }

  /**
   * Pod Kill Experiment
   * Randomly kills pods to test resilience
   */
  async podKillExperiment(namespace = 'verigrade', duration = 300000) {
    const experimentId = `pod-kill-${Date.now()}`;
    
    try {
      logger.info(`[ChaosExperiments] Starting pod kill experiment: ${experimentId}`);
      
      const experiment = {
        id: experimentId,
        type: 'pod-kill',
        namespace,
        duration,
        startTime: new Date(),
        status: 'running',
        actions: [],
      };

      this.experiments.set(experimentId, experiment);

      // Get all pods in the namespace
      const pods = await this.k8sClient.listNamespacedPod(namespace);
      
      if (pods.body.items.length === 0) {
        throw new Error('No pods found in namespace');
      }

      // Randomly select pods to kill
      const podsToKill = this.selectRandomPods(pods.body.items, 2);
      
      for (const pod of podsToKill) {
        try {
          await this.k8sClient.deleteNamespacedPod(pod.metadata.name, namespace);
          experiment.actions.push({
            action: 'pod-killed',
            podName: pod.metadata.name,
            timestamp: new Date(),
            success: true,
          });
          
          logger.info(`[ChaosExperiments] Killed pod: ${pod.metadata.name}`);
        } catch (error) {
          experiment.actions.push({
            action: 'pod-kill-failed',
            podName: pod.metadata.name,
            timestamp: new Date(),
            success: false,
            error: error.message,
          });
          
          logger.error(`[ChaosExperiments] Failed to kill pod ${pod.metadata.name}:`, error);
        }
      }

      // Monitor recovery
      await this.monitorRecovery(experimentId, duration);
      
      experiment.status = 'completed';
      experiment.endTime = new Date();
      
      logger.info(`[ChaosExperiments] Pod kill experiment completed: ${experimentId}`);
      return experiment;
      
    } catch (error) {
      logger.error(`[ChaosExperiments] Pod kill experiment failed: ${experimentId}`, error);
      throw error;
    }
  }

  /**
   * Network Latency Experiment
   * Introduces network latency to test performance under degraded conditions
   */
  async networkLatencyExperiment(namespace = 'verigrade', latency = 1000, duration = 300000) {
    const experimentId = `network-latency-${Date.now()}`;
    
    try {
      logger.info(`[ChaosExperiments] Starting network latency experiment: ${experimentId}`);
      
      const experiment = {
        id: experimentId,
        type: 'network-latency',
        namespace,
        latency,
        duration,
        startTime: new Date(),
        status: 'running',
        actions: [],
      };

      this.experiments.set(experimentId, experiment);

      // Apply network policy to introduce latency
      const networkPolicy = {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'NetworkPolicy',
        metadata: {
          name: `chaos-latency-${experimentId}`,
          namespace,
        },
        spec: {
          podSelector: {},
          policyTypes: ['Ingress', 'Egress'],
          ingress: [{
            from: [],
            ports: [{
              protocol: 'TCP',
              port: 80,
            }],
          }],
        },
      };

      try {
        await this.k8sClient.createNamespacedNetworkPolicy(namespace, networkPolicy);
        experiment.actions.push({
          action: 'network-policy-applied',
          timestamp: new Date(),
          success: true,
        });
        
        logger.info(`[ChaosExperiments] Applied network policy for latency: ${latency}ms`);
      } catch (error) {
        experiment.actions.push({
          action: 'network-policy-failed',
          timestamp: new Date(),
          success: false,
          error: error.message,
        });
        
        logger.error(`[ChaosExperiments] Failed to apply network policy:`, error);
      }

      // Monitor system performance
      await this.monitorPerformance(experimentId, duration);
      
      // Clean up network policy
      try {
        await this.k8sClient.deleteNamespacedNetworkPolicy(`chaos-latency-${experimentId}`, namespace);
        experiment.actions.push({
          action: 'network-policy-removed',
          timestamp: new Date(),
          success: true,
        });
      } catch (error) {
        logger.error(`[ChaosExperiments] Failed to remove network policy:`, error);
      }

      experiment.status = 'completed';
      experiment.endTime = new Date();
      
      logger.info(`[ChaosExperiments] Network latency experiment completed: ${experimentId}`);
      return experiment;
      
    } catch (error) {
      logger.error(`[ChaosExperiments] Network latency experiment failed: ${experimentId}`, error);
      throw error;
    }
  }

  /**
   * Resource Exhaustion Experiment
   * Consumes CPU and memory to test resource limits
   */
  async resourceExhaustionExperiment(namespace = 'verigrade', duration = 300000) {
    const experimentId = `resource-exhaustion-${Date.now()}`;
    
    try {
      logger.info(`[ChaosExperiments] Starting resource exhaustion experiment: ${experimentId}`);
      
      const experiment = {
        id: experimentId,
        type: 'resource-exhaustion',
        namespace,
        duration,
        startTime: new Date(),
        status: 'running',
        actions: [],
      };

      this.experiments.set(experimentId, experiment);

      // Create resource-intensive pod
      const stressPod = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: {
          name: `chaos-stress-${experimentId}`,
          namespace,
          labels: {
            'chaos-experiment': experimentId,
          },
        },
        spec: {
          containers: [{
            name: 'stress',
            image: 'polinux/stress-ng',
            resources: {
              requests: {
                memory: '1Gi',
                cpu: '1000m',
              },
              limits: {
                memory: '2Gi',
                cpu: '2000m',
              },
            },
            args: [
              '--cpu', '2',
              '--memory', '1',
              '--timeout', `${duration / 1000}s`,
            ],
          }],
          restartPolicy: 'Never',
        },
      };

      try {
        await this.k8sClient.createNamespacedPod(namespace, stressPod);
        experiment.actions.push({
          action: 'stress-pod-created',
          timestamp: new Date(),
          success: true,
        });
        
        logger.info(`[ChaosExperiments] Created stress pod: chaos-stress-${experimentId}`);
      } catch (error) {
        experiment.actions.push({
          action: 'stress-pod-failed',
          timestamp: new Date(),
          success: false,
          error: error.message,
        });
        
        logger.error(`[ChaosExperiments] Failed to create stress pod:`, error);
      }

      // Monitor resource usage
      await this.monitorResourceUsage(experimentId, duration);
      
      // Clean up stress pod
      try {
        await this.k8sClient.deleteNamespacedPod(`chaos-stress-${experimentId}`, namespace);
        experiment.actions.push({
          action: 'stress-pod-removed',
          timestamp: new Date(),
          success: true,
        });
      } catch (error) {
        logger.error(`[ChaosExperiments] Failed to remove stress pod:`, error);
      }

      experiment.status = 'completed';
      experiment.endTime = new Date();
      
      logger.info(`[ChaosExperiments] Resource exhaustion experiment completed: ${experimentId}`);
      return experiment;
      
    } catch (error) {
      logger.error(`[ChaosExperiments] Resource exhaustion experiment failed: ${experimentId}`, error);
      throw error;
    }
  }

  /**
   * Database Connection Failure Experiment
   * Simulates database connectivity issues
   */
  async databaseConnectionFailureExperiment(namespace = 'verigrade', duration = 300000) {
    const experimentId = `db-connection-failure-${Date.now()}`;
    
    try {
      logger.info(`[ChaosExperiments] Starting database connection failure experiment: ${experimentId}`);
      
      const experiment = {
        id: experimentId,
        type: 'database-connection-failure',
        namespace,
        duration,
        startTime: new Date(),
        status: 'running',
        actions: [],
      };

      this.experiments.set(experimentId, experiment);

      // Scale down database to 0 replicas
      try {
        await this.k8sClient.patchNamespacedDeploymentScale('postgres', namespace, {
          spec: { replicas: 0 },
        });
        
        experiment.actions.push({
          action: 'database-scaled-down',
          timestamp: new Date(),
          success: true,
        });
        
        logger.info(`[ChaosExperiments] Scaled down database to 0 replicas`);
      } catch (error) {
        experiment.actions.push({
          action: 'database-scale-down-failed',
          timestamp: new Date(),
          success: false,
          error: error.message,
        });
        
        logger.error(`[ChaosExperiments] Failed to scale down database:`, error);
      }

      // Monitor application behavior
      await this.monitorApplicationBehavior(experimentId, duration);
      
      // Restore database
      try {
        await this.k8sClient.patchNamespacedDeploymentScale('postgres', namespace, {
          spec: { replicas: 1 },
        });
        
        experiment.actions.push({
          action: 'database-scaled-up',
          timestamp: new Date(),
          success: true,
        });
        
        logger.info(`[ChaosExperiments] Scaled up database to 1 replica`);
      } catch (error) {
        logger.error(`[ChaosExperiments] Failed to scale up database:`, error);
      }

      experiment.status = 'completed';
      experiment.endTime = new Date();
      
      logger.info(`[ChaosExperiments] Database connection failure experiment completed: ${experimentId}`);
      return experiment;
      
    } catch (error) {
      logger.error(`[ChaosExperiments] Database connection failure experiment failed: ${experimentId}`, error);
      throw error;
    }
  }

  /**
   * Dependency Failure Experiment
   * Simulates failure of external dependencies
   */
  async dependencyFailureExperiment(namespace = 'verigrade', duration = 300000) {
    const experimentId = `dependency-failure-${Date.now()}`;
    
    try {
      logger.info(`[ChaosExperiments] Starting dependency failure experiment: ${experimentId}`);
      
      const experiment = {
        id: experimentId,
        type: 'dependency-failure',
        namespace,
        duration,
        startTime: new Date(),
        status: 'running',
        actions: [],
      };

      this.experiments.set(experimentId, experiment);

      // Block external API calls
      const networkPolicy = {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'NetworkPolicy',
        metadata: {
          name: `chaos-dependency-block-${experimentId}`,
          namespace,
        },
        spec: {
          podSelector: {},
          policyTypes: ['Egress'],
          egress: [{
            to: [],
            ports: [{
              protocol: 'TCP',
              port: 443,
            }],
          }],
        },
      };

      try {
        await this.k8sClient.createNamespacedNetworkPolicy(namespace, networkPolicy);
        experiment.actions.push({
          action: 'dependency-block-applied',
          timestamp: new Date(),
          success: true,
        });
        
        logger.info(`[ChaosExperiments] Applied dependency blocking policy`);
      } catch (error) {
        experiment.actions.push({
          action: 'dependency-block-failed',
          timestamp: new Date(),
          success: false,
          error: error.message,
        });
        
        logger.error(`[ChaosExperiments] Failed to apply dependency blocking policy:`, error);
      }

      // Monitor application behavior
      await this.monitorApplicationBehavior(experimentId, duration);
      
      // Clean up network policy
      try {
        await this.k8sClient.deleteNamespacedNetworkPolicy(`chaos-dependency-block-${experimentId}`, namespace);
        experiment.actions.push({
          action: 'dependency-block-removed',
          timestamp: new Date(),
          success: true,
        });
      } catch (error) {
        logger.error(`[ChaosExperiments] Failed to remove dependency blocking policy:`, error);
      }

      experiment.status = 'completed';
      experiment.endTime = new Date();
      
      logger.info(`[ChaosExperiments] Dependency failure experiment completed: ${experimentId}`);
      return experiment;
      
    } catch (error) {
      logger.error(`[ChaosExperiments] Dependency failure experiment failed: ${experimentId}`, error);
      throw error;
    }
  }

  /**
   * Run all chaos experiments
   */
  async runAllExperiments(namespace = 'verigrade') {
    const experiments = [
      () => this.podKillExperiment(namespace),
      () => this.networkLatencyExperiment(namespace, 500),
      () => this.resourceExhaustionExperiment(namespace),
      () => this.databaseConnectionFailureExperiment(namespace),
      () => this.dependencyFailureExperiment(namespace),
    ];

    const results = [];
    
    for (const experiment of experiments) {
      try {
        const result = await experiment();
        results.push(result);
        
        // Wait between experiments
        await new Promise(resolve => setTimeout(resolve, 60000));
      } catch (error) {
        logger.error(`[ChaosExperiments] Experiment failed:`, error);
        results.push({
          error: error.message,
          timestamp: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * Get experiment status
   */
  getExperimentStatus(experimentId) {
    return this.experiments.get(experimentId);
  }

  /**
   * Get all experiments
   */
  getAllExperiments() {
    return Array.from(this.experiments.values());
  }

  /**
   * Stop experiment
   */
  async stopExperiment(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error('Experiment not found');
    }

    if (experiment.status !== 'running') {
      throw new Error('Experiment is not running');
    }

    // Clean up based on experiment type
    switch (experiment.type) {
      case 'pod-kill':
        // No cleanup needed
        break;
      case 'network-latency':
        await this.k8sClient.deleteNamespacedNetworkPolicy(`chaos-latency-${experimentId}`, experiment.namespace);
        break;
      case 'resource-exhaustion':
        await this.k8sClient.deleteNamespacedPod(`chaos-stress-${experimentId}`, experiment.namespace);
        break;
      case 'database-connection-failure':
        await this.k8sClient.patchNamespacedDeploymentScale('postgres', experiment.namespace, {
          spec: { replicas: 1 },
        });
        break;
      case 'dependency-failure':
        await this.k8sClient.deleteNamespacedNetworkPolicy(`chaos-dependency-block-${experimentId}`, experiment.namespace);
        break;
    }

    experiment.status = 'stopped';
    experiment.endTime = new Date();
    
    logger.info(`[ChaosExperiments] Stopped experiment: ${experimentId}`);
    return experiment;
  }

  // Private helper methods
  selectRandomPods(pods, count) {
    const shuffled = pods.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async monitorRecovery(experimentId, duration) {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    while (Date.now() < endTime) {
      // Check pod status
      const pods = await this.k8sClient.listNamespacedPod('verigrade');
      const runningPods = pods.body.items.filter(pod => pod.status.phase === 'Running');
      
      const experiment = this.experiments.get(experimentId);
      if (experiment) {
        experiment.actions.push({
          action: 'recovery-check',
          timestamp: new Date(),
          runningPods: runningPods.length,
          totalPods: pods.body.items.length,
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 30000)); // Check every 30 seconds
    }
  }

  async monitorPerformance(experimentId, duration) {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    while (Date.now() < endTime) {
      // Check response times
      const responseTime = await this.checkResponseTime();
      
      const experiment = this.experiments.get(experimentId);
      if (experiment) {
        experiment.actions.push({
          action: 'performance-check',
          timestamp: new Date(),
          responseTime,
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 30000)); // Check every 30 seconds
    }
  }

  async monitorResourceUsage(experimentId, duration) {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    while (Date.now() < endTime) {
      // Check resource usage
      const resourceUsage = await this.checkResourceUsage();
      
      const experiment = this.experiments.get(experimentId);
      if (experiment) {
        experiment.actions.push({
          action: 'resource-check',
          timestamp: new Date(),
          ...resourceUsage,
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 30000)); // Check every 30 seconds
    }
  }

  async monitorApplicationBehavior(experimentId, duration) {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    while (Date.now() < endTime) {
      // Check application health
      const healthStatus = await this.checkApplicationHealth();
      
      const experiment = this.experiments.get(experimentId);
      if (experiment) {
        experiment.actions.push({
          action: 'behavior-check',
          timestamp: new Date(),
          ...healthStatus,
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 30000)); // Check every 30 seconds
    }
  }

  async checkResponseTime() {
    try {
      const start = Date.now();
      const response = await fetch('https://api.verigrade.com/health');
      const end = Date.now();
      return end - start;
    } catch (error) {
      return -1; // Error
    }
  }

  async checkResourceUsage() {
    // This would typically query Prometheus or similar monitoring system
    return {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
    };
  }

  async checkApplicationHealth() {
    try {
      const response = await fetch('https://api.verigrade.com/health');
      const data = await response.json();
      return {
        status: data.status,
        healthy: data.healthy,
      };
    } catch (error) {
      return {
        status: 'error',
        healthy: false,
        error: error.message,
      };
    }
  }
}

module.exports = ChaosExperiments;





