# VeriGrade - Advanced AI-Powered Bookkeeping Platform

![VeriGrade Logo](https://via.placeholder.com/200x60/3B82F6/FFFFFF?text=VeriGrade)

## 🚀 Overview

VeriGrade is a cutting-edge, AI-powered bookkeeping platform that combines the best features of QuickBooks and Zeni AI. Built with modern web technologies, it provides real-time financial insights, automated categorization, and advanced analytics for businesses of all sizes.

## ✨ Key Features

### 🤖 AI-Powered Intelligence
- **Automated Transaction Categorization**: Machine learning algorithms automatically categorize expenses and income
- **Anomaly Detection**: AI identifies unusual spending patterns and potential fraud
- **Cash Flow Prediction**: Predictive analytics for better financial planning
- **Smart Insights**: AI-generated recommendations for cost optimization

### 📊 Advanced Analytics & Reporting
- **Real-time Dashboard**: Live financial metrics with interactive visualizations
- **Custom Reports**: Generate detailed financial reports with drag-and-drop builder
- **Trend Analysis**: Historical data analysis with forecasting
- **Multi-currency Support**: Handle international transactions seamlessly

### 🔗 Integrations & Automation
- **Bank Connections**: Secure integration with 12,000+ financial institutions via Plaid
- **n8n Workflows**: Custom automation workflows for invoice processing
- **PostHog Analytics**: Advanced user behavior tracking and insights
- **GitHub Integration**: Automatic issue creation for bug tracking

### 🛡️ Security & Compliance
- **Enterprise Security**: AES-256 encryption, SOC 2 compliance
- **Multi-factor Authentication**: Enhanced security with MFA support
- **Audit Logging**: Complete audit trail for all financial activities
- **GDPR Compliance**: Full data protection and privacy controls

### 📱 Modern User Experience
- **Progressive Web App**: Install as native app on any device
- **Dark Mode**: System preference detection with manual toggle
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Advanced UI Components**: Sophisticated interactions with Framer Motion animations

## 🏗️ Architecture

### Frontend Stack
- **Next.js 15.5.4**: React framework with App Router
- **TypeScript**: Full type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Advanced animations and interactions
- **Heroicons**: Consistent iconography
- **TanStack Query**: Data fetching and caching

### Backend Stack
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **JWT**: Authentication and authorization

### Infrastructure
- **Docker**: Containerization
- **Nginx**: Reverse proxy and load balancer
- **Vercel**: Frontend deployment
- **Railway/Render**: Backend deployment options

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/verigrade-bookkeeping-platform.git
   cd verigrade-bookkeeping-platform
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend-new
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Frontend (.env.local)
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
   
   # Backend (.env)
   DATABASE_URL=postgresql://username:password@localhost:5432/verigrade
   JWT_SECRET=your-super-secret-jwt-key
   PLALD_CLIENT_ID=your_plaid_client_id
   PLALD_SECRET=your_plaid_secret
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend-new
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Advanced Features: http://localhost:3000/advanced
   - Component Demo: http://localhost:3000/advanced-demo

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.yml up -d
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Token verification

### Financial Data Endpoints
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/reports` - Financial reports
- `POST /api/analytics/insights` - AI insights

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
cd frontend-new
npm test

# Backend tests
cd backend
npm test

# E2E tests
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Railway/Render (Backend)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with automatic SSL certificates

### Custom Server
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📖 Advanced Features

### Real-time Dashboard
Access the advanced dashboard at `/advanced` to see:
- Live financial metrics
- Interactive charts and visualizations
- AI-powered insights and recommendations
- Real-time data updates

### Component Library
Explore the component showcase at `/advanced-demo` featuring:
- Advanced data tables with filtering and sorting
- Interactive modal system
- Chart components with multiple types
- Notification system with priority levels

### Custom Workflows
Set up n8n workflows for:
- Automated invoice processing
- Bank transaction reconciliation
- Report generation and distribution
- Custom business logic automation

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_PLAID_ENV=sandbox
```

#### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/verigrade
JWT_SECRET=your-super-secret-jwt-key
PLALD_CLIENT_ID=your_plaid_client_id
PLALD_SECRET=your_plaid_secret
OPENAI_API_KEY=your_openai_key
POSTHOG_API_KEY=your_posthog_key
GITHUB_TOKEN=your_github_token
```

### Database Configuration
The application uses Prisma ORM with PostgreSQL. Key models include:
- User management and authentication
- Financial transactions and categorization
- Invoice and expense tracking
- Analytics and reporting data
- Audit logs and compliance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.verigrade.com](https://docs.verigrade.com)
- **Community**: [Discord Server](https://discord.gg/verigrade)
- **Email**: support@verigrade.com
- **Issues**: [GitHub Issues](https://github.com/your-username/verigrade-bookkeeping-platform/issues)

## 🙏 Acknowledgments

- Built with ❤️ using Next.js and modern web technologies
- Inspired by QuickBooks and Zeni AI
- Powered by OpenAI GPT-4 for AI features
- Analytics by PostHog
- Icons by Heroicons

---

**VeriGrade** - Revolutionizing bookkeeping with AI-powered insights and modern technology.