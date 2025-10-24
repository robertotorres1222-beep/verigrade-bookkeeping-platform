import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import logger from '../utils/logger';

export interface SecurityVulnerability {
  id: string;
  type: 'sql_injection' | 'xss' | 'csrf' | 'insecure_direct_object_reference' | 'security_misconfiguration' | 'sensitive_data_exposure' | 'missing_function_level_access_control' | 'known_vulnerable_components' | 'unvalidated_redirects_forwards';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  file: string;
  line: number;
  recommendation: string;
  cwe: string;
  owasp: string;
  timestamp: Date;
}

export interface SecurityAudit {
  id: string;
  timestamp: Date;
  vulnerabilities: SecurityVulnerability[];
  score: number;
  status: 'passed' | 'failed' | 'warning';
  recommendations: string[];
}

export interface SecurityHeaders {
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
  'Content-Security-Policy': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
}

export interface InputValidationRule {
  field: string;
  type: 'string' | 'number' | 'email' | 'url' | 'date' | 'uuid' | 'json';
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  sanitize: boolean;
  allowHtml: boolean;
}

class SecurityHardeningService {
  private prisma: PrismaClient;
  private vulnerabilities: Map<string, SecurityVulnerability> = new Map();

  constructor() {
    this.prisma = new PrismaClient();
    logger.info('[SecurityHardeningService] Initialized');
  }

