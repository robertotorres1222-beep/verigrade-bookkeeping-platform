# Enterprise Features

This document describes the comprehensive enterprise features implemented in the VeriGrade Bookkeeping Platform, including multi-company management, SSO authentication, white-label branding, granular permissions, and API access management.

## Overview

The enterprise features provide large organizations with the tools they need to manage multiple companies, enforce security policies, customize branding, and maintain granular control over user access and API usage.

## Multi-Company Management

### Organization Hierarchy
- **Enterprise Structure**: Support for parent-subsidiary relationships
- **Data Isolation**: Complete data separation between organizations
- **Company Switching**: Seamless switching between different companies
- **Consolidated Reporting**: Cross-company financial reporting and analysis

### Key Features
- Organization creation and management
- User assignment to multiple organizations
- Role-based access control per organization
- Inter-company transaction management
- Consolidated financial reporting

### API Endpoints
```
POST /api/organizations - Create organization
GET /api/organizations/:id - Get organization details
GET /api/organizations/:id/hierarchy - Get organization hierarchy
PUT /api/organizations/:id/settings - Update organization settings
PUT /api/organizations/:id/branding - Update organization branding
POST /api/organizations/:id/users - Add user to organization
GET /api/organizations/:id/users - Get organization users
POST /api/organizations/:id/roles - Create organization role
GET /api/organizations/:id/roles - Get organization roles
POST /api/organizations/:id/inter-company - Create inter-company transaction
POST /api/organizations/inter-company/:id/approve - Approve transaction
GET /api/organizations/:id/inter-company - Get inter-company transactions
POST /api/organizations/consolidated-report - Generate consolidated report
```

## SSO Authentication

### SAML 2.0 Support
- **Metadata Generation**: Automatic SAML metadata generation
- **Authentication Flow**: Complete SAML authentication workflow
- **Logout Support**: SAML logout with proper session termination
- **Attribute Mapping**: Flexible attribute to role mapping

### OAuth 2.0 Providers
- **Google**: Google Workspace integration
- **Microsoft**: Azure AD and Microsoft 365 integration
- **GitHub**: GitHub organization integration
- **Custom Providers**: Support for additional OAuth providers

### Key Features
- Just-In-Time (JIT) user provisioning
- Role mapping from SSO attributes
- Session management
- Multi-factor authentication support

### API Endpoints
```
GET /api/sso/saml/metadata - Get SAML metadata
POST /api/sso/saml/:organizationId/auth - Initiate SAML auth
POST /api/sso/saml/response - Handle SAML response
POST /api/sso/saml/logout - Initiate SAML logout
POST /api/sso/saml/logout/response - Handle SAML logout
GET /api/sso/oauth/providers - Get OAuth providers
GET /api/sso/oauth/:providerId/auth - Initiate OAuth auth
GET /api/sso/oauth/:providerId/callback - Handle OAuth callback
POST /api/sso/oauth/:providerId/userinfo - Get OAuth user info
POST /api/sso/verify-token - Verify JWT token
```

## White-Label Branding

### Custom Branding
- **Logo Management**: Upload and manage organization logos
- **Color Schemes**: Custom primary, secondary, and accent colors
- **Typography**: Custom font family selection
- **Email Templates**: Customizable email templates with variables
- **Mobile App Branding**: Custom app icons and splash screens

### Custom Domains
- **Domain Setup**: Custom domain configuration
- **SSL Certificates**: Automatic SSL certificate management
- **DNS Verification**: Domain ownership verification
- **Subdomain Support**: Support for subdomains and custom domains

### Key Features
- Real-time branding updates
- CSS generation for custom themes
- Mobile app configuration
- Email template management
- Domain verification and management

### API Endpoints
```
PUT /api/branding/:organizationId - Update branding
GET /api/branding/:organizationId - Get branding
POST /api/branding/:organizationId/email-templates - Create email template
GET /api/branding/:organizationId/email-templates - Get email templates
PUT /api/branding/email-templates/:id - Update email template
POST /api/branding/email-templates/:id/render - Render email template
POST /api/branding/:organizationId/domains - Setup custom domain
POST /api/branding/domains/:id/verify - Verify custom domain
GET /api/branding/:organizationId/domains - Get custom domains
GET /api/branding/:organizationId/css - Generate custom CSS
GET /api/branding/:organizationId/mobile-config - Get mobile app config
GET /api/branding/:organizationId/assets - Get branding assets
```

## Granular Permissions

### Role-Based Access Control (RBAC)
- **System Roles**: Pre-defined system roles (Admin, Manager, Accountant, User)
- **Custom Roles**: Organization-specific role creation
- **Permission Sets**: Granular permission management
- **Resource-Level Permissions**: Fine-grained access control

### Permission Categories
- **User Management**: User creation, editing, deletion, invitation
- **Organization Management**: Organization settings and branding
- **Financial Data**: Transaction and invoice management
- **Reports**: Report creation and export
- **Integrations**: Integration management and sync
- **API Access**: API key management and access control
- **Settings**: System configuration
- **Audit**: Audit log access and export

### Key Features
- Hierarchical permission inheritance
- Resource-specific permissions
- Wildcard permissions
- Permission validation middleware
- Role-based route protection

### API Endpoints
```
GET /api/permissions - Get all permissions
GET /api/permissions/resource/:resource - Get permissions by resource
POST /api/organizations/:id/roles - Create organization role
GET /api/organizations/:id/roles - Get organization roles
PUT /api/roles/:id/permissions - Update role permissions
```

