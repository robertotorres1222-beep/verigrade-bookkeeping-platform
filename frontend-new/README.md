# VeriGrade Bookkeeping Platform - Frontend

Modern, AI-powered bookkeeping platform built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **AI-Powered Receipt Processing** - Automatically extract and categorize transactions
- **Real-time Analytics** - Get instant insights into your business performance
- **Multi-Currency Support** - Handle transactions in 100+ currencies
- **Bank Reconciliation** - Automatically match bank transactions
- **Modern UI/UX** - Beautiful, responsive design with smooth animations
- **PWA Support** - Progressive Web App capabilities

## 📋 Prerequisites

- Node.js 22.x (see `.nvmrc`)
- npm or yarn
- Access to VeriGrade backend API
- Supabase account (for authentication and storage)

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Required environment variables:

- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., `https://verigradebackend-production.up.railway.app`)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NODE_ENV` - Environment (development/production)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run dev:turbo` - Start with Turbopack (faster)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without emitting files
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run analyze` - Analyze bundle size

## 🏗️ Project Structure

```
frontend-new/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── lib/          # Utility functions
│   ├── hooks/        # Custom React hooks
│   ├── services/     # API services
│   └── config/       # Configuration files
├── public/           # Static assets
├── prisma/           # Prisma schema (if used)
└── ...config files
```

## 🚢 Deployment

### Vercel (Recommended)

This project is configured for Vercel deployment:

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

The `vercel.json` in the root directory is already configured.

### Docker

If deploying with Docker:

```bash
docker build -f Dockerfile.prod -t verigrade-frontend .
docker run -p 3000:3000 verigrade-frontend
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

For watch mode:

```bash
npm run test:watch
```

## 🎨 UI Components

The project uses a modern design system with:

- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

Key components:
- `EnhancedCard` - Modern card variants
- `ModernButton` - Gradient buttons with states
- `ModernInput` - Inputs with floating labels
- `StatCard` - Dashboard stat cards
- `FeatureCard` - Feature showcase cards

## 📚 Documentation

- [API Documentation](./src/docs/APIReference.md)
- [Developer Guide](./src/docs/DeveloperGuide.md)
- [User Guide](./src/docs/UserGuide.md)
- [Troubleshooting](./src/docs/TroubleshootingGuide.md)

## 🔧 Configuration

### Next.js Config

See `next.config.ts` for:
- Image optimization settings
- API rewrites
- Bundle optimizations
- TypeScript configuration

### Tailwind Config

See `tailwind.config.js` for:
- Color palette
- Typography scale
- Custom animations
- Design tokens

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

Private - VeriGrade Team

## 🔗 Links

- Production URL: [https://www.verigradebookkeeping.com](https://www.verigradebookkeeping.com)
- Backend API: [https://verigradebackend-production.up.railway.app](https://verigradebackend-production.up.railway.app)