  /**
   * Perform comprehensive security audit
   */
  public async performSecurityAudit(): Promise<SecurityAudit> {
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      // Check for SQL injection vulnerabilities
      const sqlVulns = await this.checkSQLInjectionVulnerabilities();
      vulnerabilities.push(...sqlVulns);

      // Check for XSS vulnerabilities
      const xssVulns = await this.checkXSSVulnerabilities();
      vulnerabilities.push(...xssVulns);

      // Check for CSRF vulnerabilities
      const csrfVulns = await this.checkCSRFVulnerabilities();
      vulnerabilities.push(...csrfVulns);

      // Check for insecure direct object references
      const idorVulns = await this.checkIDORVulnerabilities();
      vulnerabilities.push(...idorVulns);

      // Check for security misconfigurations
      const configVulns = await this.checkSecurityMisconfigurations();
      vulnerabilities.push(...configVulns);

      // Check for sensitive data exposure
      const dataVulns = await this.checkSensitiveDataExposure();
      vulnerabilities.push(...dataVulns);

      // Check for missing access controls
      const accessVulns = await this.checkMissingAccessControls();
      vulnerabilities.push(...accessVulns);

      // Check for known vulnerable components
      const componentVulns = await this.checkVulnerableComponents();
      vulnerabilities.push(...componentVulns);

      // Calculate security score
      const score = this.calculateSecurityScore(vulnerabilities);
      const status = this.determineAuditStatus(score, vulnerabilities);

      // Generate recommendations
      const recommendations = this.generateSecurityRecommendations(vulnerabilities);

      const audit: SecurityAudit = {
        id: `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
        timestamp: new Date(),
        vulnerabilities,
        score,
        status,
        recommendations
      };

      // Store audit results
      await this.storeAuditResults(audit);

      return audit;
    } catch (error: any) {
      logger.error('[SecurityHardeningService] Error performing security audit:', error);
      throw new Error(`Security audit failed: ${error.message}`);
    }
  }

  /**
   * Check for SQL injection vulnerabilities
   */
  private async checkSQLInjectionVulnerabilities(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for raw SQL queries without parameterization
    const rawQueries = await this.findRawSQLQueries();
    
    for (const query of rawQueries) {
      if (this.containsSQLInjectionRisk(query.query)) {
        vulnerabilities.push({
          id: `sql_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
          type: 'sql_injection',
          severity: 'high',
          title: 'Potential SQL Injection Vulnerability',
          description: `Raw SQL query may be vulnerable to SQL injection: ${query.query.substring(0, 100)}...`,
          file: query.file,
          line: query.line,
          recommendation: 'Use parameterized queries or Prisma ORM methods instead of raw SQL',
          cwe: 'CWE-89',
          owasp: 'A03:2021 – Injection',
          timestamp: new Date()
        });
      }
    }

    return vulnerabilities;
  }

  /**
   * Check for XSS vulnerabilities
   */
  private async checkXSSVulnerabilities(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for unescaped user input in responses
    const xssPatterns = await this.findXSSPatterns();
    
    for (const pattern of xssPatterns) {
      vulnerabilities.push({
        id: `xss_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        type: 'xss',
        severity: 'medium',
        title: 'Potential XSS Vulnerability',
        description: `Unescaped user input may be vulnerable to XSS: ${pattern.code.substring(0, 100)}...`,
        file: pattern.file,
        line: pattern.line,
        recommendation: 'Escape user input before rendering in HTML or use Content Security Policy',
        cwe: 'CWE-79',
        owasp: 'A03:2021 – Injection',
        timestamp: new Date()
      });
    }

    return vulnerabilities;
  }

  /**
   * Check for CSRF vulnerabilities
   */
  private async checkCSRFVulnerabilities(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for missing CSRF protection on state-changing operations
    const csrfEndpoints = await this.findCSRFVulnerableEndpoints();
    
    for (const endpoint of csrfEndpoints) {
      vulnerabilities.push({
        id: `csrf_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        type: 'csrf',
        severity: 'medium',
        title: 'Missing CSRF Protection',
        description: `State-changing endpoint lacks CSRF protection: ${endpoint.method} ${endpoint.path}`,
        file: endpoint.file,
        line: endpoint.line,
        recommendation: 'Implement CSRF tokens for all state-changing operations',
        cwe: 'CWE-352',
        owasp: 'A01:2021 – Broken Access Control',
        timestamp: new Date()
      });
    }

    return vulnerabilities;
  }

  /**
   * Check for insecure direct object references
   */
  private async checkIDORVulnerabilities(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for endpoints that don't verify user ownership
    const idorEndpoints = await this.findIDORVulnerableEndpoints();
    
    for (const endpoint of idorEndpoints) {
      vulnerabilities.push({
        id: `idor_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        type: 'insecure_direct_object_reference',
        severity: 'high',
        title: 'Insecure Direct Object Reference',
        description: `Endpoint may allow access to other users' resources: ${endpoint.method} ${endpoint.path}`,
        file: endpoint.file,
        line: endpoint.line,
        recommendation: 'Verify user ownership of resources before allowing access',
        cwe: 'CWE-639',
        owasp: 'A01:2021 – Broken Access Control',
        timestamp: new Date()
      });
    }

    return vulnerabilities;
  }

  /**
   * Check for security misconfigurations
   */
  private async checkSecurityMisconfigurations(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for missing security headers
    const missingHeaders = this.checkSecurityHeaders();
    if (missingHeaders.length > 0) {
      vulnerabilities.push({
        id: `config_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        type: 'security_misconfiguration',
        severity: 'medium',
        title: 'Missing Security Headers',
        description: `Missing security headers: ${missingHeaders.join(', ')}`,
        file: 'middleware/security.ts',
        line: 1,
        recommendation: 'Implement all recommended security headers',
        cwe: 'CWE-693',
        owasp: 'A05:2021 – Security Misconfiguration',
        timestamp: new Date()
      });
    }

    // Check for debug mode in production
    if (process.env.NODE_ENV === 'production' && process.env.DEBUG) {
      vulnerabilities.push({
        id: `config_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        type: 'security_misconfiguration',
        severity: 'high',
        title: 'Debug Mode Enabled in Production',
        description: 'Debug mode is enabled in production environment',
        file: '.env',
        line: 1,
        recommendation: 'Disable debug mode in production',
        cwe: 'CWE-489',
        owasp: 'A05:2021 – Security Misconfiguration',
        timestamp: new Date()
      });
    }

    return vulnerabilities;
  }

  /**
   * Check for sensitive data exposure
   */
  private async checkSensitiveDataExposure(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for hardcoded secrets
    const hardcodedSecrets = await this.findHardcodedSecrets();
    
    for (const secret of hardcodedSecrets) {
      vulnerabilities.push({
        id: `data_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        type: 'sensitive_data_exposure',
        severity: 'critical',
        title: 'Hardcoded Secret Found',
        description: `Hardcoded secret found in code: ${secret.type}`,
        file: secret.file,
        line: secret.line,
        recommendation: 'Move secrets to environment variables or secure secret management',
        cwe: 'CWE-798',
        owasp: 'A07:2021 – Identification and Authentication Failures',
        timestamp: new Date()
      });
    }

    // Check for unencrypted sensitive data
    const unencryptedData = await this.findUnencryptedSensitiveData();
    
    for (const data of unencryptedData) {
      vulnerabilities.push({
        id: `data_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        type: 'sensitive_data_exposure',
        severity: 'high',
        title: 'Unencrypted Sensitive Data',
        description: `Sensitive data may not be encrypted: ${data.type}`,
        file: data.file,
        line: data.line,
        recommendation: 'Encrypt sensitive data at rest and in transit',
        cwe: 'CWE-311',
        owasp: 'A02:2021 – Cryptographic Failures',
        timestamp: new Date()
      });
    }

    return vulnerabilities;
  }

  /**
   * Check for missing access controls
   */
  private async checkMissingAccessControls(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for endpoints without authentication
    const unprotectedEndpoints = await this.findUnprotectedEndpoints();
    
    for (const endpoint of unprotectedEndpoints) {
      vulnerabilities.push({
        id: `access_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        type: 'missing_function_level_access_control',
        severity: 'high',
        title: 'Missing Authentication',
        description: `Endpoint lacks authentication: ${endpoint.method} ${endpoint.path}`,
        file: endpoint.file,
        line: endpoint.line,
        recommendation: 'Add authentication middleware to protect sensitive endpoints',
        cwe: 'CWE-862',
        owasp: 'A01:2021 – Broken Access Control',
        timestamp: new Date()
      });
    }

    return vulnerabilities;
  }

  /**
   * Check for known vulnerable components
   */
  private async checkVulnerableComponents(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check package.json for known vulnerabilities
    const packageVulns = await this.checkPackageVulnerabilities();
    
    for (const vuln of packageVulns) {
      vulnerabilities.push({
        id: `component_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        type: 'known_vulnerable_components',
        severity: vuln.severity as any,
        title: `Vulnerable Package: ${vuln.package}`,
        description: `Package ${vuln.package} has known vulnerability: ${vuln.description}`,
        file: 'package.json',
        line: 1,
        recommendation: `Update ${vuln.package} to version ${vuln.fixedVersion} or later`,
        cwe: 'CWE-1104',
        owasp: 'A06:2021 – Vulnerable and Outdated Components',
        timestamp: new Date()
      });
    }

    return vulnerabilities;
  }

  /**
   * Generate security headers configuration
   */
  public generateSecurityHeaders(): SecurityHeaders {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  /**
   * Generate input validation rules
   */
  public generateInputValidationRules(): InputValidationRule[] {
    return [
      {
        field: 'email',
        type: 'email',
        required: true,
        maxLength: 255,
        sanitize: true,
        allowHtml: false
      },
      {
        field: 'password',
        type: 'string',
        required: true,
        minLength: 8,
        maxLength: 128,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
        sanitize: true,
        allowHtml: false
      },
      {
        field: 'amount',
        type: 'number',
        required: true,
        sanitize: true,
        allowHtml: false
      },
      {
        field: 'description',
        type: 'string',
        required: false,
        maxLength: 1000,
        sanitize: true,
        allowHtml: false
      },
      {
        field: 'date',
        type: 'date',
        required: true,
        sanitize: true,
        allowHtml: false
      }
    ];
  }

  /**
   * Validate input against rules
   */
  public validateInput(input: any, rules: InputValidationRule[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = input[rule.field];

      // Check required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      if (value === undefined || value === null || value === '') {
        continue; // Skip validation for optional empty fields
      }

      // Type validation
      if (rule.type === 'email' && !this.isValidEmail(value)) {
        errors.push(`${rule.field} must be a valid email address`);
      }

      if (rule.type === 'number' && isNaN(Number(value))) {
        errors.push(`${rule.field} must be a valid number`);
      }

      if (rule.type === 'date' && isNaN(Date.parse(value))) {
        errors.push(`${rule.field} must be a valid date`);
      }

      if (rule.type === 'uuid' && !this.isValidUUID(value)) {
        errors.push(`${rule.field} must be a valid UUID`);
      }

      // Length validation
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${rule.field} must be no more than ${rule.maxLength} characters long`);
      }

      // Pattern validation
      if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
        errors.push(`${rule.field} does not match required pattern`);
      }

      // HTML validation
      if (!rule.allowHtml && this.containsHTML(value)) {
        errors.push(`${rule.field} contains HTML which is not allowed`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize input
   */
  public sanitizeInput(input: any, rules: InputValidationRule[]): any {
    const sanitized = { ...input };

    for (const rule of rules) {
      const value = sanitized[rule.field];
      
      if (value !== undefined && value !== null && value !== '') {
        if (rule.sanitize) {
          sanitized[rule.field] = this.sanitizeString(value);
        }
      }
    }

    return sanitized;
  }

  // Helper methods
  private async findRawSQLQueries(): Promise<Array<{ query: string; file: string; line: number }>> {
    // This would scan the codebase for raw SQL queries
    // For now, return empty array
    return [];
  }

  private containsSQLInjectionRisk(query: string): boolean {
    // Simple check for common SQL injection patterns
    const dangerousPatterns = [
      /'.*or.*'.*=/i,
      /'.*union.*select/i,
      /'.*drop.*table/i,
      /'.*delete.*from/i,
      /'.*insert.*into/i,
      /'.*update.*set/i
    ];

    return dangerousPatterns.some(pattern => pattern.test(query));
  }

  private async findXSSPatterns(): Promise<Array<{ code: string; file: string; line: number }>> {
    // This would scan for unescaped user input in responses
    return [];
  }

  private async findCSRFVulnerableEndpoints(): Promise<Array<{ method: string; path: string; file: string; line: number }>> {
    // This would scan for endpoints without CSRF protection
    return [];
  }

  private async findIDORVulnerableEndpoints(): Promise<Array<{ method: string; path: string; file: string; line: number }>> {
    // This would scan for endpoints that don't verify user ownership
    return [];
  }

  private checkSecurityHeaders(): string[] {
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'Referrer-Policy',
      'Permissions-Policy'
    ];

    // This would check if headers are implemented
    // For now, return empty array
    return [];
  }

  private async findHardcodedSecrets(): Promise<Array<{ type: string; file: string; line: number }>> {
    // This would scan for hardcoded secrets
    return [];
  }

  private async findUnencryptedSensitiveData(): Promise<Array<{ type: string; file: string; line: number }>> {
    // This would scan for unencrypted sensitive data
    return [];
  }

  private async findUnprotectedEndpoints(): Promise<Array<{ method: string; path: string; file: string; line: number }>> {
    // This would scan for unprotected endpoints
    return [];
  }

  private async checkPackageVulnerabilities(): Promise<Array<{ package: string; description: string; severity: string; fixedVersion: string }>> {
    // This would check package.json for known vulnerabilities
    return [];
  }

  private calculateSecurityScore(vulnerabilities: SecurityVulnerability[]): number {
    const weights = { critical: 10, high: 7, medium: 4, low: 1 };
    const totalWeight = vulnerabilities.reduce((sum, vuln) => sum + weights[vuln.severity], 0);
    const maxWeight = vulnerabilities.length * 10; // Assume all critical
    return Math.max(0, 100 - (totalWeight / maxWeight) * 100);
  }

  private determineAuditStatus(score: number, vulnerabilities: SecurityVulnerability[]): 'passed' | 'failed' | 'warning' {
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length;
    const highVulns = vulnerabilities.filter(v => v.severity === 'high').length;

    if (criticalVulns > 0) return 'failed';
    if (highVulns > 2 || score < 70) return 'warning';
    return 'passed';
  }

  private generateSecurityRecommendations(vulnerabilities: SecurityVulnerability[]): string[] {
    const recommendations: string[] = [];

    const vulnTypes = new Set(vulnerabilities.map(v => v.type));
    
    if (vulnTypes.has('sql_injection')) {
      recommendations.push('Implement parameterized queries and input validation');
    }
    
    if (vulnTypes.has('xss')) {
      recommendations.push('Implement output encoding and Content Security Policy');
    }
    
    if (vulnTypes.has('csrf')) {
      recommendations.push('Implement CSRF tokens for state-changing operations');
    }
    
    if (vulnTypes.has('insecure_direct_object_reference')) {
      recommendations.push('Implement proper authorization checks');
    }
    
    if (vulnTypes.has('security_misconfiguration')) {
      recommendations.push('Implement security headers and secure configurations');
    }
    
    if (vulnTypes.has('sensitive_data_exposure')) {
      recommendations.push('Encrypt sensitive data and remove hardcoded secrets');
    }
    
    if (vulnTypes.has('missing_function_level_access_control')) {
      recommendations.push('Implement authentication and authorization middleware');
    }
    
    if (vulnTypes.has('known_vulnerable_components')) {
      recommendations.push('Update vulnerable dependencies to latest secure versions');
    }

    return recommendations;
  }

  private async storeAuditResults(audit: SecurityAudit): Promise<void> {
    // Store audit results in database
    // This would be implemented based on your database schema
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private containsHTML(str: string): boolean {
    const htmlRegex = /<[^>]*>/;
    return htmlRegex.test(str);
  }

  private sanitizeString(str: string): string {
    return str
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
}

export default new SecurityHardeningService();