## API Key Management

### API Key Features
- **Key Generation**: Secure API key and secret generation
- **Permission Scoping**: API keys with specific permissions
- **Rate Limiting**: Per-key rate limiting configuration
- **IP Restrictions**: IP address allowlisting
- **Expiration**: Optional key expiration dates
- **Usage Tracking**: Comprehensive usage analytics

### Rate Limiting
- **Per-Key Limits**: Individual rate limits per API key
- **Window-Based**: Time-window based rate limiting
- **Burst Protection**: Protection against API abuse
- **Monitoring**: Real-time rate limit monitoring

### Usage Analytics
- **Request Tracking**: Detailed request logging
- **Performance Metrics**: Response time and success rate tracking
- **Endpoint Analytics**: Most-used endpoints and methods
- **Error Tracking**: Failed request analysis
- **Usage Reports**: Comprehensive usage reporting

### API Endpoints
```
POST /api/api-keys/:organizationId - Create API key
GET /api/api-keys/:organizationId - Get organization API keys
GET /api/api-keys/key/:id - Get API key details
PUT /api/api-keys/:id - Update API key
DELETE /api/api-keys/:id - Delete API key
POST /api/api-keys/:id/regenerate-secret - Regenerate secret
GET /api/api-keys/:id/usage - Get API key usage
POST /api/api-keys/validate - Validate API key
POST /api/api-keys/rate-limit - Check rate limit
POST /api/api-keys/usage - Record usage
```

## Security Features

### Data Isolation
- **Organization Scoping**: All data scoped to organization
- **User Access Control**: Users can only access their organization's data
- **Cross-Organization Protection**: Prevents unauthorized cross-organization access

### Authentication Security
- **JWT Tokens**: Secure JWT token management
- **Session Management**: Proper session handling
- **Token Refresh**: Automatic token refresh
- **Multi-Factor Authentication**: MFA support for enhanced security

### API Security
- **API Key Validation**: Secure API key validation
- **Rate Limiting**: Protection against abuse
- **IP Restrictions**: IP-based access control
- **Audit Logging**: Comprehensive audit trails

## Configuration

### Environment Variables
```bash
# SAML Configuration
SAML_ENTITY_ID=your-entity-id
SAML_SSO_URL=https://your-idp.com/sso
SAML_CERTIFICATE=your-certificate
SAML_PRIVATE_KEY=your-private-key

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# API Configuration
API_RATE_LIMIT_WINDOW=3600
API_RATE_LIMIT_MAX_REQUESTS=1000
```

## Usage Examples

### Creating an Organization
```javascript
const response = await fetch('/api/organizations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Acme Corporation',
    type: 'enterprise',
    settings: {
      timezone: 'America/New_York',
      currency: 'USD',
      complianceLevel: 'enterprise'
    },
    branding: {
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      logo: 'https://example.com/logo.png'
    }
  })
});
```

### Setting up SAML Authentication
```javascript
// Get SAML metadata
const metadata = await fetch('/api/sso/saml/metadata');

// Initiate SAML authentication
const authResponse = await fetch('/api/sso/saml/org-123/auth', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
const { authUrl } = await authResponse.json();

// Redirect user to authUrl
window.location.href = authUrl;
```

### Creating API Key
```javascript
const response = await fetch('/api/api-keys/org-123', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Mobile App Key',
    permissions: ['transactions:read', 'invoices:read'],
    rateLimit: { requests: 1000, window: 3600 },
    allowedIPs: ['192.168.1.0/24'],
    expiresAt: '2024-12-31T23:59:59Z'
  })
});
```

### Using API Key
```javascript
const response = await fetch('/api/transactions', {
  headers: {
    'Authorization': `Bearer ${apiKey}:${secret}`,
    'X-API-Key': apiKey,
    'X-API-Secret': secret
  }
});
```

## Monitoring and Analytics

### Organization Analytics
- User activity tracking
- Feature usage analytics
- Performance metrics
- Security event monitoring

### API Usage Analytics
- Request volume tracking
- Response time monitoring
- Error rate analysis
- Endpoint popularity

### Security Monitoring
- Failed authentication attempts
- Suspicious activity detection
- Permission escalation attempts
- API abuse detection

## Best Practices

### Security
- Use strong API keys with appropriate permissions
- Implement IP restrictions for sensitive operations
- Regular security audits and penetration testing
- Monitor for suspicious activity

### Performance
- Set appropriate rate limits
- Monitor API usage patterns
- Implement caching where appropriate
- Use connection pooling for database operations

### Compliance
- Maintain audit logs for all operations
- Implement data retention policies
- Ensure GDPR compliance for user data
- Regular compliance reviews

## Troubleshooting

### Common Issues
- **SAML Authentication Failures**: Check certificate validity and configuration
- **OAuth Provider Issues**: Verify client credentials and redirect URIs
- **Permission Denied**: Check user roles and permissions
- **API Rate Limiting**: Adjust rate limits or implement backoff strategies

### Debugging
- Enable detailed logging for authentication flows
- Monitor API usage patterns
- Check organization data isolation
- Verify permission assignments

## Future Enhancements

### Planned Features
- Advanced audit reporting
- Custom permission sets
- Advanced SSO providers
- Enhanced white-label options
- API versioning support
- Advanced analytics dashboard

### Integration Opportunities
- Enterprise identity providers
- Advanced security tools
- Compliance management systems
- Business intelligence platforms







