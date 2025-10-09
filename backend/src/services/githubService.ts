// GitHub Service for PostHog Integration
// This service handles creating GitHub issues from PostHog events

interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
  assignees?: string[];
}

interface PostHogEvent {
  event: string;
  properties: any;
  timestamp: string;
  distinct_id: string;
}

export class GitHubService {
  private githubToken: string;
  private owner: string;
  private repo: string;

  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN || '';
    this.owner = process.env.GITHUB_OWNER || 'robertotorres';
    this.repo = process.env.GITHUB_REPO || 'verigrade-bookkeeping-platform';
  }

  async createIssueFromPostHogEvent(event: PostHogEvent): Promise<void> {
    if (!this.shouldCreateIssue(event)) {
      return;
    }

    const issue = this.mapEventToIssue(event);
    
    try {
      const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issue)
      });

      if (response.ok) {
        const createdIssue = await response.json();
        console.log(`✅ GitHub issue created: ${createdIssue.html_url}`);
      } else {
        console.error('❌ Failed to create GitHub issue:', await response.text());
      }
    } catch (error) {
      console.error('❌ Error creating GitHub issue:', error);
    }
  }

  private shouldCreateIssue(event: PostHogEvent): boolean {
    // Define which events should create GitHub issues
    const criticalEvents = [
      'mcp_analysis_error',
      'n8n_workflow_failed',
      'dashboard_error',
      'authentication_error',
      'performance_issue'
    ];

    const errorEvents = [
      'workflow_fallback_used',
      'analysis_failed'
    ];

    return criticalEvents.includes(event.event) || 
           errorEvents.includes(event.event) ||
           event.properties?.error;
  }

  private mapEventToIssue(event: PostHogEvent): GitHubIssue {
    const eventType = event.event;
    const properties = event.properties;

    let title = '';
    let body = '';
    let labels: string[] = [];

    switch (eventType) {
      case 'mcp_analysis_error':
        title = `🐛 MCP Analysis Error - ${new Date(event.timestamp).toLocaleDateString()}`;
        body = this.createMCPErrorIssueBody(properties);
        labels = ['bug', 'mcp', 'analysis'];
        break;

      case 'n8n_workflow_failed':
        title = `⚡ n8n Workflow Failure - ${new Date(event.timestamp).toLocaleDateString()}`;
        body = this.createN8nErrorIssueBody(properties);
        labels = ['bug', 'n8n', 'workflow'];
        break;

      case 'workflow_fallback_used':
        title = `🔄 n8n Fallback Used - ${new Date(event.timestamp).toLocaleDateString()}`;
        body = this.createFallbackIssueBody(properties);
        labels = ['enhancement', 'n8n', 'infrastructure'];
        break;

      case 'dashboard_error':
        title = `📊 Dashboard Error - ${new Date(event.timestamp).toLocaleDateString()}`;
        body = this.createDashboardErrorIssueBody(properties);
        labels = ['bug', 'frontend', 'dashboard'];
        break;

      case 'authentication_error':
        title = `🔐 Authentication Issue - ${new Date(event.timestamp).toLocaleDateString()}`;
        body = this.createAuthErrorIssueBody(properties);
        labels = ['bug', 'authentication', 'security'];
        break;

      default:
        title = `📝 PostHog Event: ${eventType} - ${new Date(event.timestamp).toLocaleDateString()}`;
        body = this.createGenericIssueBody(event);
        labels = ['analytics', 'posthog'];
    }

    return {
      title,
      body,
      labels,
      assignees: ['robertotorres'] // Assign to you by default
    };
  }

  private createMCPErrorIssueBody(properties: any): string {
    return `
## 🐛 MCP Analysis Error

**Timestamp:** ${new Date(properties.timestamp).toISOString()}
**User:** ${properties.distinct_id || 'Unknown'}
**Source:** ${properties.source || 'Unknown'}

### Error Details:
\`\`\`
${properties.error || 'No error details available'}
\`\`\`

### Context:
- **Analysis Type:** ${properties.analysis_type || 'Unknown'}
- **Confidence:** ${properties.confidence || 'N/A'}
- **Workflow Mode:** ${properties.mode || 'Unknown'}

### Steps to Reproduce:
1. Navigate to dashboard
2. Click "Run Analysis" in MCP Integration section
3. Error occurs during analysis

### Expected Behavior:
Analysis should complete successfully and return insights

### Actual Behavior:
Analysis fails with the error above

---
*This issue was automatically created from PostHog analytics data*
    `.trim();
  }

  private createN8nErrorIssueBody(properties: any): string {
    return `
## ⚡ n8n Workflow Failure

**Timestamp:** ${new Date(properties.timestamp).toISOString()}
**Workflow ID:** ${properties.workflow_id || 'Unknown'}
**User:** ${properties.distinct_id || 'Unknown'}

### Error Details:
\`\`\`
${properties.error || 'No error details available'}
\`\`\`

### Context:
- **Response Status:** ${properties.response_status || 'Unknown'}
- **Webhook URL:** ${properties.webhook_url || 'Unknown'}
- **Retry Count:** ${properties.retry_count || 0}

### Steps to Reproduce:
1. Trigger MCP analysis from dashboard
2. n8n workflow execution fails
3. Error response received

### Expected Behavior:
n8n workflow should execute successfully

### Actual Behavior:
Workflow fails with HTTP error

---
*This issue was automatically created from PostHog analytics data*
    `.trim();
  }

  private createFallbackIssueBody(properties: any): string {
    return `
## 🔄 n8n Fallback Used

**Timestamp:** ${new Date(properties.timestamp).toISOString()}
**User:** ${properties.distinct_id || 'Unknown'}

### Context:
The system automatically fell back to direct MCP analysis because the n8n workflow was unavailable.

### Details:
- **Fallback Mode:** ${properties.fallback_mode || 'direct_mcp'}
- **Original Error:** ${properties.error || 'n8n service unavailable'}
- **Workflow ID:** ${properties.workflow_id || 'verigrade-mcp-integration'}

### Recommendation:
This suggests the n8n cloud instance may need attention or the workflow needs to be reactivated.

### Action Items:
- [ ] Check n8n cloud instance status
- [ ] Verify workflow is active
- [ ] Test webhook connectivity
- [ ] Consider improving fallback mechanism

---
*This issue was automatically created from PostHog analytics data*
    `.trim();
  }

  private createDashboardErrorIssueBody(properties: any): string {
    return `
## 📊 Dashboard Error

**Timestamp:** ${new Date(properties.timestamp).toISOString()}
**User:** ${properties.distinct_id || 'Unknown'}

### Error Details:
\`\`\`
${properties.error || 'No error details available'}
\`\`\`

### Context:
- **Section:** ${properties.section || 'Unknown'}
- **Action:** ${properties.action || 'Unknown'}
- **Page:** ${properties.page || 'Unknown'}

### Steps to Reproduce:
1. Navigate to dashboard
2. Perform action that caused error
3. Error occurs

### Expected Behavior:
Dashboard should function normally

### Actual Behavior:
Error occurs in dashboard

---
*This issue was automatically created from PostHog analytics data*
    `.trim();
  }

  private createAuthErrorIssueBody(properties: any): string {
    return `
## 🔐 Authentication Error

**Timestamp:** ${new Date(properties.timestamp).toISOString()}
**User:** ${properties.distinct_id || 'Unknown'}

### Error Details:
\`\`\`
${properties.error || 'No error details available'}
\`\`\`

### Context:
- **Action:** ${properties.action || 'Unknown'}
- **Email:** ${properties.email || 'Unknown'}
- **IP Address:** ${properties.ip || 'Unknown'}

### Steps to Reproduce:
1. Attempt authentication action
2. Error occurs

### Expected Behavior:
Authentication should work normally

### Actual Behavior:
Authentication fails

---
*This issue was automatically created from PostHog analytics data*
    `.trim();
  }

  private createGenericIssueBody(event: PostHogEvent): string {
    return `
## 📝 PostHog Event: ${event.event}

**Timestamp:** ${new Date(event.timestamp).toISOString()}
**User:** ${event.distinct_id || 'Unknown'}

### Event Properties:
\`\`\`json
${JSON.stringify(event.properties, null, 2)}
\`\`\`

### Context:
This event was flagged for GitHub issue creation based on PostHog analytics data.

---
*This issue was automatically created from PostHog analytics data*
    `.trim();
  }
}

export default GitHubService;




